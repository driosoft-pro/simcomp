# 🛠️ Scripts de Utilidad

Este directorio contiene herramientas de automatización para simplificar tareas recurrentes del ecosistema SIMCOMP. Están desarrollados tanto en **Bash (`.sh`)** para entornos Linux/Mac como en **PowerShell (`.ps1`)** para Windows.

## 📄 Contenido y Uso

### 1. Generador de Entornos (`build-envs`)
Genera automáticamente los archivos `.env`, `.env.local`, `.env.vagrant` y `.env.swarm` para cada microservicio y el frontend basándose en sus plantillas `.env.example`.
- **Tecnología**: Bash (usando `awk`) y PowerShell (usando regex y gestión nativa de arrays).
- **Cómo usarlo**:
  - *Linux*: `./build-envs.sh`
  - *Windows*: `.\build-envs.ps1`
- **¿Qué hace?**: Lee las plantillas, separa las configuraciones según comentarios clave (`# 1. LOCAL`, `# 2. VAGRANT`, etc.), y crea los archivos listos para usar en cada directorio.

### 2. Gestor de Vagrant (`vagrant-manager`)
Automatiza la inicialización de Vagrant limpiando entornos anteriores y permitiendo seleccionar interactivamente qué topología de red y cluster desplegar.
- **Tecnología**: Bash interactivo (`read`, `case`) y PowerShell interactivo (`Read-Host`, `switch`).
- **Cómo usarlo**:
  - *Linux*: `./vagrant-manager.sh`
  - *Windows*: `.\vagrant-manager.ps1`
- **¿Qué hace?**:
  1. Pregunta cuál de los 3 Vagrantfiles usar (Nativo, Swarm, o Swarm+Spark).
  2. Ejecuta `vagrant destroy -f` para eliminar máquinas previas.
  3. Borra la carpeta oculta `.vagrant` para garantizar un inicio sin conflictos de estado.
  4. Inicia las VMs y provisiona el cluster de forma secuencial.
  5. **Pruebas JMeter**: Permite ejecutar pruebas de carga profesionales y generar reportes HTML desde el menú.
  6. **Estado Dinámico**: Detecta si el cluster está vivo y muestra los enlaces de servicios automáticamente.

### 3. Gestor de Secretos (`build-secrets`)
Herramienta crítica para la seguridad del entorno productivo en Swarm.
- **Cómo usarlo**:
  - *Linux*: `./build-secrets.sh`
  - *Windows*: `.\build-secrets.ps1`
- **¿Qué hace?**: Genera archivos planos en la carpeta `secrets/` (ignorada por git) para que Docker Swarm los use como `docker secret`. Permite definir contraseñas de DB y claves JWT sin exponerlas en el código.

### 4. Configurador de DNS Local (`setup-hosts`)
Automatiza el mapeo de la IP del clúster a los dominios `simcomp.co` y subdominios.
- **Cómo usarlo**:
  - *Linux*: `sudo ./setup-hosts.sh`
  - *Windows*: `.\setup-hosts.ps1` (Como Administrador)
- **¿Qué hace?**: Inyecta una entrada única con todos los dominios (`api.`, `monitor.`, `spark.`, etc.) apuntando a la IP del Manager.

### 5. Constructor y Publicador Docker (`build-and-push-dockerhub`)
Automatiza la construcción (build) de las imágenes de todos los microservicios y el frontend, etiquetándolas con versión, y opcionalmente subiéndolas (push) a Docker Hub.
- **Tecnología**: Bash y PowerShell con integración a CLI de `docker` o `podman`.
- **Cómo usarlo**:
  - *Linux*: `./build-and-push-dockerhub.sh [build|push|all] [servicio_opcional]`
  - *Windows*: `.\build-and-push-dockerhub.ps1 -Action [build|push|all] -Only [servicio_opcional]`
- **¿Qué hace?**:
  - Lee credenciales (puede ser a través de archivo `.env.docker-push` en la raíz).
  - Detecta si usas Docker o Podman.
  - Recorre el arreglo de servicios y compila usando el contexto adecuado.
  - Sube las imágenes a tu repositorio.
