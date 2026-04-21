import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

export const config = {
  serviceName: getEnv("SERVICE_NAME", "ms-auth-service"),
  port: Number(getEnv("PORT", 8001)),
  db: {
    host: getEnv("DB_HOST", "localhost"),
    port: Number(getEnv("DB_PORT", 5432)),
    name: getEnv("DB_NAME", "auth_db"),
    user: getEnv("DB_USER", "admin"),
    password: getEnv("DB_PASSWORD", "admin123"),
  },
  jwt: {
    secret: getEnv("JWT_SECRET", "secret123"),
    expiresIn: getEnv("JWT_EXPIRES_IN", "1h"),
    refreshExpiresDays: Number(getEnv("JWT_REFRESH_EXPIRES_DAYS", 7)),
  },
  services: {
    personas: getEnv("PERSONAS_SERVICE_URL", "http://localhost:8002/api"),
  }
};
