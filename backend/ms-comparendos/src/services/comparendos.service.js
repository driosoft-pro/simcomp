import sequelize from "../config/database.js";
import Comparendo from "../models/comparendo.model.js";
import ComparendoEstadoHistorial from "../models/comparendoEstadoHistorial.model.js";
import { Op } from "sequelize";

function validarTransicionEstado(estadoActual, nuevoEstado) {
  const transicionesValidas = {
    PENDIENTE: ["PAGADO", "ANULADO"],
    PAGADO: ["PENDIENTE"],
    ANULADO: [],
  };

  return transicionesValidas[estadoActual]?.includes(nuevoEstado);
}

export async function crearComparendo(data) {
  const transaction = await sequelize.transaction();

  try {
    const nuevoComparendo = await Comparendo.create(
      {
        numero_comparendo: data.numero_comparendo,
        ciudadano_documento: data.ciudadano_documento,
        ciudadano_nombre: data.ciudadano_nombre,
        agente_documento: data.agente_documento,
        agente_nombre: data.agente_nombre,
        placa_vehiculo: data.placa_vehiculo,
        infraccion_codigo: data.infraccion_codigo,
        infraccion_descripcion: data.infraccion_descripcion,
        valor_multa: data.valor_multa,
        fecha_comparendo: data.fecha_comparendo,
        lugar: data.lugar,
        ciudad: data.ciudad,
        observaciones: data.observaciones || null,
        estado: "PENDIENTE",
      },
      { transaction }
    );

    await ComparendoEstadoHistorial.create(
      {
        comparendo_id: nuevoComparendo.id,
        estado_anterior: null,
        estado_nuevo: "PENDIENTE",
        observacion: "Comparendo creado.",
        fecha_evento: new Date(),
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
    order: [["fecha_comparendo", "DESC"]],
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
    order: [["fecha_evento", "ASC"]],
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
        comparendo_id: comparendo.id,
        estado_anterior: estadoAnterior,
        estado_nuevo: nuevoEstado,
        observacion,
        fecha_evento: new Date(),
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
    "PENDIENTE",
    "Reapertura administrativa del comparendo"
  );
}

export async function listarComparendosPorDocumento(ciudadano_documento) {
  return Comparendo.findAll({
    where: { ciudadano_documento },
    order: [["fecha_comparendo", "DESC"]],
  });
}

export async function listarComparendosPorPlaca(placa_vehiculo) {
  return Comparendo.findAll({
    where: { placa_vehiculo },
    order: [["fecha_comparendo", "DESC"]],
  });
}
