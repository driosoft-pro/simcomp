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
  4. Copia el Vagrantfile seleccionado a la raíz.
  5. Inicia el proceso con `vagrant up`.

### 3. Constructor y Publicador Docker (`build-and-push-dockerhub`)
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
