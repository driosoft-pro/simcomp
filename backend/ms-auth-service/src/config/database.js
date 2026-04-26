import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

const isDev = process.env.NODE_ENV !== "production";

const sequelize = new Sequelize(
  getEnv("AUTH_DB_NAME"),
  getEnv("AUTH_DB_USER"),
  getEnv("AUTH_DB_PASSWORD"),
  {
    host: getEnv("AUTH_DB_HOST"),
    port: Number(getEnv("AUTH_DB_PORT")),
    dialect: "postgres",
    // Solo loguea queries en modo DEBUG explícito
    logging: process.env.DB_DEBUG === "true" ? console.log : false,
    pool: {
      min: 2,           // Mantener al menos 2 conexiones listas
      max: 20,          // Máximo 20 conexiones simultáneas
      acquire: 15000,   // 15s para obtener una conexión antes de error
      idle: 10000,      // Cerrar conexiones inactivas tras 10s
      evict: 5000,      // Revisar conexiones huerfanas cada 5s
    },
    dialectOptions: {
      // Timeout de statement a nivel de Postgres (30s max por query)
      statement_timeout: 30000,
      // Timeout de conexión TCP
      connectTimeout: 10000,
    },
  }
);

export default sequelize;