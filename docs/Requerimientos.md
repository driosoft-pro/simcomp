Listado de Requerimientos - Proyecto SIMCOMP
1. Requerimientos Funcionales
1.1 Gestión de Usuarios y Autenticación
RF01: Registro de usuarios internos (Admin, Agente, Supervisor).
RF02: Autenticación mediante JWT (Access Token & Refresh Token).
RF03: Control de acceso basado en roles (RBAC).
RF04: Gestión de estado de usuarios (Activar/Inactivar).
RF05: Recuperación de sesión (Refresh Token Flow).

1.2 Gestión de Personas y Licencias
RF06: Registro de ciudadanos (Personas) con validación de tipo y número de documento.
RF07: Consulta de personas por ID, documento o email.
RF08: Gestión de licencias de conducción vinculadas a personas.
RF09: Historial de estados de licencias (Vigente, Suspendida, Vencida, Cancelada).

1.3 Gestión de Automotores
RF10: Registro técnico de vehículos (Placa, VIN, Motor, Chasis, Marca, Clase).
RF11: Asociación de vehículos con ciudadanos (Propietarios).
RF12: Consulta de vehículos por placa o propietario.
RF13: Gestión de condiciones legales (Legal, Reportado, Embargado).

1.4 Gestión de Infracciones
RF14: Catálogo de infracciones basado en el Código Nacional de Tránsito.
RF15: Definición de sanciones (Monetaria, Suspensión, Inmovilización).
RF16: Gestión de valores de multas en pesos colombianos (COP).
RF17: Control de vigencia y aplicación de descuentos.

1.5 Gestión de Comparendos
RF18: Registro de comparendos validando existencia de persona, vehículo e infracción.
RF19: Cálculo automático del valor de la multa.
RF20: Máquina de estados del comparendo (Pendiente, Pagado, Anulado).
RF21: Registro de pagos y cambios de estado administrativo.
RF22: Historial completo de eventos y auditoría por comparendo.

1.6 Microservicio de Reportes (Gestión de Datos)
RF23: Importación masiva de datos mediante archivos CSV por módulo.
RF24: Exportación de listados en formatos CSV, Excel y PDF.
RF25: Generación de estadísticas generales del sistema (Dashboard).
RF26: Exportación del dataset completo en formato comprimido (ZIP) o Excel.

2. Requerimientos No Funcionales
RNF01: Capacidad de soporte para más de 5000 registros iniciales (Dataset actual: 5020).
RNF02: Tiempos de respuesta inferiores a 2 segundos en operaciones transaccionales.
RNF03: Arquitectura escalable basada en microservicios independientes.
RNF04: Seguridad perimetral mediante Nginx como API Gateway con validación JWT.
RNF05: Persistencia de datos en PostgreSQL 16 con aislamiento por esquemas/servicios.
RNF06: Backend desarrollado en Node.js 22 (LTS) con Express.
RNF07: Frontend desarrollado en React 19 con soporte para Modo Oscuro y diseño responsivo.
RNF08: Despliegue automatizado mediante Vagrant (3 VMs) y Ansible.
RNF09: Implementación de Borrado Lógico (Soft Delete) y campos de auditoría en todas las entidades.





