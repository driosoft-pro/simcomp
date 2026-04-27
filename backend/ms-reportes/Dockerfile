# ── Stage 1: dependencias de producción ──────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copiar solo manifests primero → Docker cachea esta capa si no cambian
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Instalar solo dependencias de producción
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm@10 && pnpm install --no-frozen-lockfile --prod; \
    else \
      npm install --omit=dev; \
    fi

# ── Stage 2: imagen de producción ─────────────────────────────────────────────
FROM node:22-alpine AS production

LABEL maintainer="SIMCOMP" \
      service="ms-reportes"

WORKDIR /app

# Usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Solo node_modules de producción
COPY --from=deps /app/node_modules ./node_modules

# Código fuente (capa más cambiante al final para máximo cache hit)
COPY src ./src
COPY package.json ./

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8006

ENV NODE_ENV=production

# node directo en vez de npm run start (evita proceso intermedio npm)
CMD ["node", "src/server.js"]