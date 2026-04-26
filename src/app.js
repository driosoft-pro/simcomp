import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import { swaggerUi, swaggerSpec } from "./swagger/swagger.js";
import { getEnv } from "./utils/env.js";

const app = express();

// ── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet({
  hsts: false,
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(cors());

// ── Parsing ──────────────────────────────────────────────────────────────────
// Limitar tamaño del body para evitar ataques de payload gigante
app.use(express.json({ limit: "100kb" }));

// ── Logging (solo en desarrollo) ─────────────────────────────────────────────
// morgan("dev") en producción genera miles de líneas por segundo → bloquea I/O
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  // En producción: formato mínimo, solo errores (status >= 400)
  app.use(morgan("tiny", {
    skip: (req, res) => res.statusCode < 400,
  }));
}

// ── Rate limiting in-process para endpoints públicos ─────────────────────────
// Protección básica contra brute-force en login/refresh sin dependencias extra.
// Para producción a escala, esto se complementa con rate limiting en HAProxy.
const rateLimitStore = new Map();

function simpleRateLimit({ windowMs, max, keyFn }) {
  return (req, res, next) => {
    const key = keyFn(req);
    const now = Date.now();
    const entry = rateLimitStore.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count++;
    rateLimitStore.set(key, entry);

    // Limpieza periódica para evitar memory leak (cada 10 min aprox)
    if (rateLimitStore.size > 5000) {
      for (const [k, v] of rateLimitStore) {
        if (now > v.resetAt) rateLimitStore.delete(k);
      }
    }

    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        message: "Demasiadas solicitudes. Intenta más tarde.",
      });
    }

    next();
  };
}

// Login: máx 10 intentos por IP por minuto (anti brute-force)
const loginRateLimit = simpleRateLimit({
  windowMs: 60_000,
  max: 10,
  keyFn: (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
});

// Refresh: máx 30 por IP por minuto
const refreshRateLimit = simpleRateLimit({
  windowMs: 60_000,
  max: 30,
  keyFn: (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: getEnv("SERVICE_NAME"),
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas ────────────────────────────────────────────────────────────────────
// Aplicar rate limit solo en los endpoints públicos más sensibles
app.use("/api/auth/login", loginRateLimit);
app.use("/api/auth/refresh", refreshRateLimit);

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usersRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;