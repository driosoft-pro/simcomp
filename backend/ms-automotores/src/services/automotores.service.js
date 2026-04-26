import Automotor from "../models/automotores.models.js";

// ── HTTP con timeout para sincronizaciones inter-servicio ─────────────────────
const SYNC_TIMEOUT_MS = 5000;

async function syncFetch(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch {
    // best-effort — nunca bloquear la operación principal por una sincronización
  } finally {
    clearTimeout(timer);
  }
}

function buildPersonasApiUrl() {
  const base = process.env.PERSONAS_SERVICE_URL || "http://ms-personas:8002";
  return base.endsWith("/api") ? base : `${base}/api`;
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

/**
 * Lista automotores con paginación y filtros opcionales empujados a la DB.
 * Antes: findAll() sin límite → traía TODOS los vehículos a memoria.
 */
export async function getAllAutomotores({ limit = 50, page = 1, propietario, estado } = {}) {
  const safeLimit = Math.min(200, Math.max(1, parseInt(limit) || 50));
  const offset = (Math.max(1, parseInt(page) || 1) - 1) * safeLimit;

  const where = {};
  if (propietario) where.propietario_documento = propietario;
  if (estado) where.estado = estado;

  // paranoid: true ya excluye deleted_at IS NOT NULL automáticamente
  return Automotor.findAll({
    where,
    order: [["created_at", "DESC"]],
    limit: safeLimit,
    offset,
  });
}

export async function getAutomotorById(id) {
  return Automotor.findByPk(id);
}

/**
 * Crea un automotor.
 * Optimizaciones:
 * - Eliminada la query previa de unicidad por placa — el UNIQUE constraint
 *   de la DB ya lo garantiza y es más eficiente (atómico, sin race condition).
 * - Validación de propietario en ms-personas con timeout y fire-and-forget
 *   para no bloquear el create si el servicio está lento.
 */
export async function createAutomotor(data) {
  // Validar propietario con timeout corto — no bloquear si ms-personas tarda
  try {
    const res = await syncFetch(
      `${buildPersonasApiUrl()}/personas/documento/${encodeURIComponent(data.propietario_documento)}`
    );
    if (res && res.status === 404) {
      throw new Error("El propietario no está registrado en el sistema de personas");
    }
  } catch (error) {
    // Solo relanzar si es error de negocio (propietario no existe)
    if (error.message.includes("personas")) throw error;
    // Si es error de red/timeout, loguear y continuar (no bloquear el registro)
    console.error("[automotores] Aviso: no se pudo validar propietario en ms-personas:", error.message);
  }

  const estadoDefecto = (data.condicion === "REPORTADO_ROBO" && (!data.estado || data.estado === "activo"))
    ? "inmovilizado"
    : (data.estado || "activo");

  // Confiar en UNIQUE constraints para placa/vin/numero_motor/numero_chasis
  // El controller captura SequelizeUniqueConstraintError → 409
  return Automotor.create({
    placa: data.placa?.toUpperCase(),
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
    estado: estadoDefecto,
    condicion: data.condicion || "LEGAL",
  });
}

export async function updateAutomotor(id, data) {
  const automotor = await Automotor.findByPk(id);
  if (!automotor) throw new Error("Automotor no encontrado");

  const oldPropietarioDocumento = automotor.propietario_documento;
  const oldPropietarioNombre = automotor.propietario_nombre;

  const camposEditables = [
    "placa", "vin", "numero_motor", "numero_chasis", "marca", "linea",
    "modelo", "color", "clase", "servicio",
    "propietario_documento", "propietario_nombre", "estado", "condicion",
  ];

  camposEditables.forEach(campo => {
    if (data[campo] !== undefined) automotor[campo] = data[campo];
  });

  // Normalizar placa
  if (data.placa) automotor.placa = data.placa.toUpperCase();

  // Auto-inmovilizar si pasa a REPORTADO_ROBO
  if (data.condicion === "REPORTADO_ROBO" && automotor.estado === "activo") {
    automotor.estado = "inmovilizado";
  }

  automotor.updated_at = new Date();
  await automotor.save();

  // Sincronización inversa con ms-personas — fire-and-forget (no bloquea la respuesta)
  const docChanged = data.propietario_documento !== undefined
    && data.propietario_documento !== oldPropietarioDocumento;

  if (docChanged) {
    Promise.resolve().then(async () => {
      try {
        const personasApiUrl = buildPersonasApiUrl();
        const findRes = await syncFetch(
          `${personasApiUrl}/personas/documento/${encodeURIComponent(oldPropietarioDocumento)}`
        );
        if (!findRes || !findRes.ok) return;

        const result = await findRes.json();
        const persona = result.data;
        if (!persona?.id) return;

        const updatePayload = { numero_documento: data.propietario_documento };
        if (data.propietario_nombre && data.propietario_nombre !== oldPropietarioNombre) {
          updatePayload.nombres = data.propietario_nombre;
        }

        await syncFetch(`${personasApiUrl}/personas/${persona.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": "admin",
            "x-user-id": "internal-sync",
          },
          body: JSON.stringify(updatePayload),
        });
      } catch (err) {
        console.error("[automotores→personas] Error en sincronización:", err.message);
      }
    });
  }

  return automotor;
}

export async function changeAutomotorStatus(id, estado) {
  // paranoid: true — findByPk excluye deleted_at automáticamente
  const automotor = await Automotor.findByPk(id);
  if (!automotor) throw new Error("Automotor no encontrado");

  const estadoNorm = estado.toLowerCase();
  if (!["activo", "inactivo", "inmovilizado"].includes(estadoNorm)) {
    throw new Error("Estado inválido");
  }

  automotor.estado = estadoNorm;
  automotor.updated_at = new Date();
  await automotor.save();

  return automotor;
}

export async function deleteAutomotor(id) {
  const automotor = await Automotor.findByPk(id);
  if (!automotor) throw new Error("Automotor no encontrado");

  automotor.estado = "inactivo";
  // paranoid: true — destroy() pone deleted_at automáticamente
  await automotor.destroy();
}

export async function getAutomotorByPlaca(placa) {
  return Automotor.findOne({
    where: { placa: placa.toUpperCase() },
    // paranoid: true excluye deleted_at automáticamente
  });
}

export async function getAutomotoresByPropietario(documento) {
  return Automotor.findAll({
    where: { propietario_documento: documento },
    order: [["created_at", "DESC"]],
  });
}

export async function inmovilizarAutomotorPorPlaca(placa) {
  const automotor = await Automotor.findOne({
    where: { placa: placa.toUpperCase() },
  });

  if (!automotor) throw new Error(`Automotor con placa ${placa} no encontrado`);

  automotor.estado = "inmovilizado";
  automotor.updated_at = new Date();
  await automotor.save();

  return automotor;
}

/**
 * Sincronización masiva de datos de propietario (llamado desde ms-personas).
 * Ya era eficiente (1 UPDATE bulk) — se mantiene igual.
 */
export async function actualizarDatosPropietarioMasivo(oldDocumento, newDocumento, newNombre) {
  if (!oldDocumento) throw new Error("Documento original requerido para la sincronización");

  const updateFields = {};
  if (newDocumento) updateFields.propietario_documento = newDocumento;
  if (newNombre) updateFields.propietario_nombre = newNombre;

  if (Object.keys(updateFields).length === 0) return 0;

  const [affectedRows] = await Automotor.update(updateFields, {
    where: { propietario_documento: oldDocumento },
  });

  return affectedRows;
}