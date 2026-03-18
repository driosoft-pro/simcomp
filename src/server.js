import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
import "./models/persona.model.js";
import "./models/licencia.model.js";

dotenv.config();

const PORT = process.env.PORT || 8002;
const SERVICE_NAME = process.env.SERVICE_NAME || "ms-personas";

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    app.listen(PORT, () => {
      console.log(`[${SERVICE_NAME}] running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
}

startServer();