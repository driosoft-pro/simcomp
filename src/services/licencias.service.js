import Licencia from "../models/licencia.model.js";
import Persona from "../models/persona.model.js";

export async function listarLicencias() {
  return Licencia.findAll({
    include: [{ model: Persona, as: "persona", attributes: ["nombres", "apellidos", "numero_documento", "email"] }]
  });
}

export async function obtenerLicenciaPorId(id) {
  return Licencia.findByPk(id, {
    include: [{ model: Persona, as: "persona" }]
  });
}

export async function obtenerLicenciaPorNumero(numero_licencia) {
  return Licencia.findOne({
    where: { numero_licencia },
    include: [{ model: Persona, as: "persona" }]
  });
}

export async function listarLicenciasPorPersona(persona_id) {
  return Licencia.findAll({
    where: { persona_id }
  });
}

export async function crearLicencia(data) {
  // Verificar si la persona existe
  const persona = await Persona.findByPk(data.persona_id);
  if (!persona) throw new Error("La persona no existe");
  
  return Licencia.create(data);
}

export async function actualizarLicencia(id, data) {
  const licencia = await Licencia.findByPk(id);
  if (!licencia) throw new Error("La licencia no existe");
  return licencia.update(data);
}

export async function cancelarLicencia(id) {
  const licencia = await Licencia.findByPk(id);
  if (!licencia) throw new Error("La licencia no existe");
  return licencia.update({ estado: "cancelada" });
}

export async function eliminarLicencia(id) {
  const licencia = await Licencia.findByPk(id);
  if (!licencia) throw new Error("La licencia no existe");
  return licencia.destroy();
}

/**
 * Suspende todas las licencias de una persona buscando por documento
 */
export async function suspenderLicenciasPorDocumento(numero_documento) {
  const persona = await Persona.findOne({ where: { numero_documento } });
  if (!persona) throw new Error("Persona no encontrada");

  const [count] = await Licencia.update(
    { estado: "suspendida" },
    { where: { persona_id: persona.id, estado: "vigente" } }
  );

  return { suspendidas: count };
}

/**
 * Reactiva licencias de una persona buscando por documento
 */
export async function reactivarLicenciasPorDocumento(numero_documento) {
  const persona = await Persona.findOne({ where: { numero_documento } });
  if (!persona) throw new Error("Persona no encontrada");

  const [count] = await Licencia.update(
    { estado: "vigente" },
    { where: { persona_id: persona.id, estado: "suspendida" } }
  );

  return { reactivadas: count };
}
