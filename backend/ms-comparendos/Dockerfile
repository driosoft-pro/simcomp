# ── Stage 1: dependencias de producción ──────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Copiar solo manifests para cachear esta capa si no cambian
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Instalar con pnpm si hay lockfile, sino npm --omit=dev
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm@10 && pnpm install --frozen-lockfile --prod; \
    else \
      npm install --omit=dev; \
    fi

# ── Stage 2: imagen de producción ────────────────────────────────────────────
FROM node:22-alpine AS production

LABEL maintainer="SIMCOMP" \
      service="ms-comparendos"

WORKDIR /app

# Usuario no-root para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Solo node_modules de producción desde la etapa deps
COPY --from=deps /app/node_modules ./node_modules

# Código fuente (capa más cambiante al final para mejor cache)
COPY src ./src
COPY package.json ./

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8005

ENV NODE_ENV=production

CMD ["node", "src/server.js"]