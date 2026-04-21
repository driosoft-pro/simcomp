import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

export const env = {
  serviceName: getEnv("SERVICE_NAME", "ms-reportes"),
  port: Number(getEnv("PORT", 8006)),
  nodeEnv: getEnv("NODE_ENV", "development"),

  authServiceUrl: getEnv("AUTH_SERVICE_URL", "http://127.0.0.1:8001"),
  personasServiceUrl: getEnv("PERSONAS_SERVICE_URL", "http://127.0.0.1:8002"),
  automotoresServiceUrl: getEnv("AUTOMOTORES_SERVICE_URL", "http://127.0.0.1:8003"),
  infraccionesServiceUrl: getEnv("INFRACCIONES_SERVICE_URL", "http://127.0.0.1:8004"),
  comparendosServiceUrl: getEnv("COMPARENDOS_SERVICE_URL", "http://127.0.0.1:8005"),

  requestTimeoutMs: Number(getEnv("REQUEST_TIMEOUT_MS", 15000)),
  maxImportRows: Number(getEnv("MAX_IMPORT_ROWS", 10000)),
};