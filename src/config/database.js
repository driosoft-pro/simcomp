import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { getEnv } from "../utils/env.js";

dotenv.config();

const sequelize = new Sequelize(
  getEnv("COMPARENDOS_DB_NAME"),
  getEnv("COMPARENDOS_DB_USER"),
  getEnv("COMPARENDOS_DB_PASSWORD"),
  {
    host: getEnv("COMPARENDOS_DB_HOST"),
    port: Number(getEnv("COMPARENDOS_DB_PORT")),
    dialect: "postgres",
    // Solo activo si DB_DEBUG=true en entorno
    logging: process.env.DB_DEBUG === "true" ? console.log : false,
    define: {
      freezeTableName: true,
    },
    pool: {
      min: 2,          // Conexiones mínimas calientes
      max: 20,         // Máximo bajo carga (Swarm: 20 * nReplicas)
      acquire: 15000,  // 15s para obtener conexión antes de error
      idle: 10000,     // Cerrar conexiones inactivas tras 10s
      evict: 5000,     // Revisar conexiones huérfanas cada 5s
    },
    dialectOptions: {
      statement_timeout: 30000, // 30s max por query en Postgres
      connectTimeout: 10000,
    },
  }
);

export default sequelize;