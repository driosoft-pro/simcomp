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