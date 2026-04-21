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
  getEnv("DB_NAME", "infracciones_db"),
  getEnv("DB_USER", "admin"),
  getEnv("DB_PASSWORD", "admin123"),
  {
    host: getEnv("DB_HOST", "localhost"),
    port: Number(getEnv("DB_PORT", 5435)),
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;