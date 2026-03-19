import axios from "axios";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Comparendo from "../models/comparendo.model.js";
import ComparendoEstadoHistorial from "../models/comparendoEstadoHistorial.model.js";

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

export async function listarComparendos({ userRole, username, email } = {}) {
  const where = {};

  console.log("Filtrando comparendos. Rol:", userRole, "Username:", username, "Email:", email);

  if (String(userRole).toLowerCase().trim() === "ciudadano") {
    const documento = String(username || "").replace("cc.", "").trim();
    if (documento) {
      where.ciudadano_documento = documento;
    }
    console.log("Filtro ciudadano aplicado:", where);
  } else if (userRole === "agente") {
    try {
      console.log("Buscando datos del agente para el email:", email);
      const response = await axios.get(`${process.env.PERSONAS_SERVICE_URL}/personas/email/${email}`);
      const persona = response.data?.data;
      
      if (persona) {
        const nombreCompleto = `${persona.nombres} ${persona.apellidos}`.trim();
        
        // El usuario pidió por nombre, pero el documento es el identificador único.
        // Usamos [Op.or] para cubrir ambos casos por seguridad.
        where[Op.or] = [
          { agente_documento: persona.numero_documento },
          { agente_nombre: nombreCompleto }
        ];
        
        console.log("Filtro agente aplicado (por documento o nombre):", {
          documento: persona.numero_documento,
          nombre: nombreCompleto
        });
      } else {
        console.warn("No se encontró persona asociada al email del agente:", email);
        return [];
      }
    } catch (error) {
      console.error("Error al obtener datos del agente:", error.message);
      return [];
    }
  } else {
    console.log("No se aplicó filtro restrictivo (admin/supervisor/sin rol)");
  }

  return Comparendo.findAll({
    where,
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