import Automotor from "../models/automotores.models.js";

export async function getAllAutomotores() {
  return await Automotor.findAll({
    where: {
      deleted_at: null
    }
  });
}

export async function getAutomotorById(id) {
  return await Automotor.findOne({
    where: {
      automotor_id: id
    }
  });
}

export async function createAutomotor(data) {
  const existingAutomotor = await Automotor.findOne({
    where: {
      placa: data.placa
    }
  });

  if (existingAutomotor) {
    throw new Error("El automotor ya existe");
  }

  const automotor = await Automotor.create({
    placa: data.placa,
    tipo: data.tipo,
    marca: data.marca,
    modelo: data.modelo,
    anio: data.anio,
    color: data.color,
    cilindraje: data.cilindraje,
    estado: data.estado || "LEGAL",
    propietario_id: data.propietario_id
  });

  return automotor;
}

export async function updateAutomotor(id, data) {
  const automotor = await Automotor.findByPk(id);

  if (!automotor) {
    throw new Error("Automotor no encontrado");
  }

  if (data.placa !== undefined) automotor.placa = data.placa;
  if (data.tipo !== undefined) automotor.tipo = data.tipo;
  if (data.marca !== undefined) automotor.marca = data.marca;
  if (data.modelo !== undefined) automotor.modelo = data.modelo;
  if (data.anio !== undefined) automotor.anio = data.anio;
  if (data.color !== undefined) automotor.color = data.color;
  if (data.cilindraje !== undefined) automotor.cilindraje = data.cilindraje;
  if (data.estado !== undefined) automotor.estado = data.estado;
  if (data.propietario_id !== undefined) automotor.propietario_id = data.propietario_id;

  automotor.updated_at = new Date();

  await automotor.save();
  return automotor;
}

export async function changeAutomotorStatus(id, estado) {
const automotor = await Automotor.findOne({
  where: {
    automotor_id: id,
    deleted_at: null
  }
  });

  if (!automotor) {
    throw new Error("Automotor no encontrado");
  }

  estado = estado.toUpperCase();
  
  if (!["LEGAL", "REPORTADO_ROBO", "RECUPERADO", "EMBARGADO"].includes(estado)) {
    throw new Error("Estado inválido");
  }

  automotor.estado = estado;
  automotor.updated_at = new Date();

  await automotor.save();

  return automotor;
}

export async function deleteAutomotor(id) {
  const automotor = await Automotor.findByPk(id);

  if (!automotor) {
    throw new Error("Automotor no encontrado");
  }

  automotor.deleted_at = new Date();

  await automotor.save();
}

export async function getAutomotorByPlaca(placa) {

  const placaNormalizada = placa.toUpperCase();

  return await Automotor.findOne({
    where: {
      placa: placaNormalizada
    }
  });
}