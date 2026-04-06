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

  // Verificar que el propietario existe en ms-personas
  try {
    const personasServiceUrl = process.env.PERSONAS_SERVICE_URL || "http://ms-personas:8002/api";
    const response = await fetch(`${personasServiceUrl}/Personas/documento/${data.propietario_documento}`);
    if (!response.ok) {
      throw new Error("El propietario no está registrado en el sistema de personas");
    }
  } catch (error) {
    if (error.message.includes("personas")) {
      throw error;
    }
    console.error("Error validando propietario:", error.message);
    // No bloqueamos si el servicio de personas está caído, pero registramos el error
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
    estado: data.estado || "activo",
    condicion: data.condicion || "LEGAL"
  });

  return automotor;
}

export async function updateAutomotor(id, data) {
  const automotor = await Automotor.findByPk(id);

  if (!automotor) {
    throw new Error("Automotor no encontrado");
  }

  // Capturar valores anteriores ANTES de mutar para detectar cambios
  const oldPropietarioDocumento = automotor.propietario_documento;
  const oldPropietarioNombre = automotor.propietario_nombre;

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
  if (data.condicion !== undefined) automotor.condicion = data.condicion;

  automotor.updated_at = new Date();

  await automotor.save();

  // Sincronización inversa: si cambió el propietario_documento, notificar a ms-personas
  const docChanged = data.propietario_documento !== undefined && data.propietario_documento !== oldPropietarioDocumento;
  if (docChanged) {
    try {
      const personasServiceUrl = process.env.PERSONAS_SERVICE_URL || "http://localhost:8002/api";
      
      // Buscar la persona por el documento ANTERIOR
      const findResponse = await fetch(`${personasServiceUrl}/personas/documento/${encodeURIComponent(oldPropietarioDocumento)}`);
      if (findResponse.ok) {
        const result = await findResponse.json();
        const persona = result.data;
        if (persona && persona.id) {
          console.log(`[automotores] Sincronizando cambio de propietario con ms-personas: ${oldPropietarioDocumento} → ${data.propietario_documento}`);
          // x-internal-sync:true evita que ms-personas intente re-sincronizar de vuelta a ms-automotores
          // (ya actualizamos el automotor, si personas llama sync-propietario no hará nada pues oldDocumento ya no existe)
          await fetch(`${personasServiceUrl}/personas/${persona.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-user-role": "admin",
              "x-user-id": "internal-sync"
            },
            body: JSON.stringify({
              numero_documento: data.propietario_documento,
              // Si también cambió el nombre, sincronizarlo
              ...(data.propietario_nombre && data.propietario_nombre !== oldPropietarioNombre
                ? { nombres: data.propietario_nombre }
                : {})
            }),
          });
        } else {
          console.warn(`[automotores] No se encontró persona con documento ${oldPropietarioDocumento} en ms-personas para sincronizar.`);
        }
      } else if (findResponse.status === 404) {
        console.warn(`[automotores] La persona con documento ${oldPropietarioDocumento} no existe en ms-personas (puede ser un cambio de propietario legítimo).`);
      } else {
        console.error(`[automotores] Error consultando ms-personas: ${findResponse.status}`);
      }
    } catch (err) {
      console.error("[automotores] Error en sincronización inversa con ms-personas:", err.message);
    }
  }

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

  automotor.estado = "inactivo";
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

export async function inmovilizarAutomotorPorPlaca(placa) {
  const placaNormalizada = placa.toUpperCase();

  const automotor = await Automotor.findOne({
    where: {
      placa: placaNormalizada,
      deleted_at: null
    }
  });

  if (!automotor) {
    throw new Error(`Automotor con placa ${placa} no encontrado`);
  }

  automotor.estado = "inmovilizado";
  automotor.updated_at = new Date();
  await automotor.save();

  return automotor;
}

export async function actualizarDatosPropietarioMasivo(oldDocumento, newDocumento, newNombre) {
  if (!oldDocumento) throw new Error("Documento original requerido para la sincronización");

  const updateFields = {};
  if (newDocumento) updateFields.propietario_documento = newDocumento;
  if (newNombre) updateFields.propietario_nombre = newNombre;

  if (Object.keys(updateFields).length === 0) return 0;

  const [affectedRows] = await Automotor.update(updateFields, {
    where: {
      propietario_documento: oldDocumento
    }
  });

  return affectedRows;
}