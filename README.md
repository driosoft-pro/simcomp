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
4. **6 Microservicios**: Auth, Personas, Automotores, Infracciones, Comparendos y Reportes.
5. **PostgreSQL 16**: 5 bases de datos independientes con persistencia en volúmenes.

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

### 3. Desplegar Aplicación
Desde el **managerDocker**:
```bash
vagrant ssh managerDocker
cd /vagrant/provisioning_docker
docker stack deploy -c stack.yml simcomp
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


## 🛠️ Operaciones y Gestión del Stack

- **Escalar frontend**: `docker service scale simcomp_frontend=3`
- **Ver logs**: `docker service logs -f simcomp_ms-auth-service`
- **Estado nodos**: `docker node ls`
- **Servicios**: `docker service ls`

---

## 🔄 Modos de Despliegue y Configuración

El sistema está preparado para funcionar en 4 escenarios distintos. Cada componente (Frontend y Microservicios) incluye archivos `.env` preconfigurados para cada caso:

| Modo | Archivo | Descripción |
| :--- | :--- | :--- |
| **Local Nativo** | `.env.local` | Ejecución directa en el PC anfitrión (localhost). |
| **Vagrant Nativo** | `.env.vagrant` | Despliegue en VMs mediante `Vagrantfile_native` y Ansible. |
| **Docker Local** | `.env.docker` | Uso de `docker-compose.local.yml` con imágenes de Docker Hub. |
| **Docker Swarm** | `.env.swarm` | Cluster distribuido en Vagrant. **Usa Docker Secrets** para datos sensibles. |

### 🔐 Gestión de Secretos (Modo Swarm)
En el despliegue de Swarm, las contraseñas de base de datos y llaves JWT **no se almacenan en archivos .env**. El sistema las lee desde `/run/secrets/` inyectados por el orquestador.

Para que el stack funcione en Swarm, debes crear los secretos manualmente una única vez:
```bash
echo "admin123" | docker secret create db_password -
echo "secret123" | docker secret create jwt_secret -
```



---

## Características de Datos

- **Borrado Lógico (Soft Delete)**: El sistema implementa borrado lógico mediante el campo `deleted_at` en todas las entidades principales. Los registros no se eliminan físicamente de la base de datos.
- **Auditoría**: Todas las tablas incluyen campos `created_at` y `updated_at` gestionados automáticamente por Sequelize.

---

## Endpoints de Prueba (con JWT)

| Endpoint                                 | Auth    | Descripción                      |
|------------------------------------------|---------|----------------------------------|
| http://api.simcomp.co:8001/api/auth/login| —       | Login de usuario                 |
| http://api.simcomp.co:8002/api/personas  | JWT     | Personas via Gateway             |
| http://api.simcomp.co:8003/api/vehiculos | JWT     | Automotores via Gateway          |
| http://api.simcomp.co:8004/api/infracciones| JWT     | Infracciones via Gateway         |
| http://api.simcomp.co:8005/api/comparendos| JWT     | Comparendos via Gateway          |
| http://api.simcomp.co:8006/api/reportes  | JWT     | Reportes via Gateway             |
| http://192.168.100.3:8001/api/docs       | —       | Swagger auth-service             |
| http://192.168.100.3:8002/api/docs       | —       | Swagger personas-service         |
| http://192.168.100.3:8003/api/docs       | —       | Swagger automotores-service      |
| http://192.168.100.3:8004/api/docs       | —       | Swagger infracciones-service     |
| http://192.168.100.3:8005/api/docs       | —       | Swagger comparendos-service      |
| http://192.168.100.3:8006/api/reportes/docs| —     | Swagger reportes-service         |

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
   docker compose up --build -d
   ```

2. **Servicios disponibles**:
   - **Frontend**: [http://localhost](http://localhost)
   - **Gateway (Puertos 3001-3005)**: Simulan la red de producción.

3. **Ver logs**:
   ```bash
   docker compose logs -f
   ```

4. **Detener**:
   ```bash
   docker compose down
   ```

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
chmod +x build-and-push-dockerhub.sh

# 2. Configurar variables y ejecutar
export DOCKERHUB_USER="tu_usuario"
export VERSION="v1.0.0"
./build-and-push-dockerhub.sh
```

### Uso en Windows (PowerShell)

```powershell
# 1. Configurar variables
$env:DOCKERHUB_USER="tu_usuario"
$env:VERSION="v1.0.0"

# 2. (Opcional) Si usas token de acceso
$env:DOCKERHUB_TOKEN="tu_token_aqui"

# 3. Ejecutar script
.\build-and-push-dockerhub.ps1
```

> [!TIP]
> Si PowerShell bloquea la ejecución de scripts, puedes habilitarla temporalmente con:
> `Set-ExecutionPolicy -Scope Process Bypass`

### Construcción Individual
Si deseas construir solo un servicio específico, puedes pasar el nombre de la carpeta como argumento:

- **Linux**: `./build-and-push-dockerhub.sh ms-auth-service`
- **Windows**: `.\build-and-push-dockerhub.ps1 -Only ms-auth-service`

### Recomendación Importante sobre el Contexto
Cada `Dockerfile` debe respetar su propio contexto. Asegúrate de que:
1. El `Dockerfile` esté dentro de la carpeta del servicio.
2. Todos los archivos usados en `COPY` o `ADD` estén dentro de esa misma carpeta. 
   *Ejemplo: Si el frontend usa un archivo de Nginx, este debe estar en `frontend/nginx.conf` y no en una carpeta externa.*

---

## Comandos Vagrant (Versión Nativa / Ansible)
> [!NOTE]
> Estos comandos aplican solo si usas `Vagrantfile_native`.

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