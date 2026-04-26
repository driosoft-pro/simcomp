import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import automotoresRoutes from "./routes/automotores.routes.js";
import { swaggerUi, swaggerSpec } from "./swagger/swagger.js";
import { getEnv } from "./utils/env.js";

const app = express();

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet({ hsts: false, contentSecurityPolicy: false }));
app.use(cors());

// ── Logging (dev: completo / prod: solo errores) ──────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("tiny", { skip: (req, res) => res.statusCode < 400 }));
}

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "100kb" }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: getEnv("SERVICE_NAME"),
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/api/automotores", automotoresRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;