import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { getEnv } from "../utils/env.js";

dotenv.config();

const sequelize = new Sequelize(
  getEnv("PERSONAS_DB_NAME"),
  getEnv("PERSONAS_DB_USER"),
  getEnv("PERSONAS_DB_PASSWORD"),
  {
    host: getEnv("PERSONAS_DB_HOST"),
    port: Number(getEnv("PERSONAS_DB_PORT")),
    dialect: "postgres",
    logging: process.env.DB_DEBUG === "true" ? console.log : false,
    define: {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
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
  }
);

export default sequelize;