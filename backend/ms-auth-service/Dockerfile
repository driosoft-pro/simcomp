# ── Stage 1: dependencias de producción ──────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app

# Instalar dependencias nativas (bcrypt) solo en la etapa de build
RUN apk add --no-cache python3 make g++

# Copiar solo los manifests primero → Docker cachea esta capa si no cambian
COPY package.json pnpm-lock.yaml ./

# Usar pnpm con frozen-lockfile para builds reproducibles y más rápidos
RUN npm install -g pnpm@10 && \
    pnpm install --frozen-lockfile --prod

# ── Stage 2: imagen de producción (sin devDependencies ni build tools) ────────
FROM node:22-alpine AS production

# Metadatos
LABEL maintainer="SIMCOMP" \
      service="ms-auth-service"

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar solo node_modules de producción (sin make/g++/python3)
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente (la capa que cambia más seguido va al final)
COPY src ./src
COPY package.json ./

# Ajustar ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8001

# NODE_ENV=production activa: morgan mínimo, sin swagger en logs, etc.
ENV NODE_ENV=production

CMD ["node", "src/server.js"]
