import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
import { getEnv } from "./utils/env.js";

dotenv.config();

const PORT = getEnv("PORT");

async function start(retries = 30) {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("Database connection established");

      app.listen(PORT, () => {
        console.log(`[${getEnv("SERVICE_NAME")}] running on port ${PORT}`);
      });
      return;
    } catch (error) {
      console.error(`Database error: ${error.message}`);
      console.error(`Retries left: ${retries - 1}`);
      retries--;
      if (retries === 0) {
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

start();