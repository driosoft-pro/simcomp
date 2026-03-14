# SIMCOMP — Backend · Desarrollo Local con Docker

Guía para levantar los 5 microservicios del backend en local con Docker Compose.

---

## Requisitos

| Herramienta    | Versión mínima |
|----------------|----------------|
| Docker Desktop | 24             |
| Git            | cualquiera     |

---

## Estructura del Backend

```
backend/
├── auth-service/            ← :3001 · usuarios_db
├── personas-service/        ← :3002 · personas_db
├── vehiculos-service/       ← :3003 · vehiculos_db
├── infracciones-service/    ← :3004 · infracciones_db
└── comparendos-service/     ← :3005 · comparendos_db  ★ CORE
```

---

## Autenticación (auth-service)

**`usuarios_db`** tiene dos tablas:

| Tabla          | Campos clave                                                |
|----------------|-------------------------------------------------------------|
| usuarios       | username, email, password_hash, rol (admin/agente/supervisor), activo |
| refresh_tokens | usuario_id, token, expires_at, revocado                     |

**Roles:**

| Rol        | Permisos                                                   |
|------------|------------------------------------------------------------|
| admin      | CRUD completo en todos los módulos + gestión de usuarios   |
| agente     | Crear comparendos, registrar personas y vehículos, pagar   |
| supervisor | Solo consultas + anular comparendos                        |

---

## Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3001
CMD ["node", "src/server.js"]
```

---

## Docker Compose

```yaml
version: '3.8'

services:
  auth-service:
    build: { context: ./backend/auth-service }
    container_name: auth-service
    ports: ["3001:3001"]
    environment:
      NODE_ENV: development
      PORT: 3001
      DB_HOST: auth-db
      DB_NAME: usuarios_db
      DB_USER: postgres
      DB_PASSWORD: postgres123
      JWT_SECRET: simcomp_dev_secret_2025
      JWT_ACCESS_EXPIRY: 15m
      JWT_REFRESH_EXPIRY: 7d
    depends_on:
      auth-db: { condition: service_healthy }
    networks: [comparendos-network]

  personas-service:
    build: { context: ./backend/personas-service }
    container_name: personas-service
    ports: ["3002:3002"]
    environment:
      NODE_ENV: development
      PORT: 3002
      DB_HOST: personas-db
      DB_NAME: personas_db
      DB_USER: postgres
      DB_PASSWORD: postgres123
      JWT_SECRET: simcomp_dev_secret_2025
    depends_on:
      personas-db: { condition: service_healthy }
      auth-service: { condition: service_started }
    networks: [comparendos-network]

  vehiculos-service:
    build: { context: ./backend/vehiculos-service }
    container_name: vehiculos-service
    ports: ["3003:3003"]
    environment:
      NODE_ENV: development
      PORT: 3003
      DB_HOST: vehiculos-db
      DB_NAME: vehiculos_db
      DB_USER: postgres
      DB_PASSWORD: postgres123
      JWT_SECRET: simcomp_dev_secret_2025
      PERSONAS_SERVICE_URL: http://personas-service:3002
    depends_on:
      vehiculos-db: { condition: service_healthy }
      auth-service: { condition: service_started }
    networks: [comparendos-network]

  infracciones-service:
    build: { context: ./backend/infracciones-service }
    container_name: infracciones-service
    ports: ["3004:3004"]
    environment:
      NODE_ENV: development
      PORT: 3004
      DB_HOST: infracciones-db
      DB_NAME: infracciones_db
      DB_USER: postgres
      DB_PASSWORD: postgres123
      JWT_SECRET: simcomp_dev_secret_2025
    depends_on:
      infracciones-db: { condition: service_healthy }
      auth-service: { condition: service_started }
    networks: [comparendos-network]

  comparendos-service:
    build: { context: ./backend/comparendos-service }
    container_name: comparendos-service
    ports: ["3005:3005"]
    environment:
      NODE_ENV: development
      PORT: 3005
      DB_HOST: comparendos-db
      DB_NAME: comparendos_db
      DB_USER: postgres
      DB_PASSWORD: postgres123
      JWT_SECRET: simcomp_dev_secret_2025
      PERSONAS_SERVICE_URL: http://personas-service:3002
      VEHICULOS_SERVICE_URL: http://vehiculos-service:3003
      INFRACCIONES_SERVICE_URL: http://infracciones-service:3004
    depends_on:
      comparendos-db: { condition: service_healthy }
      auth-service: { condition: service_started }
      personas-service: { condition: service_started }
      vehiculos-service: { condition: service_started }
      infracciones-service: { condition: service_started }
    networks: [comparendos-network]

  # ── Bases de datos ────────────────────────────────────────────────
  auth-db:
    image: postgres:15-alpine
    container_name: auth-db
    environment: { POSTGRES_DB: usuarios_db, POSTGRES_USER: postgres, POSTGRES_PASSWORD: postgres123 }
    ports: ["5437:5432"]
    volumes: [auth_data:/var/lib/postgresql/data]
    networks: [comparendos-network]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 10s, retries: 5 }

  personas-db:
    image: postgres:15-alpine
    container_name: personas-db
    environment: { POSTGRES_DB: personas_db, POSTGRES_USER: postgres, POSTGRES_PASSWORD: postgres123 }
    ports: ["5433:5432"]
    volumes: [personas_data:/var/lib/postgresql/data]
    networks: [comparendos-network]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 10s, retries: 5 }

  vehiculos-db:
    image: postgres:15-alpine
    container_name: vehiculos-db
    environment: { POSTGRES_DB: vehiculos_db, POSTGRES_USER: postgres, POSTGRES_PASSWORD: postgres123 }
    ports: ["5434:5432"]
    volumes: [vehiculos_data:/var/lib/postgresql/data]
    networks: [comparendos-network]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 10s, retries: 5 }

  infracciones-db:
    image: postgres:15-alpine
    container_name: infracciones-db
    environment: { POSTGRES_DB: infracciones_db, POSTGRES_USER: postgres, POSTGRES_PASSWORD: postgres123 }
    ports: ["5435:5432"]
    volumes: [infracciones_data:/var/lib/postgresql/data]
    networks: [comparendos-network]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 10s, retries: 5 }

  comparendos-db:
    image: postgres:15-alpine
    container_name: comparendos-db
    environment: { POSTGRES_DB: comparendos_db, POSTGRES_USER: postgres, POSTGRES_PASSWORD: postgres123 }
    ports: ["5436:5432"]
    volumes: [comparendos_data:/var/lib/postgresql/data]
    networks: [comparendos-network]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 10s, retries: 5 }

networks:
  comparendos-network:
    driver: bridge

volumes:
  auth_data:
  personas_data:
  vehiculos_data:
  infracciones_data:
  comparendos_data:
```

### Puertos

| Servicio             | App  | DB host | DB nombre       |
|----------------------|------|---------|-----------------|
| auth-service         | 3001 | 5437    | usuarios_db     |
| personas-service     | 3002 | 5433    | personas_db     |
| vehiculos-service    | 3003 | 5434    | vehiculos_db    |
| infracciones-service | 3004 | 5435    | infracciones_db |
| comparendos-service  | 3005 | 5436    | comparendos_db  |

---

## Levantar

```bash
docker compose up --build    # primera vez
docker compose up -d         # siguiente vez
```

---

## ✅ Verificar

```bash
curl http://localhost:3001/api/health
curl http://localhost:3002/api/health
curl http://localhost:3003/api/health
curl http://localhost:3004/api/health
curl http://localhost:3005/api/health
```

Swagger UI: `http://localhost:300X/api/docs` (X = 1 al 5)

---

## Endpoints

### Auth — :3001

| Método | Ruta               | Acceso  | Descripción                                |
|--------|--------------------|---------|--------------------------------------------|
| GET    | /api/health        | público | Health check                               |
| POST   | /api/auth/register | público | Crear usuario del sistema                  |
| POST   | /api/auth/login    | público | Login → access_token (15m) + refresh (7d)  |
| POST   | /api/auth/refresh  | público | Renovar access_token                       |
| POST   | /api/auth/logout   | JWT     | Revocar refresh_token                      |
| POST   | /api/auth/validate | interno | Validar JWT (usado por Nginx como subrequest) |
| GET    | /api/auth/me       | JWT     | Perfil del usuario autenticado             |
| GET    | /api/usuarios      | admin   | Listar usuarios                            |
| PUT    | /api/usuarios/:id  | admin   | Actualizar usuario                         |
| DELETE | /api/usuarios/:id  | admin   | Desactivar usuario                         |

### Personas — :3002

| Método | Ruta                           | Rol     | Descripción              |
|--------|--------------------------------|---------|--------------------------|
| GET    | /api/health                    | público | Health check             |
| GET    | /api/personas                  | agente  | Listar                   |
| POST   | /api/personas                  | agente  | Crear                    |
| GET    | /api/personas/:id              | agente  | Por ID                   |
| GET    | /api/personas/documento/:num   | agente  | Por documento            |
| PUT    | /api/personas/:id              | agente  | Actualizar               |
| DELETE | /api/personas/:id              | admin   | Desactivar               |
| GET    | /api/personas/:id/licencias    | agente  | Licencias de la persona  |
| POST   | /api/personas/:id/licencias    | agente  | Agregar licencia         |
| PUT    | /api/licencias/:id             | agente  | Actualizar licencia      |

### Vehículos — :3003

| Método | Ruta                            | Rol    | Descripción       |
|--------|---------------------------------|--------|-------------------|
| GET    | /api/vehiculos                  | agente | Listar            |
| POST   | /api/vehiculos                  | agente | Registrar         |
| GET    | /api/vehiculos/:id              | agente | Por ID            |
| GET    | /api/vehiculos/placa/:placa     | agente | Por placa         |
| GET    | /api/vehiculos/propietario/:pId | agente | Por propietario   |
| PUT    | /api/vehiculos/:id              | agente | Actualizar        |
| DELETE | /api/vehiculos/:id              | admin  | Desactivar        |

### Infracciones — :3004

| Método | Ruta                           | Rol   | Descripción     |
|--------|--------------------------------|-------|-----------------|
| GET    | /api/infracciones              | agente| Listar          |
| POST   | /api/infracciones              | admin | Crear           |
| GET    | /api/infracciones/:id          | agente| Por ID          |
| GET    | /api/infracciones/codigo/:cod  | agente| Por código      |
| PUT    | /api/infracciones/:id          | admin | Actualizar      |
| DELETE | /api/infracciones/:id          | admin | Desactivar      |

### Comparendos — :3005 ★

| Método | Ruta                            | Rol        | Descripción             |
|--------|---------------------------------|------------|-------------------------|
| GET    | /api/comparendos                | supervisor | Listar con filtros      |
| POST   | /api/comparendos                | agente     | Crear comparendo        |
| GET    | /api/comparendos/:id            | supervisor | Detallado               |
| GET    | /api/comparendos/numero/:num    | supervisor | Por número              |
| GET    | /api/comparendos/persona/:pId   | supervisor | Por persona             |
| GET    | /api/comparendos/vehiculo/:vId  | supervisor | Por vehículo            |
| PATCH  | /api/comparendos/:id/pagar      | agente     | → PAGADO                |
| PATCH  | /api/comparendos/:id/anular     | supervisor | → ANULADO               |

---

## Comandos Útiles

```bash
docker compose ps
docker compose logs -f auth-service
docker compose exec auth-db psql -U postgres -d usuarios_db
docker compose down          # preserva datos
docker compose down -v       # reset completo de DBs
```

---

## Solución de Problemas

**401 en endpoints:**
```bash
# Hacer login primero
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@simcomp.co","password":"Admin123!"}'

# Usar el access_token
curl http://localhost:3002/api/personas \
  -H "Authorization: Bearer <access_token>"
```

**Reset completo:** `docker compose down -v --remove-orphans && docker compose up --build`

---

*SIMCOMP Backend — Docker Compose · Node.js 20 + PostgreSQL 15 · JWT + Roles · v1.0.0*