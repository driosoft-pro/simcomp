import axios from "axios";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Comparendo from "../models/comparendo.model.js";
import ComparendoEstadoHistorial from "../models/comparendoEstadoHistorial.model.js";

function validarTransicionEstado(estadoActual, nuevoEstado) {
  const transicionesValidas = {
    PENDIENTE: ["PAGADO", "ANULADO"],
    PAGADO: ["PENDIENTE"],
    ANULADO: ["PENDIENTE"],
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

    // ── Efectos secundarios según tipo_sancion (best-effort) ─────────────────
    try {
      const infraccionRes = await axios.get(
        `${process.env.INFRACCIONES_SERVICE_URL}/infracciones/codigo/${data.infraccion_codigo}`
      );
      const tipos = infraccionRes.data?.data?.tipo_sancion;

      const inmovilizar = tipos === "INMOVILIZACION" || tipos === "MIXTA";
      const suspender   = tipos === "SUSPENSION_LICENCIA" || tipos === "MIXTA";

      if (inmovilizar) {
        try {
          await axios.patch(
            `${process.env.AUTOMOTORES_SERVICE_URL}/automotores/placa/${data.placa_vehiculo}/inmovilizar`
          );
          console.log(`[comparendos] Vehículo ${data.placa_vehiculo} inmovilizado por infracción ${data.infraccion_codigo}`);
        } catch (err) {
          console.error(`[comparendos] Error inmovilizando vehículo ${data.placa_vehiculo}:`, err.message);
        }
      }

      if (suspender) {
        try {
          await axios.patch(
            `${process.env.PERSONAS_SERVICE_URL}/Licencias/suspender/${data.ciudadano_documento}`
          );
          console.log(`[comparendos] Licencias suspendidas para documento ${data.ciudadano_documento} por infracción ${data.infraccion_codigo}`);
        } catch (err) {
          console.error(`[comparendos] Error suspendiendo licencias para ${data.ciudadano_documento}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`[comparendos] Error consultando tipo_sancion de infracción ${data.infraccion_codigo}:`, err.message);
    }
    // ─────────────────────────────────────────────────────────────────────────

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

  const role = String(userRole || "").toLowerCase().trim();

  console.log("Filtrando comparendos. Rol:", role, "Username:", username, "Email:", email);

  if (role === "ciudadano") {
    const documento = String(username || "").replace("cc.", "").trim();
    if (documento) {
      where.ciudadano_documento = documento;
    }
    console.log("Filtro ciudadano aplicado:", where);
  } else if (role === "agente") {
    try {
      let identificadorEncontrado = false;

      // 1. Intentar identificar al agente por su username (si es un documento)
      const documentoFromUsername = String(username || "").replace("cc.", "").trim();
      // Validamos que sean solo números para asegurar que es un documento
      if (documentoFromUsername && /^\d+$/.test(documentoFromUsername)) {
        where.agente_documento = documentoFromUsername;
        identificadorEncontrado = true;
        console.log("Agente identificado por documento (username):", documentoFromUsername);
      }

      // 2. Si no se identificó por username, o para mayor seguridad, buscar por email
      if (!identificadorEncontrado && email) {
        console.log("Buscando datos del agente para el email:", email);
        const response = await axios.get(`${process.env.PERSONAS_SERVICE_URL}/personas/email/${email}`);
        const persona = response.data?.data;
        
        if (persona) {
          const nombreCompleto = `${persona.nombres} ${persona.apellidos}`.trim();
          
          where[Op.or] = [
            { agente_documento: persona.numero_documento },
            { agente_nombre: nombreCompleto }
          ];
          identificadorEncontrado = true;
          console.log("Filtro agente aplicado por email (documento o nombre):", {
            documento: persona.numero_documento,
            nombre: nombreCompleto
          });
        }
      }

      if (!identificadorEncontrado) {
        console.warn("No se pudo identificar al agente logueado. Retornando lista vacía.");
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

export async function obtenerComparendosPorPlaca(placa) {
  return Comparendo.findAll({
    where: { placa_vehiculo: placa },
    order: [["fecha_comparendo", "DESC"]],
  });
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

export async function pagarComparendo(comparendoId, { userRole, username } = {}) {
  const comparendo = await Comparendo.findByPk(comparendoId);
  
  if (!comparendo) {
    throw new Error("Comparendo no encontrado");
  }

  const role = String(userRole || "").toLowerCase().trim();
  const citizenDoc = String(comparendo.ciudadano_documento || "").replace("cc.", "").trim();
  const userDoc = String(username || "").replace("cc.", "").trim();

  // Restricción: Agente solo puede pagar si es el infractor
  if (role === "agente") {
    if (citizenDoc !== userDoc) {
      throw new Error("No tienes permiso para pagar un comparendo de otro ciudadano");
    }
  }

  // Ciudadano solo puede pagar el suyo
  if (role === "ciudadano") {
    if (citizenDoc !== userDoc) {
      throw new Error("No tienes permiso para pagar este comparendo");
    }
  }

  const comparendoPagado = await cambiarEstadoComparendo(
    comparendoId,
    "PAGADO",
    `Pago registrado por usuario ${username} (Rol: ${userRole})`
  );

  // Al pagar, restaurar el vehículo a "activo" (best-effort)
  try {
    await axios.patch(
      `${process.env.AUTOMOTORES_SERVICE_URL}/automotores/placa/${comparendoPagado.placa_vehiculo}/inmovilizar`,
      {},
      { timeout: 5000 }
    ).catch(() => {
      // Si no existe el endpoint de inmovilizar, usar el genérico por placa
    });

    // Buscar el vehículo primero para obtener su ID y usar el endpoint de estado
    const vehiculoRes = await axios.get(
      `${process.env.AUTOMOTORES_SERVICE_URL}/automotores/placa/${comparendoPagado.placa_vehiculo}`
    );
    const vehiculoId = vehiculoRes.data?.data?.id;
    if (vehiculoId) {
      await axios.patch(
        `${process.env.AUTOMOTORES_SERVICE_URL}/automotores/${vehiculoId}/estado`,
        { estado: "activo" }
      );
      console.log(`[comparendos] Vehículo ${comparendoPagado.placa_vehiculo} reactivado tras pago del comparendo ${comparendoId}`);
    }
  } catch (err) {
    console.error(`[comparendos] Error reactivando vehículo ${comparendoPagado.placa_vehiculo} tras pago:`, err.message);
  }

  return comparendoPagado;

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