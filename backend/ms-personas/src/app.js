import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import personasRoutes from "./routes/personas.routes.js";
import licenciasRoutes from "./routes/licencias.routes.js";
import swaggerSpec from "./swagger/swagger.js";

const app = express();

app.use(helmet({
  hsts: false,
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (req, res) => {
  console.log("Health check requested for ms-personas");
  res.status(200).json({
    ok: true,
    service: process.env.SERVICE_NAME || "ms-personas",
    status: "running",
  });
});

app.use("/api/personas", personasRoutes);
app.use("/api/licencias", licenciasRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
  });
});

export default app;