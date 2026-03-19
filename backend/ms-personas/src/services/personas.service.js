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

  return persona;
}
