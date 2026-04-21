# SIMCOMP — Orquestación con Docker Swarm

Configuración de orquestación de contenedores para garantizar alta disponibilidad, balanceo de carga y escalabilidad horizontal del sistema.

## 🏗️ Arquitectura del Cluster

El entorno se basa en un cluster de 3 nodos:

| Nodo | IP | Rol | Descripción |
| :--- | :--- | :--- | :--- |
| **managerDocker** | `192.168.100.2` | Manager | Orquestador, Nginx Gateway y Balanceador. |
| **workerDocker1** | `192.168.100.3` | Worker | Ejecución de Microservicios y Bases de Datos. |
| **workerDocker2** | `192.168.100.4` | Worker | Ejecución de Microservicios y Bases de Datos. |

## 📂 Estructura de Directorios

```text
provisioning_docker/
├── db-init/          # Scritps SQL para inicialización de bases de datos.
├── nginx/            # Configuraciones de Nginx (Gateway y Frontend).
│   ├── gateway.conf          # Configuración del Proxy Inverso principal.
│   └── frontend.default.conf  # Configuración del servidor web de React.
├── scripts/          # scripts de automatización (Deploy, Swarm, Scale).
├── .env              # Variables de entorno del cluster.
├── stack.yml         # Definición de servicios para Docker Swarm.
└── README.md         # Documentación del entorno (este archivo).
```

## Tecnologías de Orquestación

- **Orquestación**: Docker Swarm
- **Virtualización**: Vagrant & VirtualBox (Ubuntu 22.04)
- **API Gateway**: Nginx (Reverse Proxy)
- **Bases de Datos**: PostgreSQL 16
- **Backend**: Node.js (Express)
- **Frontend**: React (Vite)

---

## 🚀 Instrucciones de Despliegue (Swarm)

### 1. Levantar las VMs
Desde la raíz del proyecto:
```bash
# Si usas el Vagrantfile principal (ya configurado para Swarm)
vagrant up
```
*Si tu Vagrantfile especial se llama distinto (ej: Vagrantfile_docker), asegúrate de usarlo.*

### 2. Entrar al Manager e Inicializar
```bash
vagrant ssh managerDocker
```

Dentro del manager, verifica Docker e inicializa el Swarm:
```bash
docker --version
docker swarm init --advertise-addr 192.168.100.2
```

### 3. Obtener token y unir Workers
Para obtener el comando de unión:
```bash
docker swarm join-token worker
```
Te dará un comando parecido a: `docker swarm join --token SWMTKN-xxxxx 192.168.100.2:2377`.

**Unir Worker 1:**
En otra terminal local:
```bash
vagrant ssh workerDocker1
# Pegar el comando obtenido arriba
docker swarm join --token SWMTKN-xxxxx 192.168.100.2:2377
```

**Unir Worker 2:**
En otra terminal local:
```bash
vagrant ssh workerDocker2
# Pegar el comando obtenido arriba
docker swarm join --token SWMTKN-xxxxx 192.168.100.2:2377
```

**Validar nodos desde el manager:**
```bash
vagrant ssh managerDocker
docker node ls
```

### 4. Desplegar el Stack
Dentro del manager:
```bash
cd /vagrant/provisioning_docker
docker stack deploy -c stack.yml simcomp
```

### 5. Verificación del Despliegue
Coomandos útiles para validar el estado:
```bash
docker stack ls
docker service ls
docker stack services simcomp

# Ver tareas y errores si algo falla:
docker service ps simcomp_haproxy
docker service ps simcomp_frontend

# Ver logs en tiempo real:
docker service logs -f simcomp_ms-auth-service
```

---

## 🌐 Acceso desde el Equipo Local

Mapear `simcomp.co` al manager en `192.168.100.2`.

**En Linux:**
```bash
echo "192.168.100.2 simcomp.co" | sudo tee -a /etc/hosts
```

**Pruebas de acceso:**
- Web: [http://simcomp.co](http://simcomp.co)
- API: `curl http://simcomp.co/api/health`
- Dashboard de Estadísticas (HAProxy): [http://simcomp.co:8404/stats](http://simcomp.co:8404/stats)
  - **Usuario:** `admin`
  - **Clave:** `Admin123*`

---

## 🛠️ Comandos de Gestión (Manager)

- **Escalar un servicio:**
  ```bash
  docker service scale simcomp_frontend=3
  docker service scale simcomp_ms-comparendos=4
  ```
- **Eliminar el stack:**
  ```bash
  docker stack rm simcomp
  ```


