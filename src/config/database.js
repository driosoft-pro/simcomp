import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { getEnv } from "../utils/env.js";

dotenv.config();

const sequelize = new Sequelize(
  getEnv("DB_NAME", "personas_db"),
  getEnv("DB_USER", "admin"),
  getEnv("DB_PASSWORD", "admin123"),
  {
    host: getEnv("DB_HOST", "localhost"),
    port: Number(getEnv("DB_PORT", 5433)),
    dialect: "postgres",

    logging: false,
    define: {
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export default sequelize;