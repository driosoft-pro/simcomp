import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();

const sequelize = new Sequelize(
  getEnv("AUTH_DB_NAME"),
  getEnv("AUTH_DB_USER"),
  getEnv("AUTH_DB_PASSWORD"),
  {
    host: getEnv("AUTH_DB_HOST"),
    port: Number(getEnv("AUTH_DB_PORT")),
    dialect: "postgres",
    logging: false,
  }
);



export default sequelize;