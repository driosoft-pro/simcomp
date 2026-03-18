import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

/*
Configuración de conexión a PostgreSQL para el microservicio
de infracciones.

Las variables deben definirse en el .env del servicio.
*/

const sequelize = new Sequelize(
  process.env.DB_NAME || "infracciones_db",
  process.env.DB_USER || "infracciones_user",
  process.env.DB_PASSWORD || "infracciones_pass",
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5435,
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;