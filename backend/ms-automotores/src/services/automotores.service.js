import Automotor from "../models/automotores.models.js";

export async function getAllAutomotores() {
  return await Automotor.findAll({
    where: {
      deleted_at: null
    }
  });
}

export async function getAutomotorById(id) {
  return await Automotor.findByPk(id);
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
    vin: data.vin,
    numero_motor: data.numero_motor,
    numero_chasis: data.numero_chasis,
    marca: data.marca,
    linea: data.linea,
    modelo: data.modelo,
    color: data.color,
    clase: data.clase,
    servicio: data.servicio || "PARTICULAR",
    propietario_documento: data.propietario_documento,
    propietario_nombre: data.propietario_nombre,
    estado: data.estado || "activo"
  });

  return automotor;
}

export async function updateAutomotor(id, data) {
  const automotor = await Automotor.findByPk(id);

  if (!automotor) {
    throw new Error("Automotor no encontrado");
  }

  if (data.placa !== undefined) automotor.placa = data.placa;
  if (data.vin !== undefined) automotor.vin = data.vin;
  if (data.numero_motor !== undefined) automotor.numero_motor = data.numero_motor;
  if (data.numero_chasis !== undefined) automotor.numero_chasis = data.numero_chasis;
  if (data.marca !== undefined) automotor.marca = data.marca;
  if (data.linea !== undefined) automotor.linea = data.linea;
  if (data.modelo !== undefined) automotor.modelo = data.modelo;
  if (data.color !== undefined) automotor.color = data.color;
  if (data.clase !== undefined) automotor.clase = data.clase;
  if (data.servicio !== undefined) automotor.servicio = data.servicio;
  if (data.propietario_documento !== undefined) automotor.propietario_documento = data.propietario_documento;
  if (data.propietario_nombre !== undefined) automotor.propietario_nombre = data.propietario_nombre;
  if (data.estado !== undefined) automotor.estado = data.estado;

  automotor.updated_at = new Date();

  await automotor.save();
  return automotor;
}

export async function changeAutomotorStatus(id, estado) {
  const automotor = await Automotor.findOne({
    where: {
      id: id,
      deleted_at: null
    }
  });

  if (!automotor) {
    throw new Error("Automotor no encontrado");
  }

  estado = estado.toLowerCase();
  
  if (!["activo", "inactivo", "inmovilizado"].includes(estado)) {
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
      placa: placaNormalizada,
      deleted_at: null
    }
  });
}