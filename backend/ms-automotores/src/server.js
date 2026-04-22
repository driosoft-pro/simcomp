import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 8003;

async function start(retries = 5) {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("Database connection established");

      app.listen(PORT, () => {
        console.log(`[${process.env.SERVICE_NAME}] running on port ${PORT}`);
      });
      return;
    } catch (error) {
      console.error(`Database error: ${error.message}. Retries left: ${retries - 1}`);
      retries--;
      if (retries === 0) {
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

start();