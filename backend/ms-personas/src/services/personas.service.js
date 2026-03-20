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

export async function actualizarPersona(id, data) {
  const persona = await Persona.findByPk(id);

  if (!persona) {
    throw new Error("Persona no encontrada");
  }

  const oldEmail = persona.email;
  const oldDocumento = persona.numero_documento;

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

  // Cascading update to ms-auth-service
  if ((data.email && data.email !== oldEmail) || (data.numero_documento && data.numero_documento !== oldDocumento)) {
    try {
      const authServiceUrl = process.env.AUTH_SERVICE_URL || "http://ms-auth-service:8001/api/auth";
      const authBaseUrl = authServiceUrl.replace("/auth", "");
      
      // Find user by old email or old username
      const findResponse = await fetch(`${authBaseUrl}/Usuarios/email/${oldEmail}`);
      if (findResponse.ok) {
        const userData = await findResponse.json();
        const userId = userData.data?.id;
        if (userId) {
          const updatePayload = {};
          if (data.email && data.email !== oldEmail) updatePayload.email = data.email;
          if (data.numero_documento && data.numero_documento !== oldDocumento) {
             updatePayload.username = data.numero_documento;
             // If document changed, typically password is also reset to document by default or similar logic
          }

          if (Object.keys(updatePayload).length > 0) {
            await fetch(`${authBaseUrl}/Usuarios/${userId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatePayload),
            });
          }
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

  return persona;
}
