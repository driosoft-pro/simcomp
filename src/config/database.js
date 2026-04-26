import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

/**
 * Configuración de conexión a PostgreSQL con Connection Pool y Timeouts
 * optimizados para alta concurrencia en Docker Swarm.
 */
const sequelize = new Sequelize(
  getEnv("INFRACCIONES_DB_NAME"),
  getEnv("INFRACCIONES_DB_USER"),
  getEnv("INFRACCIONES_DB_PASSWORD"),
  {
    host: getEnv("INFRACCIONES_DB_HOST"),
    port: Number(getEnv("INFRACCIONES_DB_PORT")),
    dialect: "postgres",
    logging: process.env.DB_DEBUG === "true" ? console.log : false,
    pool: {
      min: 2,
      max: 20,
      acquire: 15000,
      idle: 10000,
      evict: 5000,
    },
    dialectOptions: {
      statement_timeout: 30000,
      connectTimeout: 10000,
    },
    define: {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      underscored: true,
      freezeTableName: true,
    }
  }
);

export default sequelize;