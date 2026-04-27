# ── Stage 1: dependencias de producción ──────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json pnpm-lock.yaml* package-lock.json* ./

RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm@10 && pnpm install --no-frozen-lockfile --prod; \
    else \
      npm install --omit=dev; \
    fi

# ── Stage 2: imagen de producción ─────────────────────────────────────────────
FROM node:22-alpine AS production

LABEL maintainer="SIMCOMP" \
      service="ms-infracciones"

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar solo lo necesario de la etapa anterior y del código fuente
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

# Permisos
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8004

ENV NODE_ENV=production

# Ejecutar node directamente para mejor manejo de señales (SIGTERM/SIGINT)
CMD ["node", "src/server.js"]