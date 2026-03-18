# ms-auth-service

Microservicio de autenticación y gestión de usuarios para el proyecto **SIMCOMP**.

Este servicio se encarga de:

- autenticación de usuarios
- generación de **access token** con JWT
- manejo de **refresh tokens**
- consulta y administración básica de usuarios
- validación de roles: `admin`, `agente`, `supervisor`
- documentación de API con Swagger

---

## Tecnologías usadas

- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT
- bcrypt
- Swagger
- Docker Compose

---

## Estructura del microservicio

```text
ms-auth-service/
├── db/
│   └── auth_db.sql
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── users.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   └── refreshToken.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── users.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   └── users.service.js
│   ├── swagger/
│   │   └── swagger.js
│   ├── app.js
│   └── server.js
├── .env
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Qué contiene

### 1. Base de datos
La base de datos PostgreSQL contiene dos tablas principales:

- `usuarios`
- `refresh_tokens`

El script `db/auth_db.sql` crea la estructura inicial y los usuarios semilla.

### 2. Usuarios semilla
Por defecto se manejan estos usuarios:

- `admin`
- `agente1`
- `supervisor1`

Cada uno tiene su rol asociado:

- `admin`
- `agente`
- `supervisor`

### 3. Login flexible
El login puede hacerse con:

- correo electrónico
- nombre de usuario

Se usa el campo `identifier` para aceptar cualquiera de los dos.

### 4. Seguridad
Se implementa:

- contraseña cifrada con `bcrypt`
- `accessToken` con JWT
- `refreshToken` persistido en base de datos
- middleware de autenticación
- middleware de autorización por rol

### 5. Documentación
Swagger queda disponible en:

```text
http://localhost:8001/api/docs/
```

---

## Variables de entorno

Archivo `.env`:

```env
SERVICE_NAME=ms-auth-service
PORT=8001

DB_HOST=localhost
DB_PORT=5433
DB_NAME=auth_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=supersecretkey_auth_2026
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_DAYS=7
```

---

## Instalación

### 1. Instalar dependencias

```bash
pnpm install
```

Si aún no se han instalado manualmente:

```bash
pnpm add express sequelize pg pg-hstore dotenv cors helmet morgan express-validator jsonwebtoken bcrypt uuid swagger-jsdoc swagger-ui-express
pnpm add -D nodemon
```

---

## Ejecución de la base de datos con Docker

Desde la carpeta `ms-auth-service`:

```bash
docker compose up -d
```

Esto levanta PostgreSQL y ejecuta automáticamente el script:

```text
db/auth_db.sql
```

### Verificar contenedor

```bash
docker ps
```

### Entrar a PostgreSQL

```bash
docker exec -it auth-db psql -U postgres -d auth_db
```

### Consultar usuarios

```sql
SELECT id, username, email, rol FROM usuarios;
```

### Consultar refresh tokens

```sql
SELECT * FROM refresh_tokens;
```

---

## Ejecución del microservicio

### Modo desarrollo

```bash
pnpm dev
```

### Modo producción

```bash
pnpm start
```

Si todo está correcto verás algo como:

```text
Database connection established
[ms-auth-service] running on port 8001
```

---

## Endpoints principales

### Health check

```http
GET /api/health
```

### Login

```http
POST /api/auth/login
```

Body:

```json
{
  "identifier": "admin@simcomp.co",
  "password": "Admin123*"
}
```

También funciona con username:

```json
{
  "identifier": "admin",
  "password": "Admin123*"
}
```

### Refresh token

```http
POST /api/auth/refresh
```

Body:

```json
{
  "refreshToken": "token_generado"
}
```

### Logout

```http
POST /api/auth/logout
```

Body:

```json
{
  "refreshToken": "token_generado"
}
```

### Listar usuarios

```http
GET /api/usuarios
```

Requiere token y rol `admin` o `supervisor`.

### Crear usuario

```http
POST /api/usuarios
```

Requiere token y rol `admin`.

### Actualizar usuario

```http
PUT /api/usuarios/:id
```

Requiere token y rol `admin`.

### Cambiar estado

```http
PATCH /api/usuarios/:id/estado
```

Requiere token y rol `admin`.

---

## Pruebas rápidas con curl

### Health

```bash
curl http://localhost:8001/api/health
```

### Login con correo

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@simcomp.co","password":"Admin123*"}'
```

### Login con username

```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"Admin123*"}'
```

### Listar usuarios con token

```bash
curl http://localhost:8001/api/usuarios \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

---

## Cómo conectarlo al frontend

El frontend debe apuntar a:

```text
http://localhost:8001/api
```

Ejemplo usando Axios:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001/api"
});

export default api;
```

### Login desde frontend

```js
const response = await api.post("/auth/login", {
  identifier: values.identifier,
  password: values.password,
});
```

Guardar tokens:

```js
localStorage.setItem("accessToken", response.data.data.accessToken);
localStorage.setItem("refreshToken", response.data.data.refreshToken);
localStorage.setItem("user", JSON.stringify(response.data.data.user));
```

### Redirección por rol

- `admin` → panel administrador
- `agente` → panel agente
- `supervisor` → panel supervisor

---

## Solución de problemas comunes

### 1. Error `401 Credenciales inválidas`
El `password_hash` almacenado no coincide con la contraseña enviada.

Generar nuevo hash:

```bash
node -e "import bcrypt from 'bcrypt'; bcrypt.hash('Admin123*', 10).then(console.log)"
```

Actualizar en PostgreSQL:

```sql
UPDATE usuarios
SET password_hash = 'NUEVO_HASH',
    updated_at = CURRENT_TIMESTAMP
WHERE username IN ('admin', 'agente', 'supervisor', 'ciudadano');
```

### 2. Swagger no abre
Verifica que exista esta ruta en `app.js`:

```js
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 3. Error con imports
Si usas `import/export`, en `package.json` debe existir:

```json
{
  "type": "module"
}
```

Y todos los imports locales deben llevar `.js`.

### 4. Cambié `auth_db.sql` y no se refleja
PostgreSQL ejecuta el script solo al crear el volumen por primera vez.

Recrear base:

```bash
docker compose down -v
docker compose up -d
```

---

## Problemas con la contraseña de PostgreSQL

Genera uno nuevo y seguro

Haz esto una vez en Node:
```bash
node
```
```bash
const bcrypt = require('bcrypt');
```
```bash
bcrypt.hash('Admin123*', 10).then(console.log);
```


---

## Forma limpia de reiniciar con Podman

Primero detén y elimina el contenedor:
```bash
podman stop auth-db
```

```bash
podman rm auth-db
```

Lista volúmenes:
```bash
podman volume ls
```
Si tenías un volumen asociado a Postgres, elimínalo también. Si el volumen se llamara por ejemplo auth-db-data:
```bash
podman volume rm auth-db-data
```

Levantar el contenedor otra vez con Podman
```bash
podman run -d \
  --name auth-db \
  -e POSTGRES_DB=auth_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 \
  -v auth-db-data:/var/lib/postgresql/data \
  docker.io/library/postgres:16
```

---

## Sctipt para crear la base de datos y usuarios
```bash
pnpm node scripts/generate-seed-hashes.js
```

---

## Estado actual del microservicio

Este microservicio ya deja lista la base para:

- autenticación por correo o username
- control de acceso por roles
- consumo desde frontend React/Vite
- documentación de endpoints
- crecimiento hacia el resto de microservicios del proyecto

---

## Autor y contexto

Microservicio desarrollado como base del proyecto académico **SIMCOMP**, dentro del sistema de comparendos por microservicios.
