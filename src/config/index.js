import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

export const config = {
  serviceName: getEnv("SERVICE_NAME"),
  port: Number(getEnv("PORT")),
  db: {
    host: getEnv("AUTH_DB_HOST"),
    port: Number(getEnv("AUTH_DB_PORT")),
    name: getEnv("AUTH_DB_NAME"),
    user: getEnv("AUTH_DB_USER"),
    password: getEnv("AUTH_DB_PASSWORD"),
  },
  jwt: {
    secret: getEnv("JWT_SECRET"),
    expiresIn: getEnv("JWT_EXPIRES_IN"),
    refreshExpiresDays: Number(getEnv("JWT_REFRESH_EXPIRES_DAYS")),
  },
  services: {
    personas: getEnv("PERSONAS_SERVICE_URL"),
  }
};
