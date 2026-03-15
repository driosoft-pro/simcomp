import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import automotoresRoutes from "./routes/automotores.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: process.env.SERVICE_NAME,
    status: "OK",
  });
});

app.use("/api/automotores", automotoresRoutes);

export default app;