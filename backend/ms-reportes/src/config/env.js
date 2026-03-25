import dotenv from "dotenv";

dotenv.config();

export const env = {
  serviceName: process.env.SERVICE_NAME || "ms-reportes",
  port: Number(process.env.PORT || 8006),
  nodeEnv: process.env.NODE_ENV || "development",

  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:8001",
  personasServiceUrl: process.env.PERSONAS_SERVICE_URL || "http://localhost:8002",
  automotoresServiceUrl: process.env.AUTOMOTORES_SERVICE_URL || "http://localhost:8003",
  infraccionesServiceUrl: process.env.INFRACCIONES_SERVICE_URL || "http://localhost:8004",
  comparendosServiceUrl: process.env.COMPARENDOS_SERVICE_URL || "http://localhost:8005",

  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 15000),
  maxImportRows: Number(process.env.MAX_IMPORT_ROWS || 10000),
};