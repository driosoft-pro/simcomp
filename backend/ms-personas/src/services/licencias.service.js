import Licencia from "../models/licencia.model.js";
import Persona from "../models/persona.model.js";

export async function crearLicencia(data) {
  const persona = await Persona.findByPk(data.persona_id);

  if (!persona) {
    throw new Error("La persona no existe");
  }

  const licencia = await Licencia.create({
    persona_id: data.persona_id,
    numero_licencia: data.numero_licencia,
    categoria: data.categoria,
    fecha_expedicion: data.fecha_expedicion,
    fecha_vencimiento: data.fecha_vencimiento,
    estado: data.estado,
    observaciones: data.observaciones ?? null,
  });

  return licencia;
}

export async function listarLicenciasPorPersona(personaId) {
  return await Licencia.findAll({
    where: {
      persona_id: personaId,
    },
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Persona,
        as: "persona",
      },
    ],
  });
}

export async function obtenerLicenciaPorNumero(numeroLicencia) {
  return await Licencia.findOne({
    where: {
      numero_licencia: numeroLicencia,
    },
    include: [
      {
        model: Persona,
        as: "persona",
      },
    ],
  });
}