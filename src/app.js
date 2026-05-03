import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import reportesRoutes from "./routes/reportes.routes.js";
import { swaggerSpec } from "./config/swagger.js";
import { env } from "./config/env.js";

const app = express();

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Id", "X-User-Role", "X-User-Username", "X-User-Email"],
  credentials: true
}));

// ── Logging (solo en desarrollo) ─────────────────────────────────────────────
if (env.nodeEnv !== "production") {
  app.use(morgan("dev"));
} else {
  // En producción: formato mínimo, solo errores (status >= 400)
  app.use(morgan("tiny", {
    skip: (req, res) => res.statusCode < 400,
  }));
}

// Logging agresivo para diagnóstico de tráfico
app.use((req, res, next) => {
  console.log(`[DEBUG-TRAFFIC] ${new Date().toISOString()} | Method: ${req.method} | URL: ${req.url} | OriginalURL: ${req.originalUrl} | IP: ${req.ip}`);
  next();
});

// ── Parsing ──────────────────────────────────────────────────────────────────
// 10mb para importación de CSVs. Los archivos ZIP/Excel se generan en stream,
// no aumentan el uso de memoria del body parser.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Docs ──────────────────────────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "SIMCOMP ms-reportes Docs",
}));

app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: env.serviceName,
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
// Doble montaje para asegurar que responda tanto si llega con prefijo como si no
app.use("/api/reportes", reportesRoutes);
app.use("/", reportesRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// ── Error handler global ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  // Solo loguear errores 5xx — los 4xx son normales (validaciones)
  if (!error.status || error.status >= 500) {
    console.error(`[ms-reportes] Error:`, error.message);
  }

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Error interno del servidor",
  });
});

export default app;
