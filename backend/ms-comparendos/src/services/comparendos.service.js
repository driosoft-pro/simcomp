import axios from "axios";
import sequelize from "../config/database.js";
import Comparendo from "../models/comparendo.model.js";
import ComparendoEstadoHistorial from "../models/comparendoEstadoHistorial.model.js";

const PERSONAS_SERVICE_URL = process.env.PERSONAS_SERVICE_URL;
const AUTOMOTORES_SERVICE_URL = process.env.AUTOMOTORES_SERVICE_URL;
const INFRACCIONES_SERVICE_URL = process.env.INFRACCIONES_SERVICE_URL;

function validarTransicionEstado(estadoActual, nuevoEstado) {
  const transicionesValidas = {
    CREADO: ["PAGADO", "ANULADO"],
    PAGADO: ["CREADO"],
    ANULADO: [],
  };

  return transicionesValidas[estadoActual]?.includes(nuevoEstado);
}

async function validarExistenciaPersona(personaId) {
  try {
    const response = await axios.get(`${PERSONAS_SERVICE_URL}/personas/${personaId}`);
    return response.data;
  } catch {
    throw new Error("La persona no existe en el sistema");
  }
}

async function validarExistenciaAutomotor(automotorId) {
  try {
    const response = await axios.get(`${AUTOMOTORES_SERVICE_URL}/automotores/${automotorId}`);
    return response.data;
  } catch {
    throw new Error("El automotor no existe en el sistema");
  }
}

async function obtenerInfraccion(infraccionId) {
  try {
    const response = await axios.get(`${INFRACCIONES_SERVICE_URL}/infracciones/${infraccionId}`);
    return response.data;
  } catch {
    throw new Error("La infracción no existe en el sistema");
  }
}

export async function crearComparendo(data) {
  const transaction = await sequelize.transaction();

  try {
    await validarExistenciaPersona(data.persona_id);
    await validarExistenciaAutomotor(data.automotor_id);
    const infraccion = await obtenerInfraccion(data.infraccion_id);

    const valorMulta =
      Number(infraccion?.valor_multa) ||
      Number(infraccion?.valor) ||
      Number(infraccion?.data?.valor_multa) ||
      0;

    const nuevoComparendo = await Comparendo.create(
      {
        numero_comparendo: data.numero_comparendo,
        fecha_hora: data.fecha_hora,
        automotor_id: data.automotor_id,
        persona_id: data.persona_id,
        infraccion_id: data.infraccion_id,
        direccion_exacta: data.direccion_exacta,
        estado: "CREADO",
        valor_multa: valorMulta,
        observaciones: data.observaciones || null,
      },
      { transaction }
    );

    await ComparendoEstadoHistorial.create(
      {
        comparendo_id: nuevoComparendo.comparendo_id,
        estado_anterior: null,
        estado_nuevo: "CREADO",
        observacion: "Estado inicial del comparendo",
      },
      { transaction }
    );

    await transaction.commit();

    return nuevoComparendo;
  } catch (error) {
    await transaction.rollback();

    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("El número de comparendo ya existe");
    }

    throw error;
  }
}

export async function listarComparendos() {
  return Comparendo.findAll({
    order: [["created_at", "DESC"]],
  });
}

export async function obtenerComparendosPorPersona(personaId) {
  return Comparendo.findAll({
    where: { persona_id: personaId },
    order: [["created_at", "DESC"]],
  });
}

export async function obtenerComparendosPorAutomotor(automotorId) {
  return Comparendo.findAll({
    where: { automotor_id: automotorId },
    order: [["created_at", "DESC"]],
  });
}

export async function obtenerComparendoPorId(id) {
  const comparendo = await Comparendo.findByPk(id);
  if (!comparendo) {
    throw new Error("Comparendo no encontrado");
  }
  return comparendo;
}

export async function obtenerComparendoPorNumero(numero) {
  const comparendo = await Comparendo.findOne({
    where: { numero_comparendo: numero },
  });

  if (!comparendo) {
    throw new Error("Comparendo no encontrado");
  }

  return comparendo;
}

export async function obtenerHistorialComparendo(comparendoId) {
  const comparendo = await Comparendo.findByPk(comparendoId);
  if (!comparendo) {
    throw new Error("Comparendo no encontrado");
  }

  return ComparendoEstadoHistorial.findAll({
    where: { comparendo_id: comparendoId },
    order: [["changed_at", "ASC"]],
  });
}

async function cambiarEstadoComparendo(comparendoId, nuevoEstado, observacion) {
  const transaction = await sequelize.transaction();

  try {
    const comparendo = await Comparendo.findByPk(comparendoId, { transaction });

    if (!comparendo) {
      throw new Error("Comparendo no encontrado");
    }

    if (!validarTransicionEstado(comparendo.estado, nuevoEstado)) {
      throw new Error(
        `No se permite cambiar el estado de ${comparendo.estado} a ${nuevoEstado}`
      );
    }

    const estadoAnterior = comparendo.estado;
    comparendo.estado = nuevoEstado;
    comparendo.updated_at = new Date();

    await comparendo.save({ transaction });

    await ComparendoEstadoHistorial.create(
      {
        comparendo_id: comparendo.comparendo_id,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado,
        observacion,
      },
      { transaction }
    );

    await transaction.commit();

    return comparendo;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function pagarComparendo(comparendoId) {
  return cambiarEstadoComparendo(
    comparendoId,
    "PAGADO",
    "Pago válido registrado en el sistema"
  );
}

export async function anularComparendo(comparendoId) {
  return cambiarEstadoComparendo(
    comparendoId,
    "ANULADO",
    "Anulación administrativa del comparendo"
  );
}

export async function revertirAPendiente(comparendoId) {
  return cambiarEstadoComparendo(
    comparendoId,
    "CREADO",
    "Reversión de pago o reapertura administrativa"
  );
}