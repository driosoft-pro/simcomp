import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

export const env = {
  serviceName: getEnv("SERVICE_NAME"),
  port: Number(getEnv("PORT")),
  nodeEnv: getEnv("NODE_ENV"),

  authServiceUrl: getEnv("AUTH_SERVICE_URL"),
  personasServiceUrl: getEnv("PERSONAS_SERVICE_URL"),
  automotoresServiceUrl: getEnv("AUTOMOTORES_SERVICE_URL"),
  infraccionesServiceUrl: getEnv("INFRACCIONES_SERVICE_URL"),
  comparendosServiceUrl: getEnv("COMPARENDOS_SERVICE_URL"),

  requestTimeoutMs: Number(getEnv("REQUEST_TIMEOUT_MS")),
  maxImportRows: Number(getEnv("MAX_IMPORT_ROWS")),
};