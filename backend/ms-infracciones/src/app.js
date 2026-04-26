import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import infraccionesRoutes from "./routes/infracciones.routes.js";
import { swaggerUi, swaggerSpec } from "./swagger/swagger.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { getEnv } from "./utils/env.js";

const app = express();

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet({ hsts: false, contentSecurityPolicy: false }));
app.use(cors());

// ── Logging (dev: completo / prod: solo errores o resumen) ────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("tiny", { skip: (req, res) => res.statusCode < 400 }));
}

// ── Parsing con límites de tamaño ─────────────────────────────────────────────
app.use(express.json({ limit: "100kb" }));

// ── Health check (HAProxy compatible) ─────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: getEnv("SERVICE_NAME"),
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/api", infraccionesRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Manejo de Errores ─────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;