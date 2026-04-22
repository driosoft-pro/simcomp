import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
import { getEnv } from "./utils/env.js";
import "./models/persona.model.js";
import "./models/licencia.model.js";

dotenv.config();

const PORT = getEnv("PORT", 8002);
const SERVICE_NAME = getEnv("SERVICE_NAME", "ms-personas");


async function startServer(retries = 5) {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("Database connection established");

      app.listen(PORT, () => {
        console.log(`[${SERVICE_NAME}] running on port ${PORT}`);
      });
      return;
    } catch (error) {
      console.error(`Unable to connect to the database: ${error.message}. Retries left: ${retries - 1}`);
      retries--;
      if (retries === 0) {
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

startServer();