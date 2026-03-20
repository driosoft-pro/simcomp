# ms-infracciones

Microservicio de **catálogo normativo de infracciones** para el proyecto **SIMCOMP**.

Este servicio se encarga de:

- administrar el catálogo de infracciones del Código Nacional de Tránsito
- consultar infracciones por código
- definir valores de multa
- controlar sanciones asociadas a cada infracción
- indicar vigencia normativa
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
ms-infracciones/
├── db/
│   └── infracciones_db.sql
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── infracciones.controller.js
│   ├── models/
│   │   └── infraccion.model.js
│   ├── routes/
│   │   └── infracciones.routes.js
│   ├── services/
│   │   └── infracciones.service.js
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

- `infracciones`

El script `db/infracciones_db.sql` crea la estructura inicial y datos de prueba.

### 2. Entidad Infraccion
La tabla `infracciones` define las infracciones reconocidas por el sistema.

Campos principales:

- `infraccion_id` (PK, UUID)
- `codigo` (Único)
- `descripcion`
- `articulo_codigo`
- `tipo_sancion` (ENUM: MONETARIA, SUSPENSION_LICENCIA, INMOVILIZACION, MIXTA)
- `valor_multa`
- `dias_suspension`
- `aplica_descuento`
- `vigente`
- `estado` (ENUM: activo, inactivo)
- `created_at`
- `updated_at`

### 3. Tipos de sanción
El campo `tipo_sancion` puede manejar los siguientes valores:

- `MONETARIA`
- `SUSPENSION_LICENCIA`
- `INMOVILIZACION`
- `MIXTA`

### 4. Vigencia normativa
El campo `vigente` permite marcar si la infracción sigue activa en el catálogo o si fue modificada o derogada.

### 5. Documentación
Swagger queda disponible en:

```text
http://localhost:8004/api/docs/
```

---

## Variables de entorno

Archivo `.env`:

```env
SERVICE_NAME=ms-infracciones
PORT=8004

DB_HOST=localhost
DB_PORT=5435
DB_NAME=infracciones_db
DB_USER=infracciones_user
DB_PASSWORD=infracciones_pass
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

Desde la carpeta `ms-infracciones`:

```bash
docker compose up -d
```

Esto levanta PostgreSQL y ejecuta automáticamente el script:

```text
db/infracciones_db.sql
```

### Verificar contenedor

```bash
docker ps
```

### Entrar a PostgreSQL

```bash
docker exec -it infracciones-db psql -U postgres -d infracciones_db
```

### Consultar infracciones

```sql
SELECT infraccion_id, codigo, tipo_sancion, valor_multa, vigente FROM infracciones;
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
[ms-infracciones] running on port 8004
```

---

## Endpoints principales

### Health check

```http
GET /api/health
```

### Listar infracciones

```http
GET /api/infracciones
```

### Buscar infracción por código

```http
GET /api/infracciones/codigo/:codigo
```

### Crear infracción

```http
POST /api/infracciones
```

### Actualizar vigencia

```http
PATCH /api/infracciones/:id/vigencia
```

### Eliminar infracción (Soft delete)

```http
DELETE /api/infracciones/:id
```

---

## Pruebas rápidas con curl

### Health

```bash
curl http://localhost:8004/api/health
```

### Crear infracción

```bash
curl -X POST http://localhost:8004/api/infracciones \
  -H "Content-Type: application/json" \
  -d '{
    "codigo":"C001",
    "descripcion":"Conducir sin portar licencia",
    "articulo_codigo":"Ley 769/2002 Art. 131",
    "tipo_sancion":"MONETARIA",
    "valor_multa":650000,
    "dias_suspension":null,
    "aplica_descuento":true,
    "vigente":true
  }'
```

---

## Cómo conectarlo al frontend

El frontend debe apuntar a:

```text
http://localhost:8004/api
```

Ejemplo usando Axios:

```js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8004/api"
});

export default api;
```

---

## Solución de problemas comunes

### 1. Error por código duplicado
El campo `codigo` debe ser único. Verifica que no exista previamente en la tabla `infracciones`.

### 2. Tipo de sanción inválido
El valor enviado en `tipo_sancion` debe coincidir con los tipos soportados por el sistema.

### 3. Swagger no abre
Verifica que exista esta ruta en `app.js`:

```js
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

### 4. Cambié `infracciones_db.sql` y no se refleja
PostgreSQL ejecuta el script solo al crear el volumen por primera vez.

Recrear base:

```bash
docker compose down -v
docker compose up -d
```

---

## Estado actual del microservicio

Este microservicio deja lista la base para:

- catálogo centralizado de infracciones
- consulta por código
- parametrización de sanciones y multas
- integración con comparendos
- documentación de endpoints

---

## Autor y contexto

Microservicio desarrollado como parte del proyecto académico **SIMCOMP**, dentro del sistema de comparendos por microservicios.
