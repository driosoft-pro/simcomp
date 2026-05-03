import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

export const env = {
  serviceName: getEnv("SERVICE_NAME", "ms-reportes"),
  port: Number(getEnv("PORT", 8006)),
  nodeEnv: getEnv("NODE_ENV", "production"),

  authServiceUrl: getEnv("AUTH_SERVICE_URL", "http://ms-auth:8001"),
  personasServiceUrl: getEnv("PERSONAS_SERVICE_URL", "http://ms-personas:8002"),
  automotoresServiceUrl: getEnv("AUTOMOTORES_SERVICE_URL", "http://ms-automotores:8003"),
  infraccionesServiceUrl: getEnv("INFRACCIONES_SERVICE_URL", "http://ms-infracciones:8004"),
  comparendosServiceUrl: getEnv("COMPARENDOS_SERVICE_URL", "http://ms-comparendos:8005"),

  requestTimeoutMs: Number(getEnv("REQUEST_TIMEOUT_MS", 5000)),
  maxImportRows: Number(getEnv("MAX_IMPORT_ROWS", 10000)),
};