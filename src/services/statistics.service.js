import { fetchModuleData } from "./httpClients.js";

// ── Cache de estadísticas ─────────────────────────────────────────────────────
// buildGeneralStatistics hace 5 llamadas HTTP a todos los microservicios.
// Es el endpoint más caro del sistema y sus datos no cambian por segundo.
// Cache de 60 segundos: suficiente para dashboards, sin datos obsoletos.
const STATS_CACHE = new Map();
const STATS_TTL_MS = 60_000; // 60 segundos

function getCachedStats(key) {
  const entry = STATS_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    STATS_CACHE.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedStats(key, data) {
  STATS_CACHE.set(key, { data, expiresAt: Date.now() + STATS_TTL_MS });
}

/**
 * Calcula estadísticas generales del sistema.
 * Optimizaciones:
 * - Cache de 60s para evitar 5 llamadas HTTP repetidas
 * - Todos los fetches en paralelo con Promise.all
 * - Solicita limit=1000 a módulos que pueden tener miles de registros
 *   (para estadísticas de conteo solo necesitamos los datos, no todos)
 */
export async function buildGeneralStatistics(token) {
  // Clave de cache basada en si hay token (datos de admin vs público)
  const cacheKey = token ? `stats:auth` : `stats:public`;
  const cached = getCachedStats(cacheKey);
  if (cached) return cached;

  // Fetch en paralelo — los 5 microservicios responden simultáneamente
  const [usuarios, personas, automotores, infracciones, comparendos] = await Promise.all([
    fetchModuleData("usuarios", token, { limit: 5000 }),
    fetchModuleData("personas", token, { limit: 5000 }),
    fetchModuleData("automotores", token, { limit: 5000 }),
    fetchModuleData("infracciones", token, { limit: 5000 }),
    fetchModuleData("comparendos", token, { limit: 5000 }),
  ]);

  // Agrupaciones en una sola pasada por array (evitar múltiples reduce)
  const comparendosPorEstado = {};
  for (const item of comparendos) {
    const estado = item.estado || "SIN_ESTADO";
    comparendosPorEstado[estado] = (comparendosPorEstado[estado] || 0) + 1;
  }

  const usuariosPorRol = {};
  for (const item of usuarios) {
    const rol = item.rol || "SIN_ROL";
    usuariosPorRol[rol] = (usuariosPorRol[rol] || 0) + 1;
  }

  const result = {
    resumen: {
      totalUsuarios: usuarios.length,
      totalPersonas: personas.length,
      totalAutomotores: automotores.length,
      totalInfracciones: infracciones.length,
      totalComparendos: comparendos.length,
    },
    usuariosPorRol,
    comparendosPorEstado,
    // Exponer tiempo de generación para monitoreo
    generatedAt: new Date().toISOString(),
  };

  setCachedStats(cacheKey, result);
  return result;
}

/**
 * Invalida el cache de estadísticas (útil si se necesita forzar refresco).
 */
export function invalidateStatisticsCache() {
  STATS_CACHE.clear();
}