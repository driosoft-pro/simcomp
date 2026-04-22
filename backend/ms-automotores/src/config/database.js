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
    logging: false,
  }
);

export default sequelize;