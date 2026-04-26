import axios from "axios";
import { Op, fn, col, literal } from "sequelize";
import sequelize from "../config/database.js";
import Comparendo from "../models/comparendo.model.js";
import ComparendoEstadoHistorial from "../models/comparendoEstadoHistorial.model.js";

// ── Axios con timeout global para llamadas inter-servicio ─────────────────────
// Sin timeout, una falla en infracciones/automotores/personas puede bloquear
// el event loop indefinidamente bajo carga.
const http = axios.create({ timeout: 5000 });

function validarTransicionEstado(estadoActual, nuevoEstado) {
  const transicionesValidas = {
    PENDIENTE: ["PAGADO", "ANULADO"],
    PAGADO: ["PENDIENTE"],
    ANULADO: ["PENDIENTE"],
  };
  return transicionesValidas[estadoActual]?.includes(nuevoEstado);
}

// ── Cache de tipo_sancion por código de infracción ────────────────────────────
// Evita llamar a ms-infracciones en CADA create/pagar. Los tipos de sanción
// no cambian frecuentemente — TTL de 5 minutos es seguro.
const INFRACCION_CACHE = new Map();
const INFRACCION_TTL_MS = 5 * 60 * 1000; // 5 minutos

async function getTipoSancion(codigo) {
  const cached = INFRACCION_CACHE.get(codigo);
  if (cached && Date.now() < cached.expiresAt) return cached.tipo;

  try {
    const res = await http.get(
      `${process.env.INFRACCIONES_SERVICE_URL}/infracciones/codigo/${codigo}`
    );
    const tipo = res.data?.data?.tipo_sancion ?? null;
    INFRACCION_CACHE.set(codigo, { tipo, expiresAt: Date.now() + INFRACCION_TTL_MS });
    return tipo;
  } catch {
    return null; // best-effort: si falla, no bloquear la operación principal
  }
}

// ── Efectos secundarios (best-effort, no bloquean la transacción principal) ───
async function applySideEffects(codigo, placa, documento) {
  const tipo = await getTipoSancion(codigo);
  if (!tipo) return;

  const inmovilizar = tipo === "INMOVILIZACION" || tipo === "MIXTA";
  const suspender   = tipo === "SUSPENSION_LICENCIA" || tipo === "MIXTA";

  // Ejecutar en paralelo — no hay dependencia entre inmovilizar y suspender
  const tasks = [];
  if (inmovilizar) {
    tasks.push(
      http.patch(`${process.env.AUTOMOTORES_SERVICE_URL}/automotores/placa/${placa}/inmovilizar`)
        .catch(err => console.error(`[comparendos] Error inmovilizando ${placa}: ${err.message}`))
    );
  }
  if (suspender) {
    tasks.push(
      http.patch(`${process.env.PERSONAS_SERVICE_URL}/licencias/suspender/${documento}`)
        .catch(err => console.error(`[comparendos] Error suspendiendo licencia ${documento}: ${err.message}`))
    );
  }

  await Promise.allSettled(tasks);
}

async function revertSideEffects(codigo, placa, documento) {
  const tipo = await getTipoSancion(codigo);

  const reactivarVehiculo = !tipo || tipo === "INMOVILIZACION" || tipo === "MIXTA";
  const reactivarLicencia = tipo === "SUSPENSION_LICENCIA" || tipo === "MIXTA";

  const tasks = [];

  if (reactivarVehiculo) {
    tasks.push(
      http.get(`${process.env.AUTOMOTORES_SERVICE_URL}/automotores/placa/${placa}`)
        .then(res => {
          const vehiculoId = res.data?.data?.id;
          if (vehiculoId) {
            return http.patch(
              `${process.env.AUTOMOTORES_SERVICE_URL}/automotores/${vehiculoId}/estado`,
              { estado: "activo" }
            );
          }
        })
        .catch(err => console.error(`[comparendos] Error reactivando vehículo ${placa}: ${err.message}`))
    );
  }

  if (reactivarLicencia) {
    tasks.push(
      http.patch(`${process.env.PERSONAS_SERVICE_URL}/licencias/reactivar/${documento}`)
        .catch(err => console.error(`[comparendos] Error reactivando licencia ${documento}: ${err.message}`))
    );
  }

  await Promise.allSettled(tasks);
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function crearComparendo(data, { userRole } = {}) {
  const role = String(userRole || "").toLowerCase().trim();

  if (role !== "admin" && role !== "agente") {
    throw new Error("No tienes permiso para crear comparendos");
  }

  const infractions = Array.isArray(data.infracciones) && data.infracciones.length > 0
    ? data.infracciones
    : [{
        codigo: data.infraccion_codigo,
        descripcion: data.infraccion_descripcion,
        valor_multa: data.valor_multa,
      }];

  const transaction = await sequelize.transaction();

  try {
    const createdComparendos = [];

    // Crear todos los comparendos + historial dentro de la transacción
    for (let i = 0; i < infractions.length; i++) {
      const infraction = infractions[i];
      const numeroComparendo = infractions.length > 1
        ? `${data.numero_comparendo}-${i + 1}`
        : data.numero_comparendo;

      const nuevoComparendo = await Comparendo.create(
        {
          numero_comparendo: numeroComparendo,
          ciudadano_documento: data.ciudadano_documento,
          ciudadano_nombre: data.ciudadano_nombre,
          agente_documento: data.agente_documento,
          agente_nombre: data.agente_nombre,
          placa_vehiculo: data.placa_vehiculo,
          infraccion_codigo: infraction.codigo,
          infraccion_descripcion: infraction.descripcion,
          valor_multa: infraction.valor_multa,
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
          observacion: infractions.length > 1
            ? `Comparendo creado (Infracción ${i + 1} de ${infractions.length}).`
            : "Comparendo creado.",
          fecha_evento: new Date(),
        },
        { transaction }
      );

      createdComparendos.push(nuevoComparendo);
    }

    await transaction.commit();

    // Efectos secundarios FUERA de la transacción (best-effort, paralelo)
    // No bloqueamos el commit si falla ms-infracciones o ms-automotores
    const sideEffectTasks = createdComparendos.map(c =>
      applySideEffects(c.infraccion_codigo, data.placa_vehiculo, data.ciudadano_documento)
    );
    Promise.allSettled(sideEffectTasks); // fire-and-forget

    return createdComparendos.length === 1 ? createdComparendos[0] : createdComparendos;
  } catch (error) {
    await transaction.rollback();

    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error(`El número de comparendo ya existe (${data.numero_comparendo}).`);
    }
    throw error;
  }
}

/**
 * Lista comparendos con filtros de rol empujados a la DB y paginación.
 * Antes: findAll() sin límite → traía TODOS los registros a memoria.
 */
export async function listarComparendos({ userRole, username, email, page = 1, limit = 50, search = '' } = {}) {
  const where = {};
  const role = String(userRole || "").toLowerCase().trim();

  // Calcular paginación
  const safeLimit = Math.min(200, Math.max(1, parseInt(limit) || 50));
  const offset = (Math.max(1, parseInt(page) || 1) - 1) * safeLimit;

  if (role === "ciudadano") {
    const documento = String(username || "").replace("cc.", "").trim();
    if (documento) where.ciudadano_documento = documento;
    else return { data: [], pagination: { page, limit: safeLimit } };

  } else if (role === "agente") {
    // Prioridad 1: username numérico = documento del agente (evita llamada HTTP)
    const documentoFromUsername = String(username || "").replace("cc.", "").trim();
    if (documentoFromUsername && /^\d+$/.test(documentoFromUsername)) {
      where.agente_documento = documentoFromUsername;
    } else if (email) {
      // Fallback: consultar ms-personas por email (con timeout corto)
      try {
        const response = await http.get(`${process.env.PERSONAS_SERVICE_URL}/personas/email/${email}`);
        const persona = response.data?.data;
        if (persona) {
          const nombreCompleto = `${persona.nombres} ${persona.apellidos}`.trim();
          where[Op.or] = [
            { agente_documento: persona.numero_documento },
            { agente_nombre: nombreCompleto },
          ];
        } else {
          return { data: [], pagination: { page, limit: safeLimit } };
        }
      } catch {
        return { data: [], pagination: { page, limit: safeLimit } };
      }
    } else {
      return { data: [], pagination: { page, limit: safeLimit } };
    }
  }
  // admin/supervisor: sin filtro restrictivo

  if (search) {
    const searchLower = search.toLowerCase();
    where[Op.or] = [
      { numero_comparendo: { [Op.iLike]: `%${searchLower}%` } },
      { ciudadano_documento: { [Op.iLike]: `%${searchLower}%` } },
      { ciudadano_nombre: { [Op.iLike]: `%${searchLower}%` } },
      { placa_vehiculo: { [Op.iLike]: `%${searchLower}%` } },
    ];
  }

  const result = await Comparendo.findAndCountAll({
    where,
    order: [["fecha_comparendo", "DESC"]],
    limit: safeLimit,
    offset,
  });

  return { 
    data: result.rows, 
    total: result.count,
    pagination: { page, limit: safeLimit } 
  };
}

/**
 * Calcula el siguiente número de comparendo del día usando MAX() en SQL.
 * Antes: findAll() con LIKE traía todos los comparendos del día a memoria
 * para hacer el reduce en JS → ahora es una sola query agregada.
 */
export async function obtenerSiguienteNumero() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86_400_000).toString().padStart(3, "0");
  const prefix = `COMP-${now.getFullYear()}-${dayOfYear}-`;

  // MAX() con LIKE: 1 query vs findAll() completo
  const [result] = await sequelize.query(
    `SELECT MAX(CAST(SPLIT_PART(numero_comparendo, '-', 4) AS INTEGER)) AS max_seq
     FROM comparendos
     WHERE numero_comparendo LIKE :prefix
       AND deleted_at IS NULL`,
    {
      replacements: { prefix: `${prefix}%` },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const nextSeq = ((result?.max_seq ?? 0) + 1).toString().padStart(3, "0");
  return `${prefix}${nextSeq}`;
}

export async function obtenerComparendoPorId(id) {
  const comparendo = await Comparendo.findByPk(id);
  if (!comparendo) throw new Error("Comparendo no encontrado");
  return comparendo;
}

export async function obtenerComparendoPorNumero(numero) {
  const comparendo = await Comparendo.findOne({
    where: { numero_comparendo: numero },
  });
  if (!comparendo) throw new Error("Comparendo no encontrado");
  return comparendo;
}

export async function obtenerComparendosPorPlaca(placa) {
  return Comparendo.findAll({
    where: { placa_vehiculo: placa },
    order: [["fecha_comparendo", "DESC"]],
  });
}

/**
 * Historial con JOIN en una sola query.
 * Antes: 2 queries separadas (findByPk para validar + findAll para historial).
 */
export async function obtenerHistorialComparendo(comparendoId) {
  // Verificar existencia + traer historial en una sola query con include
  const comparendo = await Comparendo.findByPk(comparendoId, {
    include: [{
      model: ComparendoEstadoHistorial,
      as: "historial",
      required: false,
      order: [["fecha_evento", "ASC"]],
    }],
  });

  if (!comparendo) throw new Error("Comparendo no encontrado");
  return comparendo.historial;
}

// ── Cambio de estado (shared) ─────────────────────────────────────────────────

async function cambiarEstadoComparendo(comparendoId, nuevoEstado, observacion) {
  const transaction = await sequelize.transaction();

  try {
    const comparendo = await Comparendo.findByPk(comparendoId, { transaction });

    if (!comparendo) throw new Error("Comparendo no encontrado");

    if (!validarTransicionEstado(comparendo.estado, nuevoEstado)) {
      throw new Error(`No se permite cambiar el estado de ${comparendo.estado} a ${nuevoEstado}`);
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
  // Una sola query para validar permisos + datos necesarios
  const comparendo = await Comparendo.findByPk(comparendoId);
  if (!comparendo) throw new Error("Comparendo no encontrado");

  const role = String(userRole || "").toLowerCase().trim();
  const citizenDoc = String(comparendo.ciudadano_documento || "").replace("cc.", "").trim();
  const userDoc = String(username || "").replace("cc.", "").trim();

  if (role === "agente" && citizenDoc !== userDoc) {
    throw new Error("No tienes permiso para pagar un comparendo de otro ciudadano");
  }
  if (role === "ciudadano" && citizenDoc !== userDoc) {
    throw new Error("No tienes permiso para pagar este comparendo");
  }

  const comparendoPagado = await cambiarEstadoComparendo(
    comparendoId,
    "PAGADO",
    `Pago registrado por usuario ${username} (Rol: ${userRole})`
  );

  // Reactivar vehículo y licencia FUERA de la transacción (best-effort, paralelo)
  revertSideEffects(
    comparendoPagado.infraccion_codigo,
    comparendoPagado.placa_vehiculo,
    comparendoPagado.ciudadano_documento
  ); // fire-and-forget

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

export async function actualizarComparendo(comparendoId, data, { userRole } = {}) {
  const role = String(userRole || "").toLowerCase().trim();

  if (role !== "admin" && role !== "agente") {
    throw new Error("No tienes permiso para editar comparendos");
  }

  const transaction = await sequelize.transaction();

  try {
    const comparendo = await Comparendo.findByPk(comparendoId, { transaction });

    if (!comparendo) throw new Error("Comparendo no encontrado");
    if (comparendo.estado !== "PENDIENTE") {
      throw new Error("Solo se pueden editar comparendos en estado PENDIENTE");
    }

    const camposEditables = [
      "placa_vehiculo", "lugar", "ciudad", "observaciones",
      "infraccion_codigo", "infraccion_descripcion", "valor_multa", "fecha_comparendo",
    ];

    camposEditables.forEach((campo) => {
      if (data[campo] !== undefined) comparendo[campo] = data[campo];
    });

    comparendo.updated_at = new Date();
    await comparendo.save({ transaction });

    // Infracciones adicionales en la edición
    if (Array.isArray(data.infracciones) && data.infracciones.length > 0) {
      const baseNumero = comparendo.numero_comparendo.split("-").slice(0, 3).join("-");

      // Contar existentes con MAX() SQL en vez de COUNT+LIKE (más preciso con concurrencia)
      const [countResult] = await sequelize.query(
        `SELECT COALESCE(MAX(CAST(SPLIT_PART(numero_comparendo, '-', 4) AS INTEGER)), 0) AS max_seq
         FROM comparendos
         WHERE numero_comparendo LIKE :pattern AND deleted_at IS NULL`,
        {
          replacements: { pattern: `${baseNumero}-%` },
          type: sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      let nextSuffix = (countResult?.max_seq ?? 0) + 1;

      for (const inf of data.infracciones) {
        const newNumero = `${baseNumero}-${nextSuffix++}`;
        const nuevo = await Comparendo.create(
          {
            numero_comparendo: newNumero,
            ciudadano_documento: comparendo.ciudadano_documento,
            ciudadano_nombre: comparendo.ciudadano_nombre,
            agente_documento: comparendo.agente_documento,
            agente_nombre: comparendo.agente_nombre,
            placa_vehiculo: comparendo.placa_vehiculo,
            infraccion_codigo: inf.codigo,
            infraccion_descripcion: inf.descripcion,
            valor_multa: inf.valor_multa,
            fecha_comparendo: comparendo.fecha_comparendo,
            lugar: comparendo.lugar,
            ciudad: comparendo.ciudad,
            observaciones: `Adicionado en edición de ${comparendo.numero_comparendo}`,
            estado: "PENDIENTE",
          },
          { transaction }
        );

        await ComparendoEstadoHistorial.create(
          {
            comparendo_id: nuevo.id,
            estado_anterior: null,
            estado_nuevo: "PENDIENTE",
            observacion: "Comparendo creado vía edición de otro.",
            fecha_evento: new Date(),
          },
          { transaction }
        );
      }
    }

    await ComparendoEstadoHistorial.create(
      {
        comparendo_id: comparendo.id,
        estado_anterior: "PENDIENTE",
        estado_nuevo: "PENDIENTE",
        observacion: `Edición administrativa por rol ${role}.`,
        fecha_evento: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    // Side effects FUERA de la transacción (best-effort)
    if (data.infraccion_codigo) {
      applySideEffects(data.infraccion_codigo, comparendo.placa_vehiculo, comparendo.ciudadano_documento);
    }
    if (Array.isArray(data.infracciones)) {
      data.infracciones.forEach(inf =>
        applySideEffects(inf.codigo, comparendo.placa_vehiculo, comparendo.ciudadano_documento)
      );
    }

    return comparendo;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Sincronización masiva de datos de persona.
 * Optimización: unificadas las 2 queries de ciudadano y agente cuando
 * el documento es el mismo (caso común). Si son el mismo documento,
 * solo se puede ser ciudadano O agente, no ambos, así que las 2 queries
 * son correctas pero se ejecutan con Promise.all para paralelismo.
 */
export async function sincronizarDatosPersona(oldDocumento, newDocumento, newNombre) {
  if (!oldDocumento) throw new Error("Documento original requerido para la sincronización");
  if (!newDocumento && !newNombre) return 0;

  const ciudadanoPayload = {};
  const agentePayload = {};

  if (newDocumento) {
    ciudadanoPayload.ciudadano_documento = newDocumento;
    agentePayload.agente_documento = newDocumento;
  }
  if (newNombre) {
    ciudadanoPayload.ciudadano_nombre = newNombre;
    agentePayload.agente_nombre = newNombre;
  }

  // Ejecutar ambas actualizaciones en paralelo
  const [resCiudadano, resAgente] = await Promise.all([
    Comparendo.update(ciudadanoPayload, { where: { ciudadano_documento: oldDocumento } }),
    Comparendo.update(agentePayload,   { where: { agente_documento: oldDocumento } }),
  ]);

  return (resCiudadano[0] ?? 0) + (resAgente[0] ?? 0);
}