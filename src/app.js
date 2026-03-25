import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import reportesRoutes from "./routes/reportes.routes.js";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "SIMCOMP ms-reportes Docs"
}));

app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: process.env.SERVICE_NAME || "ms-reportes",
    status: "OK",
  });
});

app.use("/api/reportes", reportesRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada"
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Error interno del servidor"
  });
});

export default app;
