# ms-personas

Microservicio de **gestión de personas y licencias de conducción** para el proyecto **SIMCOMP**.

Este servicio se encarga de:

- registro de ciudadanos
- consulta de personas por documento
- gestión de licencias de conducción
- historial de licencias
- validación de existencia de persona para otros microservicios
- documentación de API con Swagger

---

## Tecnologías usadas

- Node.js
- Express
- Sequelize
- PostgreSQL
- Swagger
- Docker Compose

---

## Estructura del microservicio

```text
ms-personas/
├── db/
│   └── personas_db.sql
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── personas.controller.js
│   │   └── licencias.controller.js
│   ├── models/
│   │   ├── persona.model.js
│   │   └── licencia.model.js
│   ├── routes/
│   │   ├── personas.routes.js
│   │   └── licencias.routes.js
│   ├── services/
│   │   ├── personas.service.js
│   │   └── licencias.service.js
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

- `personas`
- `licencias_conduccion`

El script `db/personas_db.sql` crea la estructura inicial y datos de prueba.

### 2. Entidad Persona
La tabla `personas` administra la información base de ciudadanos y conductores.

Campos principales:

- `id` (PK, UUID)
- `tipo_documento` (ENUM)
- `numero_documento` (Único)
- `nombres`
- `apellidos`
- `fecha_nacimiento`
- `genero` (ENUM)
- `direccion`
- `telefono`
- `email` (Único)
- `estado` (ENUM)

### 3. Entidad LicenciaConduccion
La tabla `licencias_conduccion` permite almacenar licencias históricas por persona.

Campos principales:

- `id` (PK, UUID)
- `persona_id` (FK -> personas.id)
- `numero_licencia` (Único)
- `categoria` (ENUM: A1, A2, B1, B2, B3, C1, C2, C3)
- `fecha_expedicion`
- `fecha_vencimiento`
- `estado` (ENUM: VIGENTE, SUSPENDIDA, VENCIDA, CANCELADA)
- `observaciones`

### 4. Integración con otros servicios
Este microservicio es consumido por otros módulos para validar si una persona existe antes de registrar automotores o comparendos.

### 5. Documentación
Swagger queda disponible en:

```text
http://localhost:8002/api/docs/
```

---

## Variables de entorno

Archivo `.env`:

```env
SERVICE_NAME=ms-personas
PORT=8002

DB_HOST=localhost
DB_PORT=5433
DB_NAME=personas_db
DB_USER=personas_user
DB_PASSWORD=personas_pass
```

---

## Instalación

### 1. Instalar dependencias

```bash
pnpm install
```

Si aún no se han instalado manualmente:

```bash
pnpm add express sequelize pg pg-hstore dotenv cors helmet morgan express-validator uuid swagger-jsdoc swagger-ui-express
pnpm add -D nodemon
```

---

## Ejecución de la base de datos con Docker

Desde la carpeta `ms-personas`:

```bash
docker compose up -d
```

Esto levanta PostgreSQL y ejecuta automáticamente el script:

```text
db/personas_db.sql
```

### Verificar contenedor

```bash
docker ps
```

### Entrar a PostgreSQL

```bash
docker exec -it personas-db psql -U postgres -d personas_db
```

### Consultar personas

```sql
SELECT persona_id, numero_documento, primer_nombre, primer_apellido FROM personas;
```

### Consultar licencias

```sql
SELECT licencia_id, numero_licencia, estado FROM licencias_conduccion;
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
[ms-personas] running on port 8002
```

---

## Endpoints principales

### Health check

```http
GET /api/health
```

### Crear persona

```http
POST /api/personas
```

### Listar personas

```http
GET /api/personas
```

### Buscar persona por documento

```http
GET /api/personas/documento/:numero
```

### Buscar persona por email

```http
GET /api/personas/email/:email
```

### Validar existencia de persona

```http
GET /api/personas/existe/:numero
```

### Crear licencia

```http
POST /api/licencias
```

### Listar licencias por persona

```http
GET /api/licencias/persona/:persona_id
```

---

## Pruebas rápidas con curl

### Health

```bash
curl http://localhost:8002/api/health
```

### Crear persona

```bash
curl -X POST http://localhost:8002/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "tipo_documento":"CC",
    "numero_documento":"1234567890",
    "primer_nombre":"Juan",
    "primer_apellido":"Pérez",
    "direccion":"Calle 1 # 2-3",
    "telefono":"3001234567",
    "email":"juan@example.com"
  }'
```

---

## Cómo conectarlo al frontend

El frontend debe apuntar a:

```text
http://localhost:8002/api
```

Ejemplo usando Axios:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8002/api"
});

export default api;
```

---

## Solución de problemas comunes

### 1. Error por documento duplicado
El campo `numero_documento` debe ser único. Verifica que no exista previamente en la tabla `personas`.

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

### 4. Cambié `personas_db.sql` y no se refleja
PostgreSQL ejecuta el script solo al crear el volumen por primera vez.

Recrear base:

```bash
docker compose down -v
docker compose up -d
```

---

## Estado actual del microservicio

Este microservicio deja lista la base para:

- registro y consulta de personas
- administración de licencias de conducción
- integración con automotores y comparendos
- documentación de endpoints

---

## Autor y contexto

Microservicio desarrollado como parte del proyecto académico **SIMCOMP**, dentro del sistema de comparendos por microservicios.
