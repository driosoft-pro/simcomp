import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
import { getEnv } from "./utils/env.js";

dotenv.config();

const PORT = getEnv("PORT", 8001);

async function start() {
  try {
    console.log(`Connecting to DB at ${getEnv("DB_HOST", "localhost")}:${getEnv("DB_PORT", 5432)} with user ${getEnv("DB_USER", "admin")}...`);
    await sequelize.authenticate();
    console.log("Database connection established");


    app.listen(PORT, () => {
      console.log(`[${getEnv("SERVICE_NAME", "ms-auth-service")}] running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database error:", error.message);
    process.exit(1);
  }
}

start();