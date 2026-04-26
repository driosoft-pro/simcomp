import { Op } from "sequelize";
import Infraccion from "../models/infracciones.model.js";

/**
 * Lista infracciones con soporte para paginación y filtros por estado/vigencia.
 * Evita traer todo el dataset a memoria.
 */
export async function getAllInfracciones({ limit = 50, page = 1, estado, vigente, tipo_sancion, search = '' } = {}) {
  const safeLimit = Math.min(200, Math.max(1, parseInt(limit) || 50));
  const offset = (Math.max(1, parseInt(page) || 1) - 1) * safeLimit;

  const where = {};
  if (estado) where.estado = estado;
  if (vigente !== undefined) where.vigente = vigente === "true" || vigente === true;
  if (tipo_sancion) where.tipo_sancion = tipo_sancion;

  if (search) {
    const searchLower = search.toLowerCase();
    where[Op.or] = [
      { codigo: { [Op.iLike]: `%${searchLower}%` } },
      { descripcion: { [Op.iLike]: `%${searchLower}%` } },
    ];
  }

  const result = await Infraccion.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: safeLimit,
    offset,
  });

  return {
    rows: result.rows,
    total: result.count
  };
}

export async function getInfraccionById(id) {
  return Infraccion.findByPk(id);
}

export async function getInfraccionByCodigo(codigo) {
  return Infraccion.findOne({
    where: { codigo },
  });
}

/**
 * Crea una infracción confiando en los constraints de la base de datos.
 */
export async function createInfraccion(data) {
  return Infraccion.create({
    codigo: data.codigo?.toUpperCase(),
    descripcion: data.descripcion,
    articulo_codigo: data.articulo_codigo,
    tipo_sancion: data.tipo_sancion,
    valor_multa: data.valor_multa,
    dias_suspension: data.dias_suspension || null,
    aplica_descuento: data.aplica_descuento || false,
    vigente: data.vigente ?? true,
    estado: "activo"
  });
}

export async function updateInfraccion(id, data) {
  const infraccion = await Infraccion.findByPk(id);

  if (!infraccion) {
    throw new Error("Infracción no encontrada");
  }

  const updatableFields = [
    "codigo", "descripcion", "articulo_codigo", "tipo_sancion",
    "valor_multa", "dias_suspension", "aplica_descuento", "vigente", "estado"
  ];

  updatableFields.forEach(field => {
    if (data[field] !== undefined) {
      infraccion[field] = field === "codigo" ? data[field].toUpperCase() : data[field];
    }
  });

  await infraccion.save();
  return infraccion;
}

/**
 * Realiza un soft delete real (paranoid: true) y actualiza estados lógicos.
 */
export async function deleteInfraccion(id) {
  const infraccion = await Infraccion.findByPk(id);

  if (!infraccion) {
    throw new Error("Infracción no encontrada");
  }

  // Actualizamos estados lógicos antes del soft-delete
  infraccion.estado = "inactivo";
  infraccion.vigente = false;
  await infraccion.save();

  // Soft-delete de Sequelize
  await infraccion.destroy();

  return infraccion;
}

export async function activateInfraccion(id) {
  // restore() si estaba soft-deleted
  const infraccion = await Infraccion.findByPk(id, { paranoid: false });

  if (!infraccion) {
    throw new Error("Infracción no encontrada");
  }

  if (infraccion.deleted_at) {
    await infraccion.restore();
  }

  infraccion.estado = "activo";
  infraccion.vigente = true;
  await infraccion.save();

  return infraccion;
}

export async function changeInfraccionStatus(id, vigente) {
  const infraccion = await Infraccion.findByPk(id);

  if (!infraccion) {
    throw new Error("Infracción no encontrada");
  }

  infraccion.vigente = vigente === "true" || vigente === true;
  await infraccion.save();

  return infraccion;
}