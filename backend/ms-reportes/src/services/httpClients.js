import axios from "axios";
import { env } from "../config/env.js";

// ── Cliente HTTP con timeout configurable ─────────────────────────────────────
// Sin timeout explícito, un microservicio caído bloquea el event loop
// hasta que el OS cierre la conexión (puede ser minutos).
const client = axios.create({
  timeout: env.requestTimeoutMs || 8000,
  headers: { "Content-Type": "application/json" },
});

export const moduleConfig = {
  usuarios: {
    baseUrl: env.authServiceUrl,
    getPath: "/api/usuarios",
    postPath: "/api/usuarios",
  },
  personas: {
    baseUrl: env.personasServiceUrl,
    getPath: "/api/personas",
    postPath: "/api/personas",
  },
  automotores: {
    baseUrl: env.automotoresServiceUrl,
    getPath: "/api/automotores",
    postPath: "/api/automotores",
  },
  infracciones: {
    baseUrl: env.infraccionesServiceUrl,
    getPath: "/api/infracciones",
    postPath: "/api/infracciones",
  },
  comparendos: {
    baseUrl: env.comparendosServiceUrl,
    getPath: "/api/comparendos",
    postPath: "/api/comparendos",
  },
};

export function assertModule(modulo) {
  if (!moduleConfig[modulo]) {
    const disponibles = Object.keys(moduleConfig).join(", ");
    throw new Error(`Modulo no soportado: ${modulo}. Modulos disponibles: ${disponibles}`);
  }
}

/**
 * Obtiene datos de un módulo con soporte de paginación para evitar
 * traer el dataset completo cuando no es necesario.
 *
 * @param {string} modulo
 * @param {string} token
 * @param {object} [opts]
 * @param {object} [opts.limit]   - Limitar cantidad de registros
 * @param {object} [opts.page]    - Página (para paginación)
 * @param {boolean} [opts.full]   - Si es true, devuelve {data, total}
 */
export async function fetchModuleData(modulo, token, { limit, page, full = false } = {}) {
  assertModule(modulo);

  const config = moduleConfig[modulo];
  const headers = token ? { Authorization: token } : {};

  // Construir query params si el módulo soporta paginación
  const params = {};
  if (limit && limit !== "all") params.limit = limit;
  if (page) params.page = page;

  const response = await client.get(`${config.baseUrl}${config.getPath}`, {
    headers,
    params: Object.keys(params).length ? params : undefined,
  });

  // Normalizar estructura de respuesta (array directo, .data, o .data.data)
  const total = response.data?.total || response.data?.count || null;
  let data = [];

  if (Array.isArray(response.data)) data = response.data;
  else if (Array.isArray(response.data?.data)) data = response.data.data;
  else if (Array.isArray(response.data?.rows)) data = response.data.rows;

  // Si se pide el objeto completo y tenemos total, lo devolvemos
  if (full && total !== null) {
    return { data, total: Number(total) };
  }

  // Por defecto siempre devolvemos el array para compatibilidad con toCsv/forEach
  return data;
}

/**
 * Importa una fila en un módulo remoto.
 */
export async function postModuleRow(modulo, row, token) {
  assertModule(modulo);

  const config = moduleConfig[modulo];
  const headers = token ? { Authorization: token } : {};
  const response = await client.post(`${config.baseUrl}${config.postPath}`, row, { headers });
  return response.data;
}