import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

const sequelize = new Sequelize(
  getEnv("AUTOMOTORES_DB_NAME"),
  getEnv("AUTOMOTORES_DB_USER"),
  getEnv("AUTOMOTORES_DB_PASSWORD"),
  {
    host: getEnv("AUTOMOTORES_DB_HOST"),
    port: Number(getEnv("AUTOMOTORES_DB_PORT")),
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
  }
);

export default sequelize;