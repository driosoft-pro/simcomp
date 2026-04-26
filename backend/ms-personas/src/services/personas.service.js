import Persona from "../models/persona.model.js";
import Licencia from "../models/licencia.model.js";
import { Op } from "sequelize";

/**
 * Helper para peticiones internas con timeout y manejo de errores silencioso
 */
async function syncFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 5000);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response.ok;
  } catch (err) {
    console.error(`[Sync] Error enviando a ${url}:`, err.message);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export async function crearPersona(data) {
  return Persona.create(data);
}

export async function listarPersonas({ page = 1, limit = 50, search = '', order = 'DESC', userRole = '', username = '', documento = '' } = {}) {
  const offset = (Math.max(1, page) - 1) * limit;
  const where = {};

  const normalizedRole = String(userRole || '').toLowerCase();

  // Restricción por rol: El ciudadano solo ve su propio registro
  if (normalizedRole === 'ciudadano') {
    const finalDoc = String(documento || username || '').replace('cc.', '').trim();
    if (finalDoc) {
      where.numero_documento = finalDoc;
    } else {
      // Si no hay documento asociado al usuario, no devolvemos nada
      return { rows: [], total: 0 };
    }
  }

  if (search) {
    const searchLower = search.toLowerCase();
    where[Op.or] = [
      { nombres: { [Op.iLike]: `%${searchLower}%` } },
      { apellidos: { [Op.iLike]: `%${searchLower}%` } },
      { numero_documento: { [Op.iLike]: `%${searchLower}%` } },
      { email: { [Op.iLike]: `%${searchLower}%` } },
    ];
  }

  const result = await Persona.findAndCountAll({
    where,
    limit: Number(limit),
    offset: Number(offset),
    order: [["created_at", order === 'ASC' ? 'ASC' : 'DESC']],
    include: [{ model: Licencia, as: "licencias" }],
  });
  return {
    rows: result.rows,
    total: result.count
  };
}

export async function obtenerPersonaPorId(id) {
  return Persona.findByPk(id, {
    include: [{ model: Licencia, as: "licencias" }],
  });
}

export async function obtenerPersonaPorDocumento(numero_documento) {
  return Persona.findOne({
    where: { numero_documento },
    include: [{ model: Licencia, as: "licencias" }],
  });
}

export async function obtenerPersonaPorEmail(email) {
  return Persona.findOne({
    where: { email },
    include: [{ model: Licencia, as: "licencias" }],
  });
}

export async function validarExistenciaPersona(numero_documento) {
  const persona = await Persona.findOne({ where: { numero_documento }, attributes: ["id"] });
  return !!persona;
}

/**
 * Actualiza una persona y sincroniza cambios críticos con otros microservicios
 */
export async function actualizarPersona(id, data, options = {}) {
  const persona = await Persona.findByPk(id);
  if (!persona) throw new Error("Persona no encontrada");

  const oldDoc = persona.numero_documento;
  const oldEmail = persona.email;
  const oldNombre = `${persona.nombres} ${persona.apellidos}`;

  // Actualizar en base de datos local
  await persona.update(data);

  const newDoc = persona.numero_documento;
  const newEmail = persona.email;
  const newNombre = `${persona.nombres} ${persona.apellidos}`;

  // Si no hay cambios críticos o se pide saltar sync, retornamos
  if (options.skipAuthSync) return persona;

  const docChanged = oldDoc !== newDoc;
  const emailChanged = oldEmail !== newEmail;
  const nameChanged = oldNombre !== newNombre;

  if (docChanged || emailChanged || nameChanged) {
    // Sincronización asíncrona (Fire-and-forget con allSettled)
    const syncs = [];

    // 1. ms-auth-service (Crítico para login)
    if (docChanged || emailChanged) {
      const authUrl = process.env.AUTH_SERVICE_URL || "http://ms-auth-service:8001";
      syncs.push(syncFetch(`${authUrl}/api/usuarios/sync`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-internal-sync": "true" },
        body: JSON.stringify({ oldEmail, newEmail, newUsername: newDoc }),
      }));
    }

    // 2. ms-automotores (Actualizar datos del propietario)
    if (docChanged || nameChanged) {
      const automotoresUrl = process.env.AUTOMOTORES_SERVICE_URL || "http://ms-automotores:8003";
      syncs.push(syncFetch(`${automotoresUrl}/api/sync/propietario`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-internal-sync": "true" },
        body: JSON.stringify({ oldDoc, newDoc, newNombre }),
      }));
    }

    // 3. ms-comparendos (Actualizar datos del ciudadano en multas)
    if (docChanged || nameChanged) {
      const comparendosUrl = process.env.COMPARENDOS_SERVICE_URL || "http://ms-comparendos:8002";
      syncs.push(syncFetch(`${comparendosUrl}/api/sync/ciudadano`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-internal-sync": "true" },
        body: JSON.stringify({ oldDoc, newDoc, newNombre }),
      }));
    }

    Promise.allSettled(syncs).then((results) => {
      const failures = results.filter(r => r.status === "rejected" || !r.value);
      if (failures.length > 0) {
        console.warn(`[Sync] Fallaron ${failures.length} sincronizaciones para ${newDoc}`);
      }
    });
  }

  return persona;
}

/**
 * Suspende todas las licencias de una persona (ej: por multa grave)
 */
export async function suspenderLicenciasPersona(persona_id) {
  return Licencia.update(
    { estado: "suspendida" },
    { where: { persona_id, estado: "vigente" } }
  );
}

/**
 * Reactiva licencias suspendidas
 */
export async function reactivarLicenciasPersona(persona_id) {
  return Licencia.update(
    { estado: "vigente" },
    { where: { persona_id, estado: "suspendida" } }
  );
}
