import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
import { getEnv } from "./utils/env.js";

dotenv.config();

const PORT = getEnv("PORT", 8001);

async function start(retries = 5) {
  while (retries > 0) {
    try {
      console.log(`Connecting to DB at ${getEnv("DB_HOST", "localhost")}:${getEnv("DB_PORT", 5432)} with user ${getEnv("DB_USER", "admin")}...`);
      await sequelize.authenticate();
      console.log("Database connection established");

      app.listen(PORT, () => {
        console.log(`[${getEnv("SERVICE_NAME", "ms-auth-service")}] running on port ${PORT}`);
      });
      return; // Éxito, salimos de la función
    } catch (error) {
      console.error(`Database error: ${error.message}. Retries left: ${retries - 1}`);
      retries--;
      if (retries === 0) {
        console.error("Could not connect to database after several attempts. Exiting...");
        process.exit(1);
      }
      // Esperar 3 segundos antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

start();