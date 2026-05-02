import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import { swaggerUi, swaggerSpec } from "./swagger/swagger.js";
import { getEnv } from "./utils/env.js";
import client from "prom-client";

// Configuración de métricas de Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Métrica personalizada: Contador de logins
const loginCounter = new client.Counter({
  name: "auth_login_total",
  help: "Total de intentos de login",
  labelNames: ["status"],
});
register.registerMetric(loginCounter);

const app = express();

// ── Seguridad ────────────────────────────────────────────────────────────────
app.use(helmet({
  hsts: false,
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Id", "X-User-Role", "X-User-Username", "X-User-Email"],
  credentials: true
}));

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

    // Eliminado el bucle de limpieza por solicitud para evitar picos de latencia.
    // La limpieza se maneja ahora mediante un intervalo global.

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

// Limpieza periódica del store de rate limit (cada 5 minutos)
// Esto evita el O(N) en el hilo de la solicitud, mejorando el rendimiento.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of rateLimitStore) {
    if (now > v.resetAt) rateLimitStore.delete(k);
  }
}, 300_000);

// Login: máx 500 intentos por IP por minuto.
// Aumentado para soportar ráfagas de alta concurrencia (300+ usuarios).
const loginRateLimit = simpleRateLimit({
  windowMs: 60_000,
  max: 500,
  keyFn: (req) => req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip || "unknown",
});

// Refresh: máx 1000 por IP por minuto
const refreshRateLimit = simpleRateLimit({
  windowMs: 60_000,
  max: 1000,
  keyFn: (req) => req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip || "unknown",
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

// ── Prometheus Metrics ───────────────────────────────────────────────────────
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ── Rutas ────────────────────────────────────────────────────────────────────
// Aplicar rate limit solo en los endpoints públicos más sensibles
app.use("/api/auth/login", loginRateLimit);
app.use("/api/auth/refresh", refreshRateLimit);

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usersRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;