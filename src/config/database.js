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
    logging: false,
    define: {
      freezeTableName: true,
    },
  }
);

export default sequelize;