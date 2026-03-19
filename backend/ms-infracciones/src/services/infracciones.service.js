import Infraccion from "../models/infracciones.model.js";

export async function getAllInfracciones() {
  return await Infraccion.findAll();
}

export async function getInfraccionById(id) {
  return await Infraccion.findOne({
    where: {
      infraccion_id: id,
    },
  });
}

export async function createInfraccion(data) {
  const existing = await Infraccion.findOne({
    where: { codigo: data.codigo },
  });

  if (existing) {
    throw new Error("La infracción ya existe");
  }

  const infraccion = await Infraccion.create({
    codigo: data.codigo,
    descripcion: data.descripcion,
    articulo_codigo: data.articulo_codigo,
    tipo_sancion: data.tipo_sancion,
    valor_multa: data.valor_multa,
    dias_suspension: data.dias_suspension || null,
    aplica_descuento: data.aplica_descuento || false,
    vigente: data.vigente ?? true,
  });

  return infraccion;
}

export async function updateInfraccion(id, data) {
  const infraccion = await Infraccion.findByPk(id);

  if (!infraccion || infraccion.deleted_at) {
    throw new Error("Infracción no encontrada");
  }

  if (data.codigo !== undefined) infraccion.codigo = data.codigo;
  if (data.descripcion !== undefined) infraccion.descripcion = data.descripcion;
  if (data.articulo_codigo !== undefined) infraccion.articulo_codigo = data.articulo_codigo;
  if (data.tipo_sancion !== undefined) infraccion.tipo_sancion = data.tipo_sancion;
  if (data.valor_multa !== undefined) infraccion.valor_multa = data.valor_multa;
  if (data.dias_suspension !== undefined) infraccion.dias_suspension = data.dias_suspension;
  if (data.aplica_descuento !== undefined) infraccion.aplica_descuento = data.aplica_descuento;
  if (data.vigente !== undefined) infraccion.vigente = data.vigente;

  infraccion.updated_at = new Date();

  await infraccion.save();
  return infraccion;
}

export async function deleteInfraccion(id) {
  const infraccion = await Infraccion.findByPk(id);

  if (!infraccion || infraccion.deleted_at) {
    throw new Error("Infracción no encontrada");
  }

  infraccion.deleted_at = new Date();
  await infraccion.save();

  return infraccion;
}

export async function changeInfraccionStatus(id, vigente) {
  const infraccion = await Infraccion.findByPk(id);

  if (!infraccion || infraccion.deleted_at) {
    throw new Error("Infracción no encontrada");
  }

  infraccion.vigente = vigente;
  infraccion.updated_at = new Date();

  await infraccion.save();

  return infraccion;
}