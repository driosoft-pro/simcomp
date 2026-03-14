# ms-automotores

Microservicio de **registro vehicular e historial de propietarios** para el proyecto **SIMCOMP**.

Este servicio se encarga de:

- registro de automotores
- consulta de vehículos por placa
- administración de información técnica del vehículo
- control del estado legal del automotor
- validación del propietario asociado
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
ms-automotores/
├── db/
│   └── automotores_db.sql
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── automotores.controller.js
│   ├── models/
│   │   └── automotor.model.js
│   ├── routes/
│   │   └── automotores.routes.js
│   ├── services/
│   │   └── automotores.service.js
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
La base de datos PostgreSQL contiene la tabla principal:

- `automotores`

El script `db/automotores_db.sql` crea la estructura inicial y datos de prueba.

### 2. Entidad Automotor
La tabla `automotores` registra la información de cada vehículo y su propietario actual.

Campos principales:

- `automotor_id`
- `placa`
- `tipo`
- `marca`
- `modelo`
- `anio`
- `color`
- `cilindraje`
- `estado`
- `propietario_id`
- `created_at`
- `updated_at`

Tipos de automotor permitidos:

- `MOTO`
- `CARRO`
- `BUS`
- `BUSETA`
- `CAMION`
- `TRACTOMULA`
- `CUATRIMOTO`

### 3. Estado del automotor
El campo `estado` representa la condición legal o administrativa del vehículo.

Estados manejados:

- `LEGAL`
- `REPORTADO_ROBO`
- `RECUPERADO`
- `EMBARGADO`

### 4. Relación lógica con personas
El campo `propietario_id` representa una referencia lógica hacia `ms-personas.Persona`, por lo que este servicio puede validar si el propietario existe antes de registrar el automotor.

### 5. Documentación
Swagger queda disponible en:

```text
http://localhost:8003/api/docs/
```

---

## Variables de entorno

Archivo `.env`:

```env
SERVICE_NAME=ms-automotores
PORT=8003

DB_HOST=localhost
DB_PORT=5435
DB_NAME=automotores_db
DB_USER=postgres
DB_PASSWORD=postgres
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

Desde la carpeta `ms-automotores`:

```bash
docker compose up -d
```

Esto levanta PostgreSQL y ejecuta automáticamente el script:

```text
db/automotores_db.sql
```

### Verificar contenedor

```bash
docker ps
```

### Entrar a PostgreSQL

```bash
docker exec -it automotores-db psql -U postgres -d automotores_db
```

### Consultar automotores

```sql
SELECT automotor_id, placa, tipo, estado FROM automotores;
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
[ms-automotores] running on port 8003
```

---

## Endpoints principales

### Health check

```http
GET /api/health
```

### Registrar automotor

```http
POST /api/automotores
```

### Listar automotores

```http
GET /api/automotores
```

### Buscar por placa

```http
GET /api/automotores/placa/:placa
```

### Actualizar estado del automotor

```http
PATCH /api/automotores/:id/estado
```

---

## Pruebas rápidas con curl

### Health

```bash
curl http://localhost:8003/api/health
```

### Crear automotor

```bash
curl -X POST http://localhost:8003/api/automotores \
  -H "Content-Type: application/json" \
  -d '{
    "placa":"ABC123",
    "tipo":"CARRO",
    "marca":"Mazda",
    "modelo":"3",
    "anio":2020,
    "color":"Rojo",
    "cilindraje":2000,
    "estado":"LEGAL",
    "propietario_id":"UUID_DEL_PROPIETARIO"
  }'
```

---

## Cómo conectarlo al frontend

El frontend debe apuntar a:

```text
http://localhost:8003/api
```

Ejemplo usando Axios:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8003/api"
});

export default api;
```

---

## Solución de problemas comunes

### 1. Error por placa duplicada
El campo `placa` debe ser único. Verifica que no exista otro registro con la misma placa.

### 2. Estado inválido
El valor enviado en `estado` debe ser uno de los definidos en el catálogo del servicio.

### 3. Swagger no abre
Verifica que exista esta ruta en `app.js`:

```js
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 4. Cambié `automotores_db.sql` y no se refleja
PostgreSQL ejecuta el script solo al crear el volumen por primera vez.

Recrear base:

```bash
docker compose down -v
docker compose up -d
```

---

## Estado actual del microservicio

Este microservicio deja lista la base para:

- registro de vehículos
- consulta por placa
- manejo del estado legal del automotor
- integración con personas y comparendos
- documentación de endpoints

---

## Autor y contexto

Microservicio desarrollado como parte del proyecto académico **SIMCOMP**, dentro del sistema de comparendos por microservicios.
