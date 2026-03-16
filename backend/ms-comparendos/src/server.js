import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
import "./models/comparendo.model.js";
import "./models/comparendoEstadoHistorial.model.js";

dotenv.config();

const PORT = process.env.PORT || 8005;
const SERVICE_NAME = process.env.SERVICE_NAME || "ms-comparendos";

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established");

    app.listen(PORT, () => {
      console.log(`[${SERVICE_NAME}] running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to database:", error.message);
    process.exit(1);
  }
}

startServer();