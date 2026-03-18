# REQUERIMIENTOS DEL PROYECTO
# Sistema de Comparendos de Tránsito — Microservicios
# =====================================================

## INFORMACIÓN DEL DOCUMENTO

**Asignatura:** Redes e Infraestructuras  
**Universidad:** Universidad Autónoma de Occidente  
**Facultad:** Facultad de Ingeniería  
**Programa:** Ingeniería de Datos e Inteligencia Artificial  

**Autores**
- Deyton Riascos Ortiz — 2246208
- Samuel Izquierdo Bonilla — 2246993
- Mauricio Taborda Gongora — 2246998

**Entidad de referencia:** Secretaría de Tránsito y Transporte — Valle del Cauca, Colombia  
**Versión:** 1.0  
**Fecha:** 11 de marzo de 2026  
**Tipo de documento:** Diseño Técnico — Arquitectura de Microservicios  
**Patrón arquitectónico:** Microservicios REST  

---

## DESCRIPCIÓN GENERAL

Sistema distribuido para gestionar comparendos de tránsito mediante una arquitectura de
**microservicios REST**. De acuerdo con el documento de requerimientos, la solución se
estructura en **5 microservicios independientes**, cada uno con responsabilidad única y
base de datos propia.

Tecnologías base del proyecto:

- Node.js 22
- Express 4
- PostgreSQL 14
- Vagrant
- Ansible
- Swagger / OpenAPI

### Principios de diseño

- Cada microservicio es dueño exclusivo de sus datos.
- Las referencias entre microservicios se realizan mediante **UUID**.
- No se usan claves foráneas directas entre bases de datos de distintos servicios.
- La comunicación entre servicios se realiza por **APIs REST síncronas**.
- Cada servicio implementa una responsabilidad específica.
- Los valores monetarios deben manejarse con **DECIMAL(12,2)**.
- La consistencia de datos se garantiza a nivel de servicio.

---

## RESUMEN DE MICROSERVICIOS

> Nota: el documento fuente menciona 5 microservicios. En el resumen general aparecen 4
> de negocio y adicionalmente se detalla un microservicio de autenticación.

| Microservicio | Responsabilidad | Puerto |
|---|---|---:|
| ms-auth-service | Gestión de usuarios del sistema y autenticación | 8001 |
| ms-personas | Gestión de ciudadanos y licencias de conducción | 8002 |
| ms-automotores | Registro de vehículos y asociación con propietarios | 8003 |
| ms-infracciones | Catálogo de infracciones y valores de multa | 8004 |
| ms-comparendos | Registro y gestión del ciclo de vida de comparendos | 8005 |

---

## ESTRUCTURA DEL PROYECTO

La estructura debe reflejar los nombres y responsabilidades definidos en el documento
de requerimientos:

```text
sistema-comparendos/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── ms-auth-service/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── Usuario.js
│   │   │   └── RefreshToken.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   └── swagger/
│   └── .env
│
├── ms-personas/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── Persona.js
│   │   │   └── LicenciaConduccion.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── swagger/
│   └── .env
│
├── ms-automotores/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   └── Automotor.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── swagger/
│   └── .env
│
├── ms-infracciones/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   └── Infraccion.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── swagger/
│   └── .env
│
└── ms-comparendos/
    ├── Dockerfile
    ├── package.json
    ├── src/
    │   ├── app.js
    │   ├── server.js
    │   ├── config/
    │   │   └── database.js
    │   ├── models/
    │   │   └── Comparendo.js
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   │   └── external.service.js
    │   └── swagger/
    └── .env
```

---

## DEPENDENCIAS POR MICROSERVICIO

Cada microservicio debe tener su propio `package.json`. Las dependencias pueden variar
según la responsabilidad del servicio, pero una base mínima del proyecto puede incluir:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "sequelize": "^6.35.2",
    "pg": "^8.11.3",
    "pg-hstore": "^2.3.4",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1",
    "swagger-ui-express": "^5.0.0",
    "swagger-jsdoc": "^6.2.8",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Instalación

```bash
# En cada directorio de microservicio
npm install
```

> En `ms-auth-service` normalmente se requerirán dependencias adicionales de autenticación
> según la implementación final, por ejemplo para hash de contraseñas y manejo de tokens.

---

## ENTIDADES Y MODELOS DE BASE DE DATOS

## 1. MS-AUTH-SERVICE — `auth_db`

### Entidad: `usuarios`

| Campo | Tipo de dato | Etiqueta | Descripción / restricción |
|---|---|---|---|
| id | UUID | PK | Identificador único |
| username | VARCHAR(50) | UNIQUE | Nombre de usuario para login |
| email | VARCHAR(150) | UNIQUE | Correo electrónico |
| password_hash | VARCHAR(255) |  | Contraseña hasheada con bcrypt |
| rol | ENUM |  | `admin`, `agente`, `supervisor` |
| activo | BOOLEAN |  | Estado del usuario |
| created_at | TIMESTAMP |  | Fecha de registro en el sistema |
| updated_at | TIMESTAMP |  | Última modificación |

### Entidad: `refresh_tokens`

| Campo | Tipo de dato | Etiqueta | Descripción / restricción |
|---|---|---|---|
| id | UUID | PK | Identificador único |
| usuario_id | VARCHAR(3) | FK | Propietario del token |
| token | VARCHAR(60) |  | Refresh token (UUID v4 o hash) |
| expires_at | TIMESTAMP |  | Expiración del refresh token (7d) |
| revocado | BOOLEAN |  | Estado del token |
| updated_at | TIMESTAMP |  | Última modificación |

---

## 2. MS-PERSONAS — `personas_db`

### Entidad: `Persona`

| Campo | Tipo de dato | Etiqueta | Descripción / restricción |
|---|---|---|---|
| persona_id | UUID | PK | Identificador único interno del sistema |
| tipo_documento | VARCHAR(3) | ENUM | `CC`, `CE`, `PAS`, `TI` |
| numero_documento | VARCHAR(20) | IDX | Número único del documento; índice único en la BD |
| primer_nombre | VARCHAR(60) |  | Primer nombre |
| segundo_nombre | VARCHAR(60) | NULL | Opcional |
| primer_apellido | VARCHAR(60) |  | Primer apellido |
| segundo_apellido | VARCHAR(60) | NULL | Opcional |
| direccion | TEXT |  | Dirección de residencia actual |
| telefono | VARCHAR(15) |  | Teléfono de contacto |
| email | VARCHAR(120) |  | Correo electrónico |
| created_at | TIMESTAMP |  | Fecha de registro en el sistema |
| updated_at | TIMESTAMP |  | Última modificación |

### Entidad: `LicenciaConduccion`

| Campo | Tipo de dato | Etiqueta | Descripción / restricción |
|---|---|---|---|
| licencia_id | UUID | PK | Identificador único de la licencia |
| persona_id | UUID | FK | FK lógica → `Persona`; una persona puede tener múltiples licencias históricas |
| numero_licencia | VARCHAR(30) | IDX | Número oficial; índice único |
| fecha_expedicion | DATE |  | Fecha de expedición |
| categoria | VARCHAR(5) | ENUM | `A1`, `A2`, `B1`, `B2`, `C1` |
| fecha_vencimiento | DATE |  | Fecha de vencimiento |
| estado | VARCHAR(15) | ENUM | `VIGENTE`, `SUSPENDIDA`, `VENCIDA`, `CANCELADA` |

---

## 3. MS-AUTOMOTORES — `automotores_db`

### Entidad: `Automotor`

| Campo | Tipo de dato | Etiqueta | Descripción / restricción |
|---|---|---|---|
| automotor_id | UUID | PK | Identificador único del automotor |
| placa | VARCHAR(8) | IDX | Placa Única Nacional; índice único |
| tipo | VARCHAR(20) | ENUM | `MOTO`, `CARRO`, `BUS`, `BUSETA`, `CAMION`, `TRACTOMULA`, `CUATRIMOTO` |
| marca | VARCHAR(50) |  | Marca del vehículo |
| modelo | VARCHAR(50) |  | Modelo del vehículo |
| anio | SMALLINT |  | Año de fabricación |
| color | VARCHAR(30) |  | Color |
| cilindraje | INTEGER |  | En centímetros cúbicos (cc) |
| estado | VARCHAR(50) |  | `LEGAL`, `REPORTADO_ROBO`, `RECUPERADO`, `EMBARGADO` |
| propietario_id | UUID | FK | Referencia lógica a `ms-personas.Persona` |
| created_at | TIMESTAMP |  | Fecha de registro |
| updated_at | TIMESTAMP |  | Última modificación |

> `propietario_id` es una referencia lógica al microservicio de personas.  
> No debe implementarse como clave foránea física entre bases de datos.

---

## 4. MS-INFRACCIONES — `infracciones_db`

### Entidad: `Infraccion`

| Campo | Tipo de dato | Etiqueta | Descripción / restricción |
|---|---|---|---|
| infraccion_id | UUID | PK | Identificador único |
| codigo | VARCHAR(10) | IDX | Código único de la infracción según CNT; ej. `C001`, `D002` |
| descripcion | TEXT |  | Descripción oficial de la infracción |
| articulo_codigo | VARCHAR(30) |  | Artículo del Código Nacional de Tránsito (Ley 769/2002) |
| tipo_sancion | VARCHAR(20) | ENUM | `MONETARIA`, `SUSPENSION_LICENCIA`, `INMOVILIZACION`, `MIXTA` |
| valor_multa | DECIMAL(12,2) |  | Valor de la multa en pesos |
| dias_suspension | INTEGER | NULL | Días de suspensión de licencia si aplica |
| aplica_descuento | BOOLEAN |  | Indica si puede tener descuentos por pronto pago o curso |
| vigente | BOOLEAN |  | `FALSE` = infracción derogada o modificada |

---

## 5. MS-COMPARENDOS — `comparendos_db`

### Entidad: `Comparendo`

| Campo | Tipo de dato | Etiqueta | Descripción / restricción |
|---|---|---|---|
| comparendo_id | UUID | PK | Identificador único |
| numero_comparendo | VARCHAR(20) | IDX | Número único impreso en el comparendo físico; índice único |
| fecha_hora | TIMESTAMP | IDX | Fecha y hora exacta de la infracción |
| automotor_id | UUID | FK | FK lógica → `ms-automotores.Automotor` |
| persona_id | UUID | FK | FK lógica → `ms-personas.Persona` |
| infraccion_id | UUID | FK | FK lógica → `ms-infracciones.Infraccion` |
| direccion_exacta | TEXT |  | Dirección completa del lugar de la infracción |
| estado | VARCHAR(25) | ENUM | `VIGENTE`, `EN_PROCESO_DE_PAGO`, `PAGADO`, `CERRADO`, `EN_COBRO_COACTIVO`, `IMPUGNADO`, `EXONERADO` |
| valor_multa | DECIMAL(14,2) | CALC | Suma de tarifas de todas las infracciones del comparendo |
| observaciones | TEXT | NULL | Notas adicionales del policía o funcionario |
| created_at | TIMESTAMP |  | Fecha de creación del registro |
| updated_at | TIMESTAMP |  | Última modificación del registro |

> Los campos `persona_id`, `automotor_id` e `infraccion_id` son referencias lógicas
> y deben validarse consultando los microservicios correspondientes vía HTTP/REST.

---

## ENDPOINTS API POR MICROSERVICIO

> El documento de requerimientos no define de forma explícita todas las rutas HTTP,
> pero esta propuesta de endpoints es consistente con las entidades y responsabilidades
> descritas.

### ms-auth-service — `http://localhost:8001`

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/login | Inicio de sesión |
| POST | /api/auth/refresh | Renovación de token |
| POST | /api/auth/logout | Cierre de sesión |
| GET | /api/usuarios | Listar usuarios |
| POST | /api/usuarios | Crear usuario |
| GET | /api/usuarios/:id | Obtener usuario por ID |
| PUT | /api/usuarios/:id | Actualizar usuario |
| PATCH | /api/usuarios/:id/estado | Activar o desactivar usuario |
| GET | /api/health | Health check |
| GET | /api/docs | Swagger UI |

### ms-personas — `http://localhost:8002`

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/personas | Listar personas |
| POST | /api/personas | Registrar persona |
| GET | /api/personas/:id | Obtener persona por ID |
| GET | /api/personas/documento/:numero | Buscar por documento |
| PUT | /api/personas/:id | Actualizar persona |
| GET | /api/personas/:id/licencias | Listar licencias de una persona |
| POST | /api/personas/:id/licencias | Registrar licencia |
| GET | /api/licencias/:id | Obtener licencia por ID |
| PUT | /api/licencias/:id | Actualizar licencia |
| GET | /api/health | Health check |
| GET | /api/docs | Swagger UI |

### ms-automotores — `http://localhost:8003`

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/automotores | Listar automotores |
| POST | /api/automotores | Registrar automotor |
| GET | /api/automotores/:id | Obtener automotor por ID |
| GET | /api/automotores/placa/:placa | Buscar por placa |
| GET | /api/automotores/propietario/:personaId | Listar por propietario |
| PUT | /api/automotores/:id | Actualizar automotor |
| GET | /api/health | Health check |
| GET | /api/docs | Swagger UI |

### ms-infracciones — `http://localhost:8004`

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/infracciones | Listar infracciones |
| POST | /api/infracciones | Crear infracción |
| GET | /api/infracciones/:id | Obtener infracción por ID |
| GET | /api/infracciones/codigo/:codigo | Buscar por código |
| PUT | /api/infracciones/:id | Actualizar infracción |
| PATCH | /api/infracciones/:id/vigencia | Cambiar vigencia |
| GET | /api/health | Health check |
| GET | /api/docs | Swagger UI |

### ms-comparendos — `http://localhost:8005`

| Método | Ruta | Descripción |
|---|---|---|
| GET | /api/comparendos | Listar comparendos |
| POST | /api/comparendos | Registrar comparendo |
| GET | /api/comparendos/:id | Obtener comparendo por ID |
| GET | /api/comparendos/numero/:numero | Buscar por número de comparendo |
| GET | /api/comparendos/persona/:personaId | Comparendos por persona |
| GET | /api/comparendos/automotor/:automotorId | Comparendos por automotor |
| PATCH | /api/comparendos/:id/pagar | Registrar pago |
| PATCH | /api/comparendos/:id/anular | Anular comparendo |
| GET | /api/health | Health check |
| GET | /api/docs | Swagger UI |

---

## FLUJO DE COMUNICACIÓN ENTRE SERVICIOS

```text
ms-comparendos (srv-simcomp-api:8005)
        │
        ├── GET http://srv-simcomp-api:8002/api/personas/:persona_id
        │      └── valida que la persona exista
        │
        ├── GET http://srv-simcomp-api:8003/api/automotores/:automotor_id
        │      └── valida que el automotor exista
        │
        ├── GET http://srv-simcomp-api:8004/api/infracciones/:infraccion_id
        │      └── obtiene valor de multa y vigencia
        │
        └── persiste el comparendo en Postgres Cluster 'comparendos' (puerto 5436)
```

---

## ARQUITECTURA DE BASE DE DATOS (MULTI-CLUSTER)

Para garantizar un aislamiento total de los datos en una misma VM (`srv-simcomp-api`), se han configurado **5 clusters de PostgreSQL** independientes. Cada cluster tiene su propio proceso, archivos de configuración, logs y puerto.

| Cluster Name | Puerto | Base de Datos | Servicio Asociado |
|--------------|--------|---------------|-------------------|
| auth         | 5432   | usuarios_db   | ms-auth-service   |
| personas     | 5433   | personas_db   | ms-personas       |
| automotores  | 5434   | vehiculos_db  | ms-automotores    |
| infracciones | 5435   | infracciones_db| ms-infracciones   |
| comparendos  | 5436   | comparendos_db | ms-comparendos    |

### Gestión de Clusters (pg_ctlcluster)

```bash
# Listar todos los clusters y su estado
pg_lsclusters

# Iniciar/Detener/Reiniciar un cluster específico (ej. personas)
sudo pg_ctlcluster 14 personas start
sudo pg_ctlcluster 14 personas restart

# Ver logs de un cluster
sudo tail -f /var/log/postgresql/postgresql-14-personas.log
```

---

## MÁQUINA DE ESTADOS DEL COMPARENDO

El documento de requerimientos incluye una máquina de estados base para el comparendo:

| Estado origen | Estado destino | Condición / trigger |
|---|---|---|
| CREADO | PAGADO | El ciudadano realiza el pago del comparendo |
| CREADO | ANULADO | El comparendo es invalidado por la autoridad de tránsito |
| PAGADO | CREADO | Se realiza una reversión o corrección administrativa del pago |

> Aunque en la tabla de entidad aparecen estados más amplios como `VIGENTE`,
> `EN_PROCESO_DE_PAGO`, `PAGADO`, `CERRADO`, `EN_COBRO_COACTIVO`, `IMPUGNADO`
> y `EXONERADO`, las transiciones explícitas definidas en el documento corresponden
> a la lógica base anterior. Esta diferencia debe resolverse en la implementación final.

---

## REGLAS DE NEGOCIO — PAGOS Y AJUSTES

| # | Regla | Descripción y lógica |
|---|---|---|
| RN-01 | Registro de comparendo | Un comparendo solo puede registrarse si existen previamente la persona, el vehículo y la infracción. Si alguno no existe, se rechaza la creación. |
| RN-02 | Estado inicial del comparendo | Todo comparendo debe iniciar con estado `CREADO`. |
| RN-03 | Pago del comparendo | Un comparendo solo puede pasar a `PAGADO` si actualmente está en `CREADO` y se registra un pago válido. |
| RN-04 | Anulación del comparendo | Un comparendo puede pasar a `ANULADO` únicamente por decisión administrativa. |
| RN-05 | Unicidad del número de comparendo | `numero_comparendo` debe ser único dentro del sistema. |
| RN-06 | Valor de la multa | El valor asignado al comparendo debe corresponder al valor definido en el microservicio de infracciones. |

---

## REQUERIMIENTOS FUNCIONALES

### RF-01: Gestión de Personas
- RF-01.1: Registrar persona con datos básicos y documento de identidad.
- RF-01.2: Consultar persona por ID o número de documento.
- RF-01.3: Actualizar información de una persona.
- RF-01.4: Gestionar licencias de conducción asociadas a la persona.
- RF-01.5: Validar unicidad del número de documento.

### RF-02: Gestión de Automotores
- RF-02.1: Registrar automotor con placa y datos técnicos.
- RF-02.2: Asociar automotor a un propietario existente.
- RF-02.3: Consultar automotor por ID o placa.
- RF-02.4: Listar automotores por propietario.
- RF-02.5: Actualizar datos del automotor.

### RF-03: Gestión de Infracciones
- RF-03.1: Registrar infracción con código y descripción oficial.
- RF-03.2: Definir valor de multa en pesos colombianos.
- RF-03.3: Clasificar tipo de sanción.
- RF-03.4: Consultar infracción por ID o código.
- RF-03.5: Gestionar vigencia de infracciones del catálogo.

### RF-04: Gestión de Comparendos
- RF-04.1: Crear comparendo asociando persona, automotor e infracción.
- RF-04.2: Validar existencia de entidades externas antes del registro.
- RF-04.3: Garantizar unicidad del número de comparendo.
- RF-04.4: Consultar comparendo por ID o número.
- RF-04.5: Listar comparendos por persona o automotor.
- RF-04.6: Registrar pago del comparendo.
- RF-04.7: Anular comparendo por decisión administrativa.

### RF-05: Gestión de Usuarios del Sistema
- RF-05.1: Registrar usuarios internos del sistema.
- RF-05.2: Autenticar usuarios mediante credenciales.
- RF-05.3: Gestionar roles (`admin`, `agente`, `supervisor`).
- RF-05.4: Administrar refresh tokens para sesiones.

---

## REQUERIMIENTOS NO FUNCIONALES

- RNF-01: Cada microservicio debe tener su propia base de datos PostgreSQL independiente.
- RNF-02: La comunicación entre servicios debe ser exclusivamente vía REST/HTTP.
- RNF-03: Todos los endpoints deben documentarse con Swagger (OpenAPI 3.0).
- RNF-04: Cada servicio debe exponer un endpoint `/api/health`.
- RNF-05: Los errores deben retornar respuestas JSON con código HTTP apropiado.
- RNF-06: Los servicios deben ejecutarse en contenedores Docker.
- RNF-07: La infraestructura debe definirse en Vagrant para máquinas virtuales separadas.
- RNF-08: Las contraseñas y configuraciones sensibles deben manejarse mediante archivos `.env`.
- RNF-09: Se recomienda usar Sequelize como ORM con migraciones para la creación de tablas.

---

## DOCKER COMPOSE

El archivo `docker-compose.yml` debe respetar los nombres y puertos definidos por el diseño.
Una propuesta base sería la siguiente:

```yaml
version: "3.8"

services:
  ms-auth-service:
    build: ./ms-auth-service
    ports:
      - "8001:8001"
    environment:
      - PORT=8001
      - DB_PORT=5432

  ms-personas:
    build: ./ms-personas
    ports:
      - "8002:8002"
    environment:
      - PORT=8002
      - DB_PORT=5433

  ms-automotores:
    build: ./ms-automotores
    ports:
      - "8003:8003"
    environment:
      - PORT=8003
      - DB_PORT=5434

  ms-infracciones:
    build: ./ms-infracciones
    ports:
      - "8004:8004"
    environment:
      - PORT=8004
      - DB_PORT=5435

  ms-comparendos:
    build: ./ms-comparendos
    ports:
      - "8005:8005"
    environment:
      - PORT=8005
      - DB_PORT=5436
```

> Las variables de entorno, volúmenes, redes y `depends_on` deben ajustarse a la
> implementación real del repositorio.

---

## DOCKERFILE (BASE DE REFERENCIA)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8000

CMD ["node", "src/server.js"]
```

> Ajusta `EXPOSE` según el puerto del microservicio (`8001` a `8005`).

---

| Microservicio    | Puerto | DB Port | Cluster Name |
|------------------|--------|---------|--------------|
| ms-auth-service  | 8001   | 5432    | auth         |
| ms-personas      | 8002   | 5433    | personas     |
| ms-automotores   | 8003   | 5434    | automotores  |
| ms-infracciones  | 8004   | 5435    | infracciones |
| ms-comparendos   | 8005   | 5436    | comparendos  |

---

## COMANDOS DE INICIO

```bash
# Levantar contenedores
docker compose up --build

# Levantar máquinas virtuales
vagrant up

# Verificar health checks
curl http://localhost:8001/api/health
curl http://localhost:8002/api/health
curl http://localhost:8003/api/health
curl http://localhost:8004/api/health
curl http://localhost:8005/api/health
```

---

## GUÍA DE MANTENIMIENTO (srv-simcomp-api)

### Gestión de Procesos (PM2)

Todos los microservicios se orquestan mediante PM2 bajo el usuario `vagrant`.

```bash
# Ver estado de todos los servicios
pm2 status

# Ver logs en tiempo real de un servicio específico
pm2 logs ms-personas

# Reiniciar todos los servicios tras un cambio
pm2 reload all

# Guardar la lista de procesos actual para reinicio automático
pm2 save
```

### Rutas de Archivos Importantes

- **Código fuente**: `/var/www/simcomp/backend/`
- **Logs de aplicación**: `/var/log/simcomp/` (ej. `auth-error.log`)
- **Configuración (.env)**: En la raíz de cada carpeta de servicio.

---

### USUARIOS DE PRUEBA

Usuatios y contraseñas:
- Admin: admin123*
- Supervisores: super123*
- Agentes: agente123*
- Ciudadanos con usuario: su número de documento


---

*Sistema de Comparendos de Tránsito — Manual Técnico de Backend v1.1.0*
