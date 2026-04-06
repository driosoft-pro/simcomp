import Persona from "../models/persona.model.js";
import Licencia from "../models/licencia.model.js";

export async function crearPersona(data) {
  const persona = await Persona.create({
    tipo_documento: data.tipo_documento,
    numero_documento: data.numero_documento,
    nombres: data.nombres,
    apellidos: data.apellidos,
    fecha_nacimiento: data.fecha_nacimiento,
    genero: data.genero,
    direccion: data.direccion,
    telefono: data.telefono,
    email: data.email,
    estado: data.estado ?? "activo",
  });

  return persona;
}

export async function listarPersonas() {
  return await Persona.findAll({
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Licencia,
        as: "licencias",
        required: false,
      },
    ],
  });
}

export async function obtenerPersonaPorId(id) {
  return await Persona.findByPk(id, {
    include: [
      {
        model: Licencia,
        as: "licencias",
        required: false,
      },
    ],
  });
}

export async function obtenerPersonaPorDocumento(numeroDocumento) {
  return await Persona.findOne({
    where: {
      numero_documento: numeroDocumento,
    },
    include: [
      {
        model: Licencia,
        as: "licencias",
        required: false,
      },
    ],
  });
}

export async function validarExistenciaPersona(numeroDocumento) {
  const persona = await Persona.findOne({
    where: {
      numero_documento: numeroDocumento,
    },
  });

  return {
    exists: !!persona,
    persona,
  };
}
export async function obtenerPersonaPorEmail(email) {
  return await Persona.findOne({
    where: {
      email,
    },
    include: [
      {
        model: Licencia,
        as: "licencias",
        required: false,
      },
    ],
  });
}

export async function actualizarPersona(id, data, options = {}) {
  const { skipAuthSync = false } = options;
  const persona = await Persona.findByPk(id);

  if (!persona) {
    throw new Error("Persona no encontrada");
  }

  const oldEmail = persona.email;
  const oldDocumento = persona.numero_documento;
  const oldNombreCompleto = `${persona.nombres} ${persona.apellidos}`.trim();

  await persona.update({
    tipo_documento: data.tipo_documento,
    numero_documento: data.numero_documento,
    nombres: data.nombres,
    apellidos: data.apellidos,
    fecha_nacimiento: data.fecha_nacimiento,
    genero: data.genero,
    direccion: data.direccion,
    telefono: data.telefono,
    email: data.email,
    estado: data.estado,
  });

  // Variables de detección de cambios
  const emailChanged = data.email && data.email !== oldEmail;
  const docChanged = data.numero_documento && data.numero_documento !== oldDocumento;
  const usernameRequested = !!data.username;

  // Cascading update to ms-auth-service via internal endpoint (no JWT needed)
  if (!skipAuthSync && (emailChanged || docChanged)) {
    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:8001";
      const authApiUrl = authServiceUrl.endsWith("/api/auth")
        ? authServiceUrl.replace("/auth", "")
        : authServiceUrl.endsWith("/api")
        ? authServiceUrl
        : `${authServiceUrl}/api`;

      const syncPayload = { oldDocumento };
      if (docChanged) syncPayload.newDocumento = data.numero_documento;
      if (emailChanged) syncPayload.newEmail = data.email;

      console.log(`[personas→auth] Sincronizando con ms-auth-service:`, syncPayload);
      const syncRes = await fetch(`${authApiUrl}/usuarios/internal/sync-persona`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(syncPayload),
      });

      if (!syncRes.ok) {
        const errBody = await syncRes.text();
        console.error(`[personas→auth] Error HTTP ${syncRes.status}: ${errBody}`);
      } else {
        const syncData = await syncRes.json();
        console.log(`[personas→auth] Respuesta sync-auth:`, syncData.message);
      }
    } catch (error) {
      console.error("[personas→auth] Error sincronizando con ms-auth-service:", error.message);
    }
  }

  // Cascading update to Licencias
  // Solo actualiza las licencias cuyo numero_licencia coincide con el documento anterior
  // (respeta licencias con números personalizados)
  if (docChanged) {
    try {
      const { Op } = await import("sequelize");
      const [affectedLicencias] = await Licencia.update(
        { numero_licencia: data.numero_documento },
        {
          where: {
            persona_id: id,
            numero_licencia: oldDocumento,
          },
        }
      );
      console.log(`[personas] Licencias actualizadas con nuevo documento: ${affectedLicencias}`);
    } catch (error) {
      console.error("[personas] Error actualizando licencias:", error.message);
    }
  }

  // Cascading update to ms-automotores and ms-comparendos
  const newNombreCompleto = `${persona.nombres} ${persona.apellidos}`.trim();
  const nameChanged = oldNombreCompleto !== newNombreCompleto;

  if (docChanged || nameChanged) {
    const payload = { oldDocumento };
    if (docChanged) payload.newDocumento = data.numero_documento;
    if (nameChanged) payload.newNombre = newNombreCompleto;

    // ms-automotores
    try {
      const automotoresServiceUrl = process.env.AUTOMOTORES_SERVICE_URL || "http://localhost:8003/api";
      const autoUrl = automotoresServiceUrl.endsWith("/api") ? automotoresServiceUrl : `${automotoresServiceUrl}/api`;
      
      console.log(`Sincronizando cambios de persona con ms-automotores:`, payload);
      await fetch(`${autoUrl}/automotores/internal/sync-propietario`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Error sincronizando con ms-automotores:", err.message);
    }

    // ms-comparendos
    try {
      const comparendosServiceUrl = process.env.COMPARENDOS_SERVICE_URL || "http://localhost:8005/api";
      const compUrl = comparendosServiceUrl.endsWith("/api") ? comparendosServiceUrl : `${comparendosServiceUrl}/api`;
      
      console.log(`Sincronizando cambios de persona con ms-comparendos:`, payload);
      await fetch(`${compUrl}/comparendos/internal/sync-persona`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Error sincronizando con ms-comparendos:", err.message);
    }
  }

  return persona;
}
