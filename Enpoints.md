Auth
POST
/api/auth/login
Iniciar sesión
POST
/api/auth/refresh
Renovar access token
POST
/api/auth/logout
Cerrar sesión

Usuarios
GET
/api/usuarios
Listar usuarios
POST
/api/usuarios
Crear usuario
GET
/api/usuarios/{id}
Obtener usuario por id
PUT
/api/usuarios/{id}
Actualizar usuario
PATCH
/api/usuarios/{id}/estado
Cambiar estado del usuario

Licencias
Gestión de licencias de conducción
POST
/licencias
Crear licencia de conducción
GET
/licencias/persona/{persona_id}
Listar licencias por persona
GET
/licencias/{numero}
Buscar licencia por número
rr
Personas
Gestión de personas
GET
/health
Health check del servicio
POST
/personas
Crear una persona
GET
/personas
Listar personas
GET
/personas/{persona_id}
Buscar persona por ID
GET
/personas/documento/{numero}
Buscar persona por documento
GET
/personas/existe/{numero}
Validar existencia de persona por documento

Automotores
Gestión de Automotores de tránsito
POST
/api/automotores
Crear un automotor
GET
/api/automotores
Listar todos los automotores
GET
/api/automotores/placa/{placa}
Obtener automotor por placa
GET
/api/automotores/{id}
Obtener automotor por ID
PUT
/api/automotores/{id}
Actualizar un automotor
DELETE
/api/automotores/{id}
Eliminar un automotor (soft delete)
PATCH
/api/automotores/{id}/estado
Cambiar estado de un automotor

Infracciones
Gestión de infracciones de tránsito
GET
/api/infracciones
Listar todas las infracciones
POST
/api/infracciones
Crear una nueva infracción
GET
/api/infracciones/{id}
Obtener una infracción por ID
PUT
/api/infracciones/{id}
Actualizar una infracción
DELETE
/api/infracciones/{id}
Eliminar una infracción (borrado lógico)
PATCH
/api/infracciones/{id}/vigente
Cambiar estado de vigencia de una infracción

Comparendos
Gestión de comparendos
GET
/health
Verificar estado del microservicio
POST
/comparendos
Crear un comparendo
GET
/comparendos
Listar todos los comparendos
GET
/comparendos/{id}
Obtener comparendo por ID
GET
/comparendos/numero/{numero}
Obtener comparendo por número
GET
/comparendos/persona/{personaId}
Obtener comparendos por ID de persona
GET
/comparendos/automotor/{automotorId}
Obtener comparendos por ID de automotor
GET
/comparendos/{id}/historial
Obtener historial de estados de un comparendo
PATCH
/comparendos/{id}/pagar
Marcar comparendo como pagado
PATCH
/comparendos/{id}/anular
Anular un comparendo
PATCH
/comparendos/{id}/revertir
Revertir comparendo a estado pendiente
