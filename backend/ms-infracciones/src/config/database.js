import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { getEnv } from "../utils/env.js";

dotenv.config();


/*
Configuración de conexión a PostgreSQL para el microservicio
de infracciones.

Las variables deben definirse en el .env del servicio.
*/

const sequelize = new Sequelize(
  getEnv("INFRACCIONES_DB_NAME"),
  getEnv("INFRACCIONES_DB_USER"),
  getEnv("INFRACCIONES_DB_PASSWORD"),
  {
    host: getEnv("INFRACCIONES_DB_HOST"),
    port: Number(getEnv("INFRACCIONES_DB_PORT")),
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;