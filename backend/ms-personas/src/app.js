import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { getEnv } from "./utils/env.js";

import personasRoutes from "./routes/personas.routes.js";
import licenciasRoutes from "./routes/licencias.routes.js";
import swaggerSpec from "./swagger/swagger.js";

const app = express();

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet({ hsts: false, contentSecurityPolicy: false }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Id", "X-User-Role", "X-User-Username", "X-User-Email"],
  credentials: true
}));

// ── Logging (dev: completo / prod: solo errores) ──────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("tiny", { skip: (req, res) => res.statusCode < 400 }));
}

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: "100kb" }));

// ── Health check (sin console.log — llamado frecuentemente por HAProxy) ───────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: getEnv("SERVICE_NAME"),
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/api/personas", personasRoutes);
app.use("/api/licencias", licenciasRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Ruta no encontrada" });
});

export default app;