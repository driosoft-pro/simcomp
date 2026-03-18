# Catálogo de Endpoints — SIMCOMP

## 1. Auth & Usuarios (Puerto 8001)
### Autenticación
- **POST** `/api/auth/login` - Iniciar sesión (admin, agente, supervisor)
- **POST** `/api/auth/refresh` - Renovar access token
- **POST** `/api/auth/logout` - Cerrar sesión
- **POST** `/api/auth/validate` - (Interno) Validar token para el Gateway

### Gestión de Usuarios
- **GET** `/api/usuarios` - Listar todos los usuarios
- **POST** `/api/usuarios` - Crear un nuevo usuario
- **GET** `/api/usuarios/{id}` - Obtener detalle por ID
- **PUT** `/api/usuarios/{id}` - Actualizar datos de usuario
- **PATCH** `/api/usuarios/{id}/estado` - Activar/Desactivar usuario

---

## 2. Personas & Licencias (Puerto 8002)
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

## 3. Automotores (Puerto 8003)
- **GET** `/api/automotores` - Listar todos los vehículos
- **POST** `/api/automotores` - Registrar un automotor
- **GET** `/api/automotores/{id}` - Detalle por ID
- **GET** `/api/automotores/placa/{placa}` - Buscar por placa única
- **GET** `/api/automotores/propietario/{personaId}` - Listar vehículos de un propietario
- **PUT** `/api/automotores/{id}` - Actualizar datos técnicos
- **DELETE** `/api/automotores/{id}` - Borrado lógico (soft delete)

---

## 4. Infracciones (Puerto 8004)
- **GET** `/api/infracciones` - Catálogo completo de infracciones
- **POST** `/api/infracciones` - Crear nueva infracción
- **GET** `/api/infracciones/{id}` - Detalle por ID
- **GET** `/api/infracciones/codigo/{codigo}` - Buscar por código CNT (ej. C02)
- **PUT** `/api/infracciones/{id}` - Actualizar valores/descripción
- **PATCH** `/api/infracciones/{id}/vigencia` - Cambiar estado de vigencia

---

## 5. Comparendos (Puerto 8005)
- **GET** `/api/comparendos` - Listar todos los comparendos registrados
- **POST** `/api/comparendos` - **Registrar Comparendo** (Valida persona, vehículo e infracción)
- **GET** `/api/comparendos/{id}` - Detalle completo
- **GET** `/api/comparendos/numero/{numero}` - Buscar por número de formulario
- **GET** `/api/comparendos/persona/{personaId}` - Listar multas de un ciudadano
- **GET** `/api/comparendos/automotor/{automotorId}` - Listar multas por placa
- **PATCH** `/api/comparendos/{id}/pagar` - Registrar pago exitoso
- **PATCH** `/api/comparendos/{id}/anular` - Invalidar por error administrativo

---

## Utilidades de Red
- **Health Checks**: `GET /api/health` en todos los servicios.
- **Documentación**: `GET /api/docs` (Swagger UI) en cada puerto.
- **Gateway**: Todos los endpoints anteriores son accesibles vía `api.simcomp.co:300X` con validación JWT centralizada.
