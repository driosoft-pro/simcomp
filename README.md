# ms-comparendos

Microservicio **core del sistema SIMCOMP** encargado del **registro, ciclo de vida y cálculo de comparendos**.

Este servicio se encarga de:

- registrar comparendos
- validar existencia de persona, automotor e infracción
- calcular el valor de la multa
- gestionar el estado del comparendo
- conservar historial de transiciones de estado
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
ms-comparendos/
├── db/
│   └── comparendos_db.sql
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── comparendos.controller.js
│   ├── models/
│   │   ├── comparendo.model.js
│   │   └── comparendoEstadoHistorial.model.js
│   ├── routes/
│   │   └── comparendos.routes.js
│   ├── services/
│   │   └── comparendos.service.js
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
La base de datos PostgreSQL contiene las tablas principales:

- `comparendos`
- `comparendo_transiciones_estado`

El script `db/comparendos_db.sql` crea la estructura inicial y datos de prueba.

### 2. Entidad Comparendo
La tabla `comparendos` registra el comparendo y almacena datos denormalizados para facilitar consultas y reportes históricos.

Campos principales:

- `id` (PK, UUID)
- `numero_comparendo` (Único)
- `fecha_comparendo`
- `ciudadano_documento`
- `ciudadano_nombre`
- `agente_documento`
- `agente_nombre`
- `placa_vehiculo`
- `infraccion_codigo`
- `infraccion_descripcion`
- `ciudad`
- `direccion_exacta`
- `valor_multa`
- `observaciones`
- `estado` (ENUM: PENDIENTE, PAGADO, ANULADO)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, NULL)

### 3. Estados del comparendo
Estados válidos del campo `estado`:

- `PENDIENTE`
- `PAGADO`
- `ANULADO`

### 4. Máquina de estados del comparendo
El campo `estado` puede cambiar según estas reglas:

- `PENDIENTE -> PAGADO`
- `PENDIENTE -> ANULADO`
- `PAGADO -> PENDIENTE` (Reversión)
- `ANULADO -> PENDIENTE` (Reversión)

### 5. Reglas de negocio

#### RN-01 Registro de comparendo
Un comparendo solo puede registrarse si existen previamente en el sistema:

- la persona
- el vehículo
- la infracción

Si alguno de estos elementos no existe, el sistema debe rechazar la creación del comparendo.

#### RN-02 Estado inicial del comparendo
Todo comparendo registrado en el sistema debe iniciar con el estado:

- `PENDIENTE`

#### RN-03 Pago del comparendo
Un comparendo solo puede pasar al estado `PAGADO` si:

- el comparendo se encuentra en estado `CREADO`
- se registra un pago válido en el sistema

#### RN-04 Anulación del comparendo
Un comparendo puede cambiar al estado `ANULADO` únicamente por decisión administrativa de la autoridad de tránsito.

#### RN-05 Unicidad del número de comparendo
El campo `numero_comparendo` debe ser único dentro del sistema, generándose de forma **secuencial** estricta para todo el ecosistema y evitando duplicidades concurrentes, independientemente de los roles y vistas.

#### RN-06 Valor de la multa
El valor de la multa asignado al comparendo debe corresponder al valor definido para la infracción registrada en el microservicio de infracciones.

### 6. Documentación
Swagger queda disponible en:

```text
http://localhost:8005/api/docs/
```

---

## Variables de entorno

Archivo `.env`:

```env
SERVICE_NAME=ms-comparendos
PORT=8005

DB_HOST=localhost
DB_PORT=5436
DB_NAME=comparendos_db
DB_USER=comparendos_user
DB_PASSWORD=comparendos_pass
```

---

## Instalación

### 1. Instalar dependencias

```bash
pnpm install
```

Si aún no se han instalado manualmente:

```bash
pnpm add express sequelize pg pg-hstore dotenv cors helmet morgan express-validator uuid swagger-jsdoc swagger-ui-express axios
pnpm add -D nodemon
```

---

## Ejecución de la base de datos con Docker

Desde la carpeta `ms-comparendos`:

```bash
docker compose up -d
```

Esto levanta PostgreSQL y ejecuta automáticamente el script:

```text
db/comparendos_db.sql
```

### Verificar contenedor

```bash
docker ps
```

### Entrar a PostgreSQL

```bash
docker exec -it comparendos-db psql -U postgres -d comparendos_db
```

### Consultar comparendos

```sql
SELECT comparendo_id, numero_comparendo, estado, valor_multa FROM comparendos;
```

### Consultar historial de estados

```sql
SELECT * FROM comparendo_transiciones_estado;
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
[ms-comparendos] running on port 8005
```

---

## Endpoints principales

### Health check

```http
GET /api/health
```

### Crear comparendo

```http
POST /api/comparendos
```

### Listar comparendos

```http
GET /api/comparendos
```

### Consultar comparendo por número

```http
GET /api/comparendos/numero/:numero
```

### Pagar comparendo

```http
PATCH /api/comparendos/:id/pagar
```

### Anular comparendo

```http
PATCH /api/comparendos/:id/anular
```

---

## Pruebas rápidas con curl

### Health

```bash
curl http://localhost:8005/api/health
```

### Crear comparendo

```bash
curl -X POST http://localhost:8005/api/comparendos \
  -H "Content-Type: application/json" \
  -d '{
    "numero_comparendo":"CMP-2026-0001",
    "fecha_hora":"2026-03-14T10:30:00",
    "automotor_id":"UUID_AUTOMOTOR",
    "persona_id":"UUID_PERSONA",
    "infraccion_id":"UUID_INFRACCION",
    "direccion_exacta":"Calle 5 con Carrera 10",
    "observaciones":"Comparendo generado en operativo de control"
  }'
```

---

## Cómo conectarlo al frontend

El frontend debe apuntar a:

```text
http://localhost:8005/api
```

Ejemplo usando Axios:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8005/api"
});

export default api;
```

---

## Solución de problemas comunes

### 1. Error al crear comparendo
Verifica que existan previamente en el sistema:

- la persona
- el automotor
- la infracción

### 2. Número de comparendo duplicado
El campo `numero_comparendo` debe ser único.

### 3. Estado inválido
La transición solicitada debe respetar la máquina de estados definida por el sistema.

### 4. Swagger no abre
Verifica que exista esta ruta en `app.js`:

```js
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 5. Cambié `comparendos_db.sql` y no se refleja
PostgreSQL ejecuta el script solo al crear el volumen por primera vez.

Recrear base:

```bash
docker compose down -v
docker compose up -d
```

---

## Estado actual del microservicio

Este microservicio deja lista la base para:

- registro del comparendo
- cálculo inicial de multa
- control de estados
- trazabilidad del ciclo de vida
- integración con personas, automotores e infracciones
- documentación de endpoints

---

## Autor y contexto

Microservicio desarrollado como parte del proyecto académico **SIMCOMP**, dentro del sistema de comparendos por microservicios.
