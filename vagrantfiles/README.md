# Archivos de Configuración Vagrant

Este directorio aloja las distintas topologías de infraestructura definidas como código (IaC) usando Vagrant y Ruby.

El gestor interactivo `scripts/vagrant-manager.sh` (o `.ps1`) utilizará estos archivos para copiarlos a la raíz como `Vagrantfile` según la opción que elijas.

## Topologías Disponibles

### 1. `Vagrantfile_native`
- **Descripción**: Despliegue de servidores tradicionales usando VirtualBox y Ansible.
- **Topología**:
 - `srv-dns` (192.168.100.2): Servidor DNS (Bind9).
 - `srv-api` (192.168.100.3): Servidor Backend con Node.js, PM2 y 5 bases de datos PostgreSQL independientes.
 - `srv-web` (192.168.100.4): Servidor Frontend con Nginx sirviendo de API Gateway (validación de JWT en Nginx) y el build estático en React.
- **Tecnología**: Vagrant aprovisionando a través de Playbooks de Ansible (`provisioning/site.yml`).
- **Casos de Uso**: Pruebas de infraestructuras clásicas, monolitos distribuidos o configuraciones donde Swarm no es viable.

### 2. `Vagrantfile_docker_swarm`
- **Descripción**: Despliegue de un clúster de Docker Swarm nativo para alta disponibilidad y tolerancia a fallos.
- **Topología**:
 - `managerDocker` (192.168.100.2): Nodo Manager (Orquestador principal, Gateway y HAProxy).
 - `workerDocker1` (192.168.100.3): Worker 1 (Ejecución de contenedores de microservicios y DBs).
 - `workerDocker2` (192.168.100.4): Worker 2 (Ejecución de contenedores y réplicas).
- **Tecnología**: Docker Engine nativo con inicialización de Swarm automática y sincronización segura de `join-tokens`.
- **Casos de Uso**: Pruebas de escalabilidad (`docker service scale`), balanceo de carga real, orquestación pura usando `stack.yml` y monitoreo centralizado con Prometheus/Grafana.

### 3. `Vagrantfile_docker_swarm_spark`
- **Descripción**: Idéntico a `Vagrantfile_docker_swarm` pero con configuraciones ampliadas de memoria/CPU en `workerDocker1` para soportar las altas exigencias del servicio Analytics Spark.
- **Topología**: Mismos nodos, pero `workerDocker1` dispone de recursos aumentados.
- **Tecnología**: Docker Swarm optimizado para cargas de procesamiento de datos pesados (Dataframes).
- **Casos de Uso**: Ejecución de análisis de datos intensivos sobre la infraestructura Swarm.

---

> [!NOTE]
> Para cambiar entre estos entornos de manera limpia sin dejar "máquinas huérfanas" en tu Hypervisor o tener conflictos de IP, **se recomienda fuertemente** usar los scripts `vagrant-manager.sh` o `vagrant-manager.ps1` ubicados en la carpeta `scripts/`.
