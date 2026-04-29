# SIMCOMP — Sistema de Comparendos de Tránsito

Sistema integral de gestión de comparendos de tránsito desplegado en **Docker Swarm** para alta disponibilidad y balanceo de carga.

---

# Imagenes Módulos SIMCOMP

- Login
![Login.png](img/Login.png)

- Dashboard dark
![DashboardDark.png](img/DashboardDark.png)

- Dashboard light
![DashboardLight.png](img/DashboardLight.png)

- Usuarios
![Usuarios.png](img/Usuarios.png)

- Personas
![Personas.png](img/Personas.png)

- Automotores
![Automotores.png](img/Automotores.png)

- Infracciones
![Infracciones.png](img/Infracciones.png)

- Comparendos
![Comparendos.png](img/Comparendos.png)

- Comparendo
![Comparendo.png](img/Comparendo.png)

- Pagar
![PagoComparendo.png](img/PagoComparendo.png)

- Recibo
![ReciboComparendo.png](img/ReciboComparendo.png)

- Reportes
![Reportes.png](img/Reportes.png)


---

## 🚀 Guía Rápida: Comandos y Accesos

Esta sección resume cómo poner en marcha el sistema en diferentes ambientes y cómo acceder a cada uno.

| Ambiente | Comando de Inicio | Acceso Frontend / API |
| :--- | :--- | :--- |
| **Local (Nativo)** | `pnpm dev` (en cada carpeta) | [http://localhost:5173](http://localhost:5173) |
| **Docker Compose** | `docker compose up -d` <br> `podman-compose up -d` | [http://localhost:8080](http://localhost:8080) |
| **Vagrant (Ansible)** | `./scripts/vagrant-manager.sh` (Opción 1) | [http://simcomp.co](http://simcomp.co) |
| **Vagrant (Swarm)** | `./scripts/vagrant-manager.sh` (Opción 2/3) | [http://simcomp.co](http://simcomp.co) |

### 🔗 Enlaces de Interés

#### 💻 Desarrollo Local / Docker Compose / Podman
- **Frontend (HAProxy)**: [http://localhost:8080](http://localhost:8080)
- **Dashboard Analytics**: [http://localhost:8010](http://localhost:8010)
- **HAProxy Stats**: [http://localhost:8404/stats](http://localhost:8404/stats) (admin / Admin123*)
- **Documentación API (Swagger)**: `http://localhost:8001/api/docs` (Auth) ... `8006` (Reportes)

#### ☁️ Entorno Vagrant / Swarm (192.168.100.x)
- **Frontend Principal**: [http://simcomp.co](http://simcomp.co)
- **Dashboard Analytics**: [http://192.168.100.3:8010](http://192.168.100.3:8010)
- **HAProxy Stats (Cluster)**: [http://simcomp.co:8404/stats](http://simcomp.co:8404/stats)
- **Spark UI**: [http://192.168.100.3:4040](http://192.168.100.3:4040) (Durante ejecución de jobs)

### 🛠️ Comandos Esenciales por Ambiente

#### 1. Desarrollo Local Nativo
```bash
# Iniciar base de datos (requiere Docker/Podman)
docker compose up -d db-auth db-personas db-automotores db-infracciones db-comparendos
# o con podman
podman-compose up -d db-auth db-personas db-automotores db-infracciones db-comparendos

# Backend (en cada servicio)
cd backend/ms-auth-service && pnpm dev

# Frontend
cd frontend && pnpm dev
```

#### 2. Docker Compose / Podman (Completo)
```bash
# Iniciar todo el ecosistema con Docker
docker compose up -d --build

# Iniciar con Podman
podman-compose up -d --build

# Ver logs
docker compose logs -f
# o podman
podman-compose logs -f
```

---

## 🧪 Verificación y Pruebas (Docker/Podman)

Una vez que el sistema esté arriba con `podman-compose` o `docker compose`, puedes realizar las siguientes pruebas desde tu navegador:

### 1. Acceso a la Aplicación (Frontend)
*   **URL**: [http://localhost:8080](http://localhost:8080)
*   **Qué probar**: Deberías ver la pantalla de login. Intenta ingresar con las credenciales por defecto (si están en tu `init.sql`).

### 2. Estado de los Microservicios (Health Check)
Puedes verificar que cada microservicio responda correctamente de forma directa:
*   **Auth**: `http://localhost:8001/api/health`
*   **Personas**: `http://localhost:8002/api/health`
*   **Automotores**: `http://localhost:8003/api/health`
*   **Infracciones**: `http://localhost:8004/api/health`
*   **Comparendos**: `http://localhost:8005/api/health`
*   **Reportes**: `http://localhost:8006/api/health`

### 3. Analytics Spark
Verifica que el panel de Big Data esté operativo:
*   **Dashboard**: [http://localhost:8010](http://localhost:8010)
*   **Spark UI**: [http://localhost:4040](http://localhost:4040) (Solo visible mientras se procesa un Job)

### 4. Monitoreo del Balanceador (HAProxy)
HAProxy gestiona el tráfico entre los frontends y las APIs:
*   **URL**: [http://localhost:8404/stats](http://localhost:8404/stats)
*   **Credenciales**: `admin` / `Admin123*`
*   **Qué ver**: Deberías ver todos los backends en verde (UP).

---

#### 3. Vagrant & Docker Swarm
```bash
# 1. Inicializar infraestructura
./scripts/vagrant-manager.sh  # Seguir menú interactivo

# 2. Desplegar el stack (si no se hizo automáticamente)
vagrant provision managerDocker --provision-with deploy-stack

# 3. Verificar estado
vagrant ssh managerDocker -c "docker stack services simcomp"
```

---

## 🏗️ Arquitectura de Alta Disponibilidad (Docker Swarm)

El sistema opera sobre un cluster de 3 nodos virtualizados para garantizar resiliencia y balanceo de carga:

| Nodo | IP | Rol | Descripción |
| :--- | :--- | :--- | :--- |
| **managerDocker** | `192.168.100.2` | Manager | Orquestador, Nginx Gateway y HAProxy. |
| **workerDocker1** | `192.168.100.3` | Worker | Microservicios y Bases de Datos. |
| **workerDocker2** | `192.168.100.4` | Worker | Microservicios y Bases de Datos. |

### Componentes del Stack:
1. **HAProxy**: Balanceador de carga de entrada (Puerto 80) y panel de estadísticas (Puerto 8404).
2. **Nginx API Gateway**: Proxy inverso con validación de JWT para proteger microservicios.
3. **Frontend**: Aplicación React (Vite) servida por Nginx.
4. **7 Microservicios**: Auth, Personas, Automotores, Infracciones, Comparendos, Reportes y Analytics Spark.
5. **PostgreSQL 16**: 5 bases de datos independientes con persistencia en volúmenes.

---

## 📂 Estructura del Repositorio y Servicios

Para facilitar la navegación a los nuevos integrantes del equipo, aquí están los enlaces directos a cada componente del ecosistema:

### 🖥️ Frontend
- [Frontend (React + Vite)](./frontend)

### ⚙️ Backend (Node.js + Express)
- [Auth Service](./backend/ms-auth-service)
- [Personas Service](./backend/ms-personas)
- [Automotores Service](./backend/ms-automotores)
- [Infracciones Service](./backend/ms-infracciones)
- [Comparendos Service](./backend/ms-comparendos)
- [Reportes Service](./backend/ms-reportes)

### 📊 Analytics & Big Data
- [Analytics Spark Service (PySpark + Flask)](./analytics-spark-service)

### 🐳 Infraestructura
- [Provisioning Docker (Swarm, HAProxy, Nginx)](./provisioning_docker)

---

## 🚀 Guía de Despliegue (Modo Swarm)

### 1. Preparar las VMs e Infraestructura
```bash
vagrant up
```
*Este comando ahora automatiza la instalación de Docker, la configuración de `/etc/hosts` y la inicialización del cluster Swarm (Manager + 2 Workers).*

### 2. Verificar el Cluster
Una vez finalizado el `vagrant up`, puedes verificar que los nodos estén unidos:
```bash
vagrant ssh managerDocker -c "docker node ls"
```

### 3. Desplegar Aplicación (Stack)
Desde tu máquina host (Linux/Windows), puedes desplegar todo el ecosistema con un solo comando:
```bash
vagrant provision managerDocker --provision-with deploy-stack
```

O si prefieres hacerlo manualmente entrando al **managerDocker**:
```bash
vagrant ssh managerDocker
cd /vagrant/provisioning_docker
docker stack deploy -c stack.yml simcomp
```

### 4. Monitoreo Inicial
Verifica que todos los servicios estén subiendo (puede tomar 1-2 minutos la primera vez):
```bash
vagrant ssh managerDocker -c "docker stack services simcomp"
```

### 4. Acceso al Sistema
Para que los dominios funcionen en tu navegador (Host):
- **Linux**: `echo "192.168.100.2 simcomp.co" | sudo tee -a /etc/hosts`
- **Frontend**: [http://simcomp.co](http://simcomp.co)
- **HAProxy Stats**: [http://simcomp.co:8404/stats](http://simcomp.co:8404/stats) (admin / Admin123*)

---

## 🧪 Pruebas de Carga (JMeter)

Se recomienda ejecutar JMeter desde tu PC local apuntando a `http://simcomp.co`. El proyecto incluye archivos `.jmx` optimizados en la carpeta `jmeter/`.

### Archivos de Prueba Disponibles:
- **`simcomp-login.jmx`**: Prueba el endpoint de autenticación y extrae el token JWT.
- **`simcomp-comparendos.jmx`**: Realiza login y luego consultas al microservicio de comparendos usando el token obtenido.
- **`simcomp-workflow-completo.jmx`**: Simula un flujo real (Login -> Personas -> Vehículos -> Comparendos).
- **`simcomp-estres-frontend.jmx`**: Prueba masiva de carga al servidor web de la aplicación.

### Ejecución por Línea de Comandos (Recomendado):
Para evitar el consumo de recursos de la interfaz gráfica, usa el modo CLI:
```bash
jmeter -n -t jmeter/simcomp-workflow-completo.jmx -l results.jtl
```

Durante la prueba, observa en **HAProxy Stats** ([http://simcomp.co:8404/stats](http://simcomp.co:8404/stats)) el balanceo entre los contenedores.

---


## 🛠️ Operaciones y Gestión del Stack (Docker Swarm)

### 📊 Monitoreo y Estado
| Acción | Comando (desde el Manager) |
| :--- | :--- |
| **Ver servicios del stack** | `docker stack services simcomp` |
| **Ver tareas de un servicio** | `docker service ps simcomp_frontend` |
| **Estado de los nodos** | `docker node ls` |
| **Uso de recursos (stats)** | `docker stats` |

### 📈 Escalamiento (Scaling)
Puedes aumentar o disminuir las réplicas de cualquier microservicio en caliente:
```bash
# Escalar el frontend a 5 réplicas
docker service scale simcomp_frontend=5

# O usando el script de utilidad:
./provisioning_docker/scripts/scale-service.sh simcomp_ms-auth-service 10
```

### 📜 Gestión de Logs
```bash
# Ver logs en tiempo real de un servicio
docker service logs -f simcomp_ms-auth-service

# Ver logs de HAProxy
docker service logs -f simcomp_haproxy
```

### 🛑 Detener y Reiniciar
| Acción | Comando |
| :--- | :--- |
| **Eliminar el stack** | `docker stack rm simcomp` |
| **Reiniciar un servicio** | `docker service update --force simcomp_ms-reportes` |
| **Limpiar volúmenes** | `docker volume prune` (Cuidado: borra bases de datos) |

---

## 🖥️ Acceso a los Nodos del Cluster

Para realizar tareas de administración o depuración interna:

```bash
# Entrar al Manager (Donde está HAProxy y el despliegue)
vagrant ssh managerDocker

# Entrar al Worker 1 (Donde corren la mayoría de microservicios)
vagrant ssh workerDocker1

# Entrar al Worker 2 (Donde están las bases de datos)
vagrant ssh workerDocker2
```

---

### 🔄 Modos de Despliegue y Configuración

El sistema está preparado para funcionar en 4 escenarios distintos. **Se han eliminado todos los valores por defecto (hardcoded) del código fuente para garantizar la seguridad.** La configuración debe proveerse explícitamente mediante archivos `.env` o Docker Secrets:

| Modo | Archivo | Descripción |
| :--- | :--- | :--- |
| **Local Nativo** | `.env.local` | Ejecución directa en el PC anfitrión (localhost). |
| **Vagrant Nativo** | `.env.vagrant` | Despliegue en VMs mediante `Vagrantfile_native` y Ansible. |
| **Docker Local** | `.env.docker` | Uso de `docker-compose.local.yml` con imágenes de Docker Hub. |
| **Docker Swarm** | `.env.swarm` | Cluster distribuido en Vagrant. **Usa Docker Secrets** para datos sensibles. |

### 🔐 Gestión de Secretos (Modo Swarm)

En el despliegue de Swarm, las credenciales de base de datos y llaves JWT **no se almacenan en archivos .env**. El sistema las lee desde `/run/secrets/` inyectados por el orquestador. 

Debes crear los siguientes secretos manualmente una única vez:

```bash
# Ejemplo para ms-auth-service
echo "admin123" | docker secret create auth_db_password -
# Repetir para cada servicio (personas_db_password, etc.)

# Secreto compartido para JWT
echo "tu_llave_secreta_super_segura" | docker secret create jwt_secret -
```

> [!IMPORTANT]
> Si falta alguno de estos secretos o variables de entorno, los microservicios no iniciarán. Esto es intencional para evitar el uso de configuraciones inseguras por defecto.



---

## Características de Datos

- **Borrado Lógico (Soft Delete)**: El sistema implementa borrado lógico mediante el campo `deleted_at` en todas las entidades principales. Los registros no se eliminan físicamente de la base de datos.
- **Auditoría**: Todas las tablas incluyen campos `created_at` y `updated_at` gestionados automáticamente por Sequelize.

---

## Endpoints de Prueba (con JWT)

| Endpoint                                 | Auth    | Descripción                      |
|------------------------------------------|---------|----------------------------------|
| Endpoint                                 | Auth    | Descripción                      |
|------------------------------------------|---------|----------------------------------|
| http://simcomp.co/api/auth/login         | —       | Login de usuario                 |
| http://simcomp.co/api/personas           | JWT     | Personas via HAProxy             |
| http://simcomp.co/api/automotores        | JWT     | Automotores via HAProxy          |
| http://simcomp.co/api/infracciones       | JWT     | Infracciones via HAProxy         |
| http://simcomp.co/api/comparendos       | JWT     | Comparendos via HAProxy          |
| http://simcomp.co/api/reportes/estadisticas| JWT   | Reportes via HAProxy             |
| http://192.168.100.3:8001/api/docs       | —       | Swagger auth-service             |
| http://192.168.100.3:8002/api/docs       | —       | Swagger personas-service         |
| http://192.168.100.3:8003/api/docs       | —       | Swagger automotores-service      |
| http://192.168.100.3:8004/api/docs       | —       | Swagger infracciones-service     |
| http://192.168.100.3:8005/api/docs       | —       | Swagger comparendos-service      |
| http://192.168.100.3:8006/api/docs       | —       | Swagger reportes-service         |
| http://192.168.100.3:8010/               | —       | Dashboard de Analytics Spark     |

---

## Dataset 
Incluye:

personas.csv → 1700
usuarios.csv → 700
licencias_conduccion.csv → 1411
vehiculos.csv → 1200
infracciones.csv → 20
comparendos.csv → 1400
historial_comparendos.csv → 1922

Total tablas principales (personas + usuarios + vehiculos + infracciones + comparendos): 5020 registros.

----

## Ejecución con Docker (Orquestación Completa)

Para una implementación rápida y aislada que no requiere VirtualBox o Vagrant, puedes usar Docker Compose:

1. **Iniciar el ecosistema**:
   ```bash
   docker compose -f docker-compose.local.yml up --build -d
   ```
   ```bash
   podman compose -f docker-compose.local.yml up --build -d
   ```
2. **Servicios disponibles**:
   - **Frontend**: [http://localhost:8080](http://localhost:8080) (vía HAProxy)
   - **Gateway/Balanceador**: Puerto `8080` (Balanceo entre frontend1 y frontend2)
   - **API Gateway**: Puerto `8080/api` (Enrutamiento a microservicios)
   - **Microservicios Directos (Dev)**: Puertos `8001-8006`

3. **Ver logs**:
   ```bash
   docker compose -f docker-compose.local.yml logs -f
   ```
   ```bash
   podman compose -f docker-compose.local.yml logs -f
   ```

4. **Detener**:
   ```bash
   docker compose -f docker-compose.local.yml down
   ```
   ```bash
   podman compose -f docker-compose.local.yml down
   ```

---

## 🔧 Generación Automática de Entornos (.env)

Para facilitar la configuración del proyecto académico en diferentes ambientes, se han creado scripts que generan automáticamente todos los archivos `.env`, `.env.local`, `.env.vagrant` y `.env.swarm` para cada microservicio y el frontend a partir de sus respectivas plantillas (`.env.example`).

### Uso en Linux
```bash
# 1. Dar permisos de ejecución (si no los tiene)
chmod +x scripts/build-envs.sh

# 2. Ejecutar generador
./scripts/build-envs.sh
```

### Uso en Windows (PowerShell)
```powershell
# Ejecutar generador
.\scripts\build-envs.ps1
```

> [!TIP]
> Ejecuta este script cada vez que clones el repositorio o cuando haya cambios en las plantillas `.env.example` de los microservicios.

---

## 📦 Gestión de Imágenes en Docker Hub

El proyecto incluye herramientas de automatización para la construcción y distribución de imágenes de microservicios y frontend.

### Qué hace esta automatización
- **Detección automática**: Identifica si estás usando `docker` o `podman` y usa los comandos equivalentes.
- **Gestión de Contexto**: Asegura que cada imagen se construya desde su carpeta raíz correspondiente para evitar errores de copia de archivos.
- **Etiquetado automático**: Sube las imágenes con el prefijo de usuario y versión especificados.

### Uso en Linux

```bash
# 1. Dar permisos de ejecución
chmod +x scripts/build-and-push-dockerhub.sh

# 2. Configurar variables y ejecutar
export DOCKERHUB_USER="tu_usuario"
export VERSION="v1.0.0"
./scripts/build-and-push-dockerhub.sh
```

### Uso en Windows (PowerShell)

```powershell
# 1. Configurar variables
$env:DOCKERHUB_USER="tu_usuario"
$env:VERSION="v1.0.0"

# 2. (Opcional) Si usas token de acceso
$env:DOCKERHUB_TOKEN="tu_token_aqui"

# 3. Ejecutar script
.\scripts\build-and-push-dockerhub.ps1
```

> [!TIP]
> Si PowerShell bloquea la ejecución de scripts, puedes habilitarla temporalmente con:
> `Set-ExecutionPolicy -Scope Process Bypass`

### Construcción Individual
Si deseas construir solo un servicio específico, puedes pasar el nombre de la carpeta como argumento:

- **Linux**: `./scripts/build-and-push-dockerhub.sh ms-auth-service`
- **Windows**: `.\scripts\build-and-push-dockerhub.ps1 -Only ms-auth-service`

### Recomendación Importante sobre el Contexto
Cada `Dockerfile` debe respetar su propio contexto. Asegúrate de que:
1. El `Dockerfile` esté dentro de la carpeta del servicio.
2. Todos los archivos usados en `COPY` o `ADD` estén dentro de esa misma carpeta. 
   *Ejemplo: Si el frontend usa un archivo de Nginx, este debe estar en `frontend/nginx.conf` y no en una carpeta externa.*

---

## Comandos Vagrant (Gestor Automatizado)
> [!TIP]
> Se recomienda usar el gestor interactivo para inicializar de forma limpia el entorno de Vagrant seleccionado (Nativo, Swarm, o Swarm+Spark).
> **Linux**: `./scripts/vagrant-manager.sh`
> **Windows**: `.\scripts\vagrant-manager.ps1`

## Comandos Vagrant (Versión Nativa / Ansible)
> [!NOTE]
> Estos comandos aplican solo si usas el `Vagrantfile_native`.

```bash
vagrant status
vagrant ssh srv-simcomp-dns
vagrant ssh srv-simcomp-api
vagrant ssh srv-simcomp-web
vagrant provision srv-simcomp-api          # re-aprovisionar tras cambios en backend
vagrant provision srv-simcomp-web          # re-aprovisionar tras nuevo build frontend
vagrant reload --provision srv-simcomp-api
vagrant halt
vagrant up --no-provision
vagrant destroy -f && vagrant up
```

## PM2 en srv-simcomp-api

```bash
vagrant ssh srv-simcomp-api

pm2 list
pm2 logs auth-service
pm2 logs comparendos-service
pm2 restart auth-service
pm2 reload all                               # recarga sin downtime
tail -f /var/log/simcomp/auth-error.log
tail -f /var/log/simcomp/comparendos-error.log
```

---

## Actualizar el Sistema

```bash
# Backend — cualquier servicio
vagrant provision srv-simcomp-api

# Frontend
cd frontend && npm run build && cd ..
vagrant provision srv-simcomp-web
```

---

## Solución de Problemas

**Gateway devuelve 401 en todas las rutas:**
```bash
vagrant ssh srv-simcomp-api
pm2 logs auth-service --lines 30
pm2 restart auth-service
curl http://localhost:8001/api/health
```

**Nginx 502 Bad Gateway:**
```bash
vagrant ssh srv-simcomp-web
sudo tail -f /var/log/nginx/simcomp-error.log
curl http://192.168.100.3:8002/api/health
sudo systemctl restart nginx
```

**DNS no resuelve:**
```bash
vagrant ssh srv-simcomp-dns
sudo systemctl status named
sudo systemctl restart named
dig @127.0.0.1 simcomp.co
```

**Reset completo:**
```bash
vagrant destroy -f
cd frontend && npm run build && cd ..
vagrant up
```

---

*SIMCOMP — Vagrant + Ansible · 3 VMs · 192.168.100.x · Node.js 22 + PostgreSQL 16 + PM2 + Nginx JWT Gateway · v1.1.0*