# Documentación de Endpoints SIMCOMP

Esta guía detalla los puntos de acceso (endpoints) para interactuar con el ecosistema de microservicios de SIMCOMP.

> [!IMPORTANT]
> **Acceso Unificado**: En esta versión, todos los servicios son accesibles a través del puerto **80** (HAProxy/Gateway). Ya no es necesario usar los puertos individuales de los microservicios en un entorno de producción/Swarm.

---

## 1. Autenticación (`/auth`)
Gestionado por `ms-auth-service`.

- **POST** `/auth/login` - Iniciar sesión (Retorna JWT)
- **POST** `/auth/register` - Registro de nuevos usuarios
- **POST** `/auth/refresh` - Refrescar token JWT
- **GET** `/auth/me` - Obtener información del perfil actual (Requiere JWT)

---

## 2. Personas y Licencias (`/api/personas`, `/api/licencias`)
Gestionado por `ms-personas`.

### Ciudadanos
- **GET** `/api/personas` - Listar todas las personas
- **POST** `/api/personas` - Registrar nueva persona
- **GET** `/api/personas/{id}` - Detalle por UUID
- **GET** `/api/personas/documento/{numero}` - Buscar por documento (CC, CE, etc.)
- **PUT** `/api/personas/{id}` - Actualizar información básica

### Licencias de Conducción
- **POST** `/api/licencias` - Registrar licencia
- **GET** `/api/licencias/persona/{persona_id}` - Historial de licencias por persona
- **GET** `/api/licencias/{numero}` - Buscar licencia por número oficial

---

## 3. Automotores (`/api/automotores`)
Gestionado por `ms-automotores`.

- **GET** `/api/automotores` - Listar todos los vehículos
- **POST** `/api/automotores` - Registrar un automotor
- **GET** `/api/automotores/{id}` - Detalle por ID
- **GET** `/api/automotores/placa/{placa}` - Buscar por placa única
- **GET** `/api/automotores/propietario/{personaId}` - Listar vehículos de un propietario
- **PUT** `/api/automotores/{id}` - Actualizar datos técnicos
- **DELETE** `/api/automotores/{id}` - Borrado lógico (soft delete)

---

## 4. Infracciones (`/api/infracciones`)
Gestionado por `ms-infracciones`.

- **GET** `/api/infracciones` - Catálogo completo de infracciones
- **POST** `/api/infracciones` - Crear nueva infracción
- **GET** `/api/infracciones/{id}` - Detalle por ID
- **GET** `/api/infracciones/codigo/{codigo}` - Buscar por código CNT (ej. C02)
- **PUT** `/api/infracciones/{id}` - Actualizar valores/descripción
- **PATCH** `/api/infracciones/{id}/vigencia` - Cambiar estado de vigencia

---

## 5. Comparendos (`/api/comparendos`)
Gestionado por `ms-comparendos`.

- **GET** `/api/comparendos` - Listar todos los comparendos registrados
- **POST** `/api/comparendos` - **Registrar Comparendo** (Valida persona, vehículo e infracción)
- **GET** `/api/comparendos/{id}` - Detalle completo
- **GET** `/api/comparendos/numero/{numero}` - Buscar por número de formulario
- **GET** `/api/comparendos/persona/{personaId}` - Listar multas de un ciudadano
- **GET** `/api/comparendos/automotor/{automotorId}` - Listar multas por placa
- **PATCH** `/api/comparendos/{id}/pagar` - Registrar pago exitoso
- **PATCH** `/api/comparendos/{id}/anular` - Invalidar por error administrativo

---

## 6. Reportes (`/api/reportes`)
Gestionado por `ms-reportes`.

- **GET** `/api/reportes/dashboard` - Estadísticas generales del sistema
- **GET** `/api/reportes/recaudo` - Reporte financiero por fechas
- **GET** `/api/reportes/infracciones-frecuentes` - Top de infracciones cometidas

---

## Infraestructura y Monitoreo

### HAProxy Stats
- **URL**: `http://localhost:8404/stats`
- **Usuario**: `admin`
- **Password**: `Admin123*`

### Documentación API (Swagger)
- **Rutas**: `/docs` o `/swagger` en la mayoría de los servicios a través del puerto 80.

### Acceso a Frontend
- **URL**: `http://localhost/` (Puerto 80 predeterminado)

---

## Notas Técnicas
- **Formato**: Todas las respuestas son en `application/json`.
- **JWT**: Los endpoints bajo `/api` requieren el header `Authorization: Bearer <token>`.
- **Zonas Horarias**: Todas las fechas se manejan en formato ISO 8601 (UTC).
