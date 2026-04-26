import { validationResult } from "express-validator";
import {
  crearPersona,
  listarPersonas,
  obtenerPersonaPorDocumento,
  obtenerPersonaPorId,
  obtenerPersonaPorEmail,
  validarExistenciaPersona,
  actualizarPersona,
} from "../services/personas.service.js";

// ── Auth lookup con timeout ───────────────────────────────────────────────────
const AUTH_TIMEOUT_MS = 4000;

function buildAuthApiUrl() {
  const base = process.env.AUTH_SERVICE_URL || "http://ms-auth-service:8001";
  return base.endsWith("/api") ? base : `${base}/api`;
}

async function fetchUserByEmail(email) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);
  try {
    const url = `${buildAuthApiUrl()}/usuarios/email/${encodeURIComponent(email)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (res.ok) {
      const body = await res.json();
      return body.data || null;
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export async function crearPersonaController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    const persona = await crearPersona(req.body);
    const requesterRole = req.headers["x-user-role"];

    // Auto-crear usuario agente para supervisor (fire-and-forget)
    if (requesterRole === "supervisor") {
      const authApiUrl = buildAuthApiUrl();
      fetch(`${authApiUrl}/usuarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": req.headers["authorization"] || "",
          "x-user-role": requesterRole,
        },
        body: JSON.stringify({
          username: persona.numero_documento,
          email: persona.email,
          password: persona.numero_documento,
          rol: "agente",
          estado: "activo",
        }),
      }).catch(err => console.error("[personas] Error auto-creando usuario agente:", err.message));
    }

    return res.status(201).json({
      ok: true,
      message: "Persona creada correctamente",
      data: persona,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      const details = error.errors.map(e => `${e.path}: ${e.value}`).join(", ");
      return res.status(409).json({
        ok: false,
        message: `Ya existe un registro con estos datos únicos (${details})`,
      });
    }
    return res.status(500).json({ ok: false, message: error.message });
  }
}

export async function listarPersonasController(req, res) {
  try {
    const userRole = req.headers["x-user-role"];
    const page = req.query.page || 1;
    const limit = req.query.limit || 50;

    // Admin/ciudadano: listado directo con paginación
    if (userRole !== "supervisor" && userRole !== "agente") {
      const personas = await listarPersonas({ page, limit });
      return res.json({ ok: true, data: personas });
    }

    // Supervisor/Agente: filtrar por emails permitidos desde ms-auth
    // Esta llamada es necesaria por la arquitectura multi-servicio.
    // Se mitiga solicitando solo emails (no el objeto completo).
    let allowedEmails = null;
    try {
      const authApiUrl = buildAuthApiUrl();
      const response = await fetch(`${authApiUrl}/usuarios`, {
        headers: {
          "Authorization": req.headers["authorization"] || "",
          "x-user-role": userRole,
        },
        signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
      });

      if (response.ok) {
        const result = await response.json();
        const users = result.data || [];
        allowedEmails = new Set(users.map(u => u.email?.toLowerCase()).filter(Boolean));
      }
    } catch {
      // Si falla ms-auth, por seguridad retornamos lista vacía
      return res.json({ ok: true, data: [] });
    }

    if (!allowedEmails || allowedEmails.size === 0) {
      return res.json({ ok: true, data: [] });
    }

    // Traer personas sin paginación extra aquí porque el filtro de emails
    // ya viene con el set correcto. Usar limit alto para capturar todos.
    const personas = await listarPersonas({ limit: 1000, page: 1 });
    const filtered = personas.filter(p => p.email && allowedEmails.has(p.email.toLowerCase()));

    return res.json({ ok: true, data: filtered });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}

export async function obtenerPersonaPorIdController(req, res) {
  try {
    const { persona_id } = req.params;
    const persona = await obtenerPersonaPorId(persona_id);

    if (!persona) {
      return res.status(404).json({ ok: false, message: "Persona no encontrada" });
    }

    const userRole = req.headers["x-user-role"];
    const callerEmail = req.headers["x-user-email"];

    // Admin y ciudadano viendo su propio perfil: acceso directo sin llamada a ms-auth
    if (userRole === "admin") {
      return res.json({ ok: true, data: persona });
    }

    if (callerEmail && persona.email && callerEmail.toLowerCase() === persona.email.toLowerCase()) {
      return res.json({ ok: true, data: persona });
    }

    // Agente/supervisor viendo perfil ajeno: verificar rol del target en ms-auth
    if (userRole === "agente" || userRole === "supervisor") {
      const targetUser = await fetchUserByEmail(persona.email);
      const allowedRoles = userRole === "agente" ? ["ciudadano"] : ["agente", "ciudadano"];

      if (!targetUser || !allowedRoles.includes(targetUser.rol)) {
        return res.status(403).json({
          ok: false,
          message: `No tienes permiso para ver los datos de esta persona (${userRole})`,
        });
      }
    }

    return res.json({ ok: true, data: persona });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}

export async function obtenerPersonaPorDocumentoController(req, res) {
  try {
    const { numero } = req.params;
    const persona = await obtenerPersonaPorDocumento(numero);

    if (!persona) {
      return res.status(404).json({ ok: false, message: "Persona no encontrada" });
    }

    const userRole = req.headers["x-user-role"];
    const callerEmail = req.headers["x-user-email"];

    if (userRole === "admin") return res.json({ ok: true, data: persona });
    if (callerEmail && persona.email?.toLowerCase() === callerEmail.toLowerCase()) {
      return res.json({ ok: true, data: persona });
    }

    if (userRole === "agente" || userRole === "supervisor") {
      const targetUser = await fetchUserByEmail(persona.email);
      const allowedRoles = userRole === "agente" ? ["ciudadano"] : ["agente", "ciudadano"];

      if (!targetUser || !allowedRoles.includes(targetUser.rol)) {
        return res.status(403).json({
          ok: false,
          message: `No tienes permiso para ver los datos de esta persona (${userRole})`,
        });
      }
    }

    return res.json({ ok: true, data: persona });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}

export async function validarExistenciaPersonaController(req, res) {
  try {
    const { numero } = req.params;
    const result = await validarExistenciaPersona(numero);
    return res.json({ ok: true, data: result });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}

export async function obtenerPersonaPorEmailController(req, res) {
  try {
    const { email } = req.params;
    const persona = await obtenerPersonaPorEmail(email);

    if (!persona) {
      return res.status(404).json({ ok: false, message: "Persona no encontrada" });
    }

    const userRole = req.headers["x-user-role"];
    const callerEmail = req.headers["x-user-email"];

    if (userRole === "admin") return res.json({ ok: true, data: persona });
    if (callerEmail && persona.email?.toLowerCase() === callerEmail.toLowerCase()) {
      return res.json({ ok: true, data: persona });
    }

    if (userRole === "agente" || userRole === "supervisor") {
      const targetUser = await fetchUserByEmail(persona.email);
      const allowedRoles = userRole === "agente" ? ["ciudadano"] : ["agente", "ciudadano"];

      if (!targetUser || !allowedRoles.includes(targetUser.rol)) {
        return res.status(403).json({
          ok: false,
          message: `No tienes permiso para ver los datos de esta persona (${userRole})`,
        });
      }
    }

    return res.json({ ok: true, data: persona });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}

export async function actualizarPersonaController(req, res) {
  try {
    const { persona_id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ ok: false, errors: errors.array() });
    }

    const requesterRole = req.headers["x-user-role"];
    const isInternalSync = req.headers["x-internal-sync"] === "true";

    const personaActual = await obtenerPersonaPorId(persona_id);
    if (!personaActual) {
      return res.status(404).json({ ok: false, message: "Persona no encontrada" });
    }

    const isOwnProfile = personaActual.email === req.headers["x-user-email"];

    // ── Resolución de permisos ─────────────────────────────────────────────
    // Admin: siempre puede, sin llamada a ms-auth
    // Perfil propio: siempre puede (campos limitados), sin llamada a ms-auth
    // Agente/Supervisor editando perfil ajeno: necesita saber rol del target → 1 fetch

    let canUpdate = false;
    let allowedFields = [];
    let targetRole = null;

    if (requesterRole === "admin") {
      canUpdate = true;
      allowedFields = ["tipo_documento", "numero_documento", "nombres", "apellidos",
        "fecha_nacimiento", "genero", "direccion", "telefono", "email", "estado"];
    } else if (isOwnProfile) {
      canUpdate = true;
      if (requesterRole === "agente" || requesterRole === "supervisor") {
        allowedFields = ["nombres", "apellidos", "email", "direccion", "telefono"];
      } else if (requesterRole === "ciudadano") {
        allowedFields = ["email", "direccion"];
      }
    } else if (requesterRole === "agente" || requesterRole === "supervisor") {
      // Solo aquí necesitamos saber el rol del target — llamada lazy a ms-auth
      const targetUser = await fetchUserByEmail(personaActual.email);
      targetRole = targetUser?.rol || null;

      if (requesterRole === "agente" && targetRole === "ciudadano") {
        canUpdate = true;
        allowedFields = ["tipo_documento", "numero_documento", "nombres", "apellidos",
          "fecha_nacimiento", "genero", "direccion", "telefono", "email", "estado"];
      } else if (requesterRole === "supervisor" && (targetRole === "agente" || targetRole === "ciudadano")) {
        canUpdate = true;
        allowedFields = ["tipo_documento", "numero_documento", "nombres", "apellidos",
          "fecha_nacimiento", "genero", "direccion", "telefono", "email", "estado"];
      }
    }

    if (!canUpdate) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para actualizar este perfil",
      });
    }

    // Filtrar campos permitidos
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ ok: false, message: "No hay campos válidos para actualizar" });
    }

    // Restricción de inactivar para no-admins
    if (updateData.estado === "inactivo" && requesterRole !== "admin") {
      if (!(requesterRole === "supervisor" && targetRole === "agente")) {
        return res.status(403).json({
          ok: false,
          message: "Solo los administradores y supervisores (para agentes) pueden inhabilitar personas",
        });
      }
    }

    const persona = await actualizarPersona(persona_id, updateData, { skipAuthSync: isInternalSync });

    return res.json({ ok: true, message: "Persona actualizada correctamente", data: persona });
  } catch (error) {
    if (error.message === "Persona no encontrada") {
      return res.status(404).json({ ok: false, message: error.message });
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const details = error.errors.map(e => `${e.path}: ${e.value}`).join(", ");
      return res.status(409).json({
        ok: false,
        message: `Ya existe un registro con estos datos únicos (${details})`,
      });
    }
    return res.status(500).json({ ok: false, message: error.message });
  }
}
