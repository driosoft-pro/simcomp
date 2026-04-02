import Licencia from "../models/licencia.model.js";
import Persona from "../models/persona.model.js";

export async function crearLicencia(data) {
  const persona = await Persona.findByPk(data.persona_id);

  if (!persona) {
    throw new Error("La persona no existe");
  }

  // El número de licencia será por defecto el número de documento de la persona
  const numero_licencia = persona.numero_documento;

  // Validar que la fecha de expedición sea menor a la fecha de vencimiento
  if (new Date(data.fecha_expedicion) >= new Date(data.fecha_vencimiento)) {
    throw new Error("La fecha de expedición debe ser menor a la fecha de vencimiento");
  }

  const licencia = await Licencia.create({
    persona_id: data.persona_id,
    numero_licencia: numero_licencia,
    categoria: data.categoria,
    fecha_expedicion: data.fecha_expedicion,
    fecha_vencimiento: data.fecha_vencimiento,
    estado: data.estado,
    observaciones: data.observaciones ?? null,
  });

  return licencia;
}

export async function listarLicencias() {
  return await Licencia.findAll({
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Persona,
        as: "persona",
      },
    ],
  });
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

export async function actualizarLicencia(id, data) {
  const licencia = await Licencia.findByPk(id);

  if (!licencia) {
    throw new Error("La licencia no existe");
  }

  if (licencia.estado === "cancelada") {
    throw new Error("No se puede actualizar una licencia cancelada");
  }

  await licencia.update({
    numero_licencia: data.numero_licencia,
    categoria: data.categoria,
    fecha_expedicion: data.fecha_expedicion,
    fecha_vencimiento: data.fecha_vencimiento,
    estado: data.estado,
    observaciones: data.observaciones,
  });

  return licencia;
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

export async function suspenderLicenciasPorDocumento(documento) {
  // Buscar la persona por número de documento
  const persona = await Persona.findOne({
    where: { numero_documento: documento },
  });

  if (!persona) {
    throw new Error(`Persona con documento ${documento} no encontrada`);
  }

  // Buscar todas las licencias vigentes de esa persona
  const licencias = await Licencia.findAll({
    where: {
      persona_id: persona.id,
      estado: "vigente",
    },
  });

  if (licencias.length === 0) {
    return { suspendidas: 0, message: "No se encontraron licencias vigentes para suspender" };
  }

  // Suspender cada licencia
  for (const licencia of licencias) {
    await licencia.update({ estado: "suspendida" });
  }

  return { suspendidas: licencias.length, licencias };
}

export async function reactivarLicenciasPorDocumento(documento) {
  // Buscar la persona por número de documento
  const persona = await Persona.findOne({
    where: { numero_documento: documento },
  });

  if (!persona) {
    throw new Error(`Persona con documento ${documento} no encontrada`);
  }

  // Buscar todas las licencias suspendidas de esa persona
  const licencias = await Licencia.findAll({
    where: {
      persona_id: persona.id,
      estado: "suspendida",
    },
  });

  if (licencias.length === 0) {
    return { reactivadas: 0, message: "No se encontraron licencias suspendidas para reactivar" };
  }

  // Reactivar cada licencia
  for (const licencia of licencias) {
    await licencia.update({ estado: "vigente" });
  }

  return { reactivadas: licencias.length, licencias };
}

export async function cancelarLicencia(id) {
  const licencia = await Licencia.findByPk(id);

  if (!licencia) {
    throw new Error("La licencia no existe");
  }

  if (licencia.estado === "cancelada") {
    throw new Error("La licencia ya se encuentra cancelada");
  }

  await licencia.update({
    estado: "cancelada",
    observaciones: `${licencia.observaciones || ""}\n[SISTEMA]: Licencia cancelada irreversiblemente.`.trim(),
  });

  return licencia;
}