import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 8001;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    app.listen(PORT, () => {
      console.log(`[${process.env.SERVICE_NAME}] running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database error:", error.message);
    process.exit(1);
  }
}

start();