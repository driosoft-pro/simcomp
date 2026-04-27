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
      service="ms-automotores"

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY package.json ./

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8003

ENV NODE_ENV=production

CMD ["node", "src/server.js"]