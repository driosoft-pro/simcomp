import sequelize from "../config/database.js";
import "../models/infracciones.model.js";

async function syncDB() {
  try {
    console.log("Starting database synchronization...");
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error synchronizing database:", error);
    process.exit(1);
  }
}

syncDB();
