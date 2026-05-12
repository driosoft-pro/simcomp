# Build
FROM docker.io/library/node:22-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

# Runtime (Nginx)
FROM docker.io/library/nginx:alpine

RUN apk add --no-cache bash gettext

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY env.template.js /usr/share/nginx/html/env.template.js
COPY docker-entrypoint.sh /docker-entrypoint.d/99-runtime-env.sh

RUN chmod +x /docker-entrypoint.d/99-runtime-env.sh

EXPOSE 80