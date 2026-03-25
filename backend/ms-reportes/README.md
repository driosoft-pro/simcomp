# ms-reportes - SIMCOMP

Microservicio de reportes para el proyecto **SIMCOMP**. Su responsabilidad es centralizar procesos de importacion/exportacion de datos y generacion de archivos administrativos sin mover la logica de negocio de los microservicios de dominio.

## Funcionalidades

- Importar CSV por modulo
- Exportar CSV por modulo
- Exportar Excel por modulo
- Exportar PDF por modulo
- Generar dataset completo del sistema
- Exportar dataset completo en ZIP
- Exportar dataset completo en Excel
- Generar estadisticas generales
- Exportar estadisticas en PDF
- Documentacion Swagger/OpenAPI

## Modulos soportados

- `usuarios`
- `personas`
- `automotores`
- `infracciones`
- `comparendos`

## Puerto sugerido

- `8006`

## Estructura esperada

```text
ms-reportes/
├── package.json
├── README.md
├── .env
└── src
    ├── app.js
    ├── server.js
    ├── config
    │   ├── env.js
    │   └── swagger.js
    ├── controllers
    ├── middlewares
    ├── routes
    ├── services
    └── utils
```

## Dependencias adicionales para Swagger

Este servicio requiere estas dependencias, que ya quedaron agregadas en `package.json`:

```bash
npm install swagger-jsdoc swagger-ui-express
```

## Variables de entorno

Ejemplo de `.env`:

```env
SERVICE_NAME=ms-reportes
PORT=8006
NODE_ENV=development

AUTH_SERVICE_URL=http://localhost:8001
PERSONAS_SERVICE_URL=http://localhost:8002
AUTOMOTORES_SERVICE_URL=http://localhost:8003
INFRACCIONES_SERVICE_URL=http://localhost:8004
COMPARENDOS_SERVICE_URL=http://localhost:8005

REQUEST_TIMEOUT_MS=15000
MAX_IMPORT_ROWS=10000
```

## Instalacion

```bash
cd ms-reportes
npm install
npm run dev
```

## Documentacion Swagger

Una vez levantado el servicio:

- UI Swagger: `http://localhost:8006/api/docs`
- JSON OpenAPI: `http://localhost:8006/api/docs.json`

## Endpoints principales

### Salud

```http
GET /api/reportes/health
```

### Importacion CSV

```http
POST /api/reportes/import/personas
POST /api/reportes/import/usuarios
POST /api/reportes/import/automotores
POST /api/reportes/import/infracciones
POST /api/reportes/import/comparendos
```

Enviar como `multipart/form-data` con la llave `file`.

### Exportacion por modulo

```http
GET /api/reportes/export/personas/csv
GET /api/reportes/export/personas/excel
GET /api/reportes/export/personas/pdf
```

El mismo patron aplica para los otros modulos.

### Exportacion global

```http
GET /api/reportes/export/all/zip
GET /api/reportes/export/all/excel
```

### Estadisticas

```http
GET /api/reportes/estadisticas
GET /api/reportes/estadisticas/pdf
```

## Ejemplo de importacion con cURL

```bash
curl -X POST http://localhost:8006/api/reportes/import/personas \
  -F "file=@personas.csv"
```

## Integracion en Docker Compose

```yaml
ms-reportes:
  build: ./ms-reportes
  container_name: ms-reportes
  ports:
    - "8006:8006"
  environment:
    SERVICE_NAME: ms-reportes
    PORT: 8006
    AUTH_SERVICE_URL: http://ms-auth-service:8001
    PERSONAS_SERVICE_URL: http://ms-personas:8002
    AUTOMOTORES_SERVICE_URL: http://ms-automotores:8003
    INFRACCIONES_SERVICE_URL: http://ms-infracciones:8004
    COMPARENDOS_SERVICE_URL: http://ms-comparendos:8005
  depends_on:
    - ms-auth-service
    - ms-personas
    - ms-automotores
    - ms-infracciones
    - ms-comparendos
```

## Recomendaciones tecnicas

### 1. Endpoints bulk
Para mejorar rendimiento en importaciones masivas, conviene que los microservicios de dominio expongan endpoints tipo:

```http
POST /api/personas/bulk
POST /api/usuarios/bulk
POST /api/automotores/bulk
POST /api/infracciones/bulk
POST /api/comparendos/bulk
```

### 2. Validaciones adicionales
Se recomienda validar tambien:

- columnas requeridas
- tipos de datos
- duplicados
- fechas
- estados permitidos
- coherencia entre relaciones logicas

### 3. Orden sugerido de carga global
Cuando se importe el dataset completo, el orden recomendado es:

1. personas
2. usuarios
3. automotores
4. infracciones
5. comparendos

## Rutas que debes tener listas

- `src/config/swagger.js`
- `src/app.js`
- `src/routes/reportes.routes.js`

Estas son las rutas y archivos que habilitan Swagger correctamente.
