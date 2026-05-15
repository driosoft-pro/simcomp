# SIMCOMP — Orquestación con Docker Swarm

Configuración de orquestación de contenedores para garantizar alta disponibilidad, balanceo de carga y escalabilidad horizontal del sistema.

## Arquitectura del Cluster

El entorno se basa en un cluster de 3 nodos:

| Nodo | IP | Rol | Descripción |
| :--- | :--- | :--- | :--- |
| **managerDocker** | `192.168.100.2` | Manager | Orquestador, Nginx Gateway y Balanceador. |
| **workerDocker1** | `192.168.100.3` | Worker | Ejecución de Microservicios y Bases de Datos. |
| **workerDocker2** | `192.168.100.4` | Worker | Ejecución de Microservicios y Bases de Datos. |

## Estructura de Directorios

```text
provisioning_docker/
├── db-init/     # Scritps SQL para inicialización de bases de datos.
├── nginx/      # Configuraciones de Nginx (Gateway y Frontend).
│  ├── gateway.conf     # Configuración del Proxy Inverso principal.
│  └── frontend.default.conf # Configuración del servidor web de React.
├── scripts/     # scripts de automatización (Deploy, Swarm, Scale).
├── .env       # Variables de entorno del cluster.
├── stack.yml     # Definición de servicios para Docker Swarm.
└── README.md     # Documentación del entorno (este archivo).
```

## Tecnologías de Orquestación

- **Orquestación**: Docker Swarm
- **Virtualización**: Vagrant & VirtualBox (Ubuntu 22.04)
- **API Gateway**: Nginx (Reverse Proxy) & HAProxy (Load Balancer mode `dnsrr`)
- **Observabilidad**: Prometheus, Grafana & cAdvisor
- **Bases de Datos**: PostgreSQL 16
- **Backend**: Node.js (Express)
- **Frontend**: React (Vite)
- **Analytics**: PySpark & Flask
- **Robustez**: Failover Automático en HAProxy mediante la directiva `backup` aplicado a Frontend, Microservicios y Bases de Datos (Modo TCP).

---

## Instrucciones de Despliegue (Swarm)

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

### 3.5 Generar Secretos (Requerido)
Antes de desplegar el stack, debes generar los archivos de secretos en la carpeta `secrets/`. Estos archivos están en el `.gitignore` y se generan automáticamente desde la raíz del proyecto:

```bash
# Desde la raíz del proyecto (Linux/WSL)
./scripts/build-secrets.sh
```

Esto creará los archivos `.txt` necesarios en `provisioning_docker/secrets/`.

### 4. Desplegar el Stack
Puedes usar el script automatizado o el comando directo desde la carpeta `/vagrant/provisioning_docker` en el manager:

**Opción A: Comando Directo**
```bash
docker stack deploy -c stack.yml simcomp
```

**Opción B: Script Automatizado (Recomendado)**
```bash
./scripts/deploy-stack.sh
```

### 5. Verificación del Despliegue
Comandos útiles para validar el estado:
```bash
# Ver estado general del stack
docker stack services simcomp

# Ver dónde están corriendo las tareas
docker stack ps simcomp

# Ver logs de un servicio específico
docker service logs -f simcomp_ms-auth-service
```

---

## Acceso desde el Equipo Local

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

### Acceso y Uso de Analytics Spark

El servicio de análisis masivo de datos (PySpark) corre dedicado en un worker. Ofrece un panel visual propio y la consola oficial de Spark.

**Enlaces en Navegador:**
- **Frontend Principal**: [http://simcomp.co](http://simcomp.co)
- **Dashboard Analytics**: [http://simcomp.co:8010](http://simcomp.co:8010)
- **Spark UI**: [http://simcomp.co:4040](http://simcomp.co:4040)
- **Grafana (Monitoreo)**: [http://simcomp.co:3000](http://simcomp.co:3000) (admin / admin)
- **Prometheus**: [http://simcomp.co:9090](http://simcomp.co:9090)
- **HAProxy Stats**: [http://simcomp.co:8404/stats](http://simcomp.co:8404/stats) (admin / Admin123*)
- **cAdvisor**: [http://simcomp.co:8080](http://simcomp.co:8080) (Global)

**Uso Interactivo en Consola (PySpark):**
Puedes conectarte en vivo al contenedor del servicio para ejecutar código Python de análisis de datos:

1. **Ubicar el contenedor** (desde el `managerDocker`):
  ```bash
  docker service ps simcomp_ms-analytics-spark
  ```
  *Revisa en qué worker se encuentra asignado (generalmente `workerDocker1`).*

2. **Entrar al nodo correspondiente** (desde tu máquina anfitriona):
  ```bash
  vagrant ssh workerDocker1
  ```

3. **Obtener el ID del contenedor y acceder:**
  ```bash
  CONTAINER_ID=$(docker ps -qf "name=simcomp_ms-analytics-spark")
  docker exec -it $CONTAINER_ID bash
  ```

4. **Lanzar la consola de PySpark:**
  Una vez dentro de la terminal del contenedor, escribe:
  ```bash
  pyspark
  ```
  *¡Listo! Ahora tienes un entorno interactivo conectado. Puedes probar cargar un dataset:*
  ```python
  df = spark.read.option("header", True).csv("/app/data/uploads/dataset_simcomp.csv")
  df.show(5)
  ```

---

## Comandos de Gestión y Mantenimiento

### Escalamiento (Scaling)
Aumenta la disponibilidad de tus servicios según la carga:
```bash
# Escalar manualmente
docker service scale simcomp_frontend=5

# Usando el script de utilidad
./scripts/scale-service.sh simcomp_ms-auth-service 10
```

### Monitoreo y Recursos
```bash
# Ver consumo de CPU/Memoria en tiempo real
docker stats

# Listar procesos del sistema en los nodos
docker node ps managerDocker
docker node ps workerDocker1
```

### Detención y Limpieza
```bash
# Detener y eliminar todos los servicios
docker stack rm simcomp

# Forzar el reinicio de un servicio (sin cambiar config)
docker service update --force simcomp_ms-reportes

# Limpieza de recursos no usados
docker system prune -a
```

---

## Solución de Problemas (Troubleshooting)

### 1. El comando `docker stack deploy` falla por falta de secretos
**Error**: `secret not found: auth_db_password`
**Solución**: Ejecuta `./scripts/build-secrets.sh` (Linux) o `.\scripts\build-secrets.ps1` (Windows) desde la raíz del proyecto **antes** de desplegar.

### 2. HAProxy no detecta un nuevo microservicio
**Solución**:
- Verifica el nombre del servicio en `stack.yml`.
- Revisa los logs de HAProxy: `docker service logs simcomp_haproxy`.
- Asegúrate de que el microservicio esté en la red `simcomp-internal`.

### 3. Latencia alta en la comunicación entre nodos
**Solución**:
- Verifica que el firewall no esté bloqueando los puertos de Swarm (2377, 7946, 4789).
- Revisa el estado de la red overlay: `docker network inspect simcomp-internal`.

---

*SIMCOMP Swarm Provisioning — v1.1.0*
