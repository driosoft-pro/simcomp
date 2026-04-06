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

  // Cascading update to ms-auth-service
  // (Solo si NO fue ms-auth quien inició la sincronización, para evitar bucle circular)
  if (!skipAuthSync && (emailChanged || docChanged || usernameRequested)) {
    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://localhost:8001";
      // Standardize base path to ensure it matches ms-auth-service's internal API route
      const authApiUrl = authServiceUrl.endsWith("/api/auth") ? authServiceUrl.replace("/auth", "") : (authServiceUrl.endsWith("/api") ? authServiceUrl : `${authServiceUrl}/api`);
      
      // Intento 1: buscar usuario por email
      let userId = null;
      const findByEmailResponse = await fetch(`${authApiUrl}/usuarios/email/${encodeURIComponent(oldEmail)}`);
      if (findByEmailResponse.ok) {
        const userData = await findByEmailResponse.json();
        userId = userData.data?.id;
        console.log(`Usuario encontrado en ms-auth por email: ${oldEmail} → ID ${userId}`);
      } else {
        // Intento 2: fallback por username (= numero_documento anterior)
        console.warn(`No se encontró usuario por email ${oldEmail} en ms-auth (Status: ${findByEmailResponse.status}). Intentando por username/documento...`);
        const findByDocResponse = await fetch(`${authApiUrl}/usuarios/username/${encodeURIComponent(oldDocumento)}`);
        if (findByDocResponse.ok) {
          const userData = await findByDocResponse.json();
          userId = userData.data?.id;
          console.log(`Usuario encontrado en ms-auth por username/documento: ${oldDocumento} → ID ${userId}`);
        } else {
          console.warn(`Tampoco se encontró usuario por username ${oldDocumento} en ms-auth (Status: ${findByDocResponse.status}). No se puede sincronizar.`);
        }
      }

      if (userId) {
        const updatePayload = {};
        if (emailChanged) updatePayload.email = data.email;
        if (docChanged) updatePayload.numero_documento = data.numero_documento;
        
        // Sync username if provided in data or if documento changed (auto-sync)
        if (usernameRequested) {
          updatePayload.username = data.username;
        } else if (docChanged) {
          updatePayload.username = data.numero_documento;
        }

        if (Object.keys(updatePayload).length > 0) {
          console.log(`Sincronizando cambios con ms-auth-service para usuario ${userId}:`, updatePayload);
          await fetch(`${authApiUrl}/usuarios/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload),
          });
        }
      }
    } catch (error) {
      console.error("Error synchronizing with ms-auth-service:", error.message);
    }
  }

  // Cascading update to Licencias
  if (data.numero_documento && data.numero_documento !== oldDocumento) {
    try {
      await Licencia.update(
        { numero_licencia: data.numero_documento },
        { where: { persona_id: id } }
      );
    } catch (error) {
      console.error("Error updating licenses:", error.message);
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
