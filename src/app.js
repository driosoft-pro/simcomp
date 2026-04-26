import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import comparendosRoutes from "./routes/comparendos.routes.js";
import swaggerSpec from "./swagger/swagger.js";
import { verifyToken } from "./middlewares/auth.middleware.js";

const app = express();

// ── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet({
  hsts: false,
  contentSecurityPolicy: false,
}));
app.use(cors());

// ── Logging (dev: completo / prod: solo errores) ──────────────────────────────
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("tiny", {
    skip: (req, res) => res.statusCode < 400,
  }));
}

// ── Parsing (body limitado para evitar ataques de payload gigante) ────────────
app.use(express.json({ limit: "200kb" }));

// ── Auth middleware (inyecta headers desde JWT si no vienen del gateway) ──────
app.use(verifyToken);

// ── Health check (sin auth requerida) ────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: process.env.SERVICE_NAME || "ms-comparendos",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
app.use("/api", comparendosRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;