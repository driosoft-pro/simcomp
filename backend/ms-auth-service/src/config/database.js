import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

const sequelize = new Sequelize(
  getEnv("DB_NAME", "auth_db"),
  getEnv("DB_USER", "admin"),
  getEnv("DB_PASSWORD", "admin123"),
  {
    host: getEnv("DB_HOST", "localhost"),
    port: Number(getEnv("DB_PORT", 5432)),
    dialect: "postgres",
    logging: false,
  }
);



export default sequelize;