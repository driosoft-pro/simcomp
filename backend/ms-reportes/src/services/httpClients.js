import axios from "axios";
import { env } from "../config/env.js";

const client = axios.create({
  timeout: env.requestTimeoutMs,
  headers: {
    "Content-Type": "application/json"
  }
});

export const moduleConfig = {
  usuarios: {
    baseUrl: env.authServiceUrl,
    getPath: "/api/Usuarios",
    postPath: "/api/Usuarios"
  },
  personas: {
    baseUrl: env.personasServiceUrl,
    getPath: "/api/Personas",
    postPath: "/api/Personas"
  },
  automotores: {
    baseUrl: env.automotoresServiceUrl,
    getPath: "/api/Automotores",
    postPath: "/api/Automotores"
  },
  infracciones: {
    baseUrl: env.infraccionesServiceUrl,
    getPath: "/api/infracciones",
    postPath: "/api/infracciones"
  },
  comparendos: {
    baseUrl: env.comparendosServiceUrl,
    getPath: "/api/comparendos",
    postPath: "/api/comparendos"
  }
};

export function assertModule(modulo) {
  if (!moduleConfig[modulo]) {
    const disponibles = Object.keys(moduleConfig).join(", ");
    throw new Error(`Modulo no soportado: ${modulo}. Modulos disponibles: ${disponibles}`);
  }
}

export async function fetchModuleData(modulo, token) {
  assertModule(modulo);

  const config = moduleConfig[modulo];
  const headers = token ? { Authorization: token } : {};
  const response = await client.get(`${config.baseUrl}${config.getPath}`, { headers });

  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.data?.rows)) return response.data.rows;

  return [];
}

export async function postModuleRow(modulo, row, token) {
  assertModule(modulo);

  const config = moduleConfig[modulo];
  const headers = token ? { Authorization: token } : {};
  const response = await client.post(`${config.baseUrl}${config.postPath}`, row, { headers });
  return response.data;
}