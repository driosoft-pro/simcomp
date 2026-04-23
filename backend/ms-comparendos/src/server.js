import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
import { getEnv } from "./utils/env.js";
import "./models/comparendo.model.js";
import "./models/comparendoEstadoHistorial.model.js";

dotenv.config();

const PORT = getEnv("PORT");
const SERVICE_NAME = getEnv("SERVICE_NAME");

async function startServer(retries = 30) {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("Database connection established");

      app.listen(PORT, () => {
        console.log(`[${SERVICE_NAME}] running on port ${PORT}`);
      });
      return;
    } catch (error) {
      console.error(`Unable to connect to database: ${error.message}`);
      console.error(`Retries left: ${retries - 1}`);
      retries--;
      if (retries === 0) {
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

startServer();