# SIMCOMP — Provisioning Docker (Swarm Edition)

Este directorio contiene toda la infraestructura y configuración necesaria para desplegar el **Sistema de Comparendos de Tránsito (SIMCOMP)** utilizando **Docker Swarm** sobre máquinas virtuales gestionadas por **Vagrant**.

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
├── jmeter/           # Pruebas de carga y rendimiento (opcional).
├── nginx/            # Configuraciones de Nginx (Gateway y Frontend).
│   ├── gateway.conf          # Configuración del Proxy Inverso principal.
│   └── frontend.default.conf  # Configuración del servidor web de React.
├── scripts/          # scripts de automatización (Deploy, Swarm, Scale).
├── .env              # Variables de entorno del cluster.
├── stack.yml         # Definición de servicios para Docker Swarm.
└── README.md         # Documentación del entorno (este archivo).
```

## 🛠️ Tecnologías Utilizadas

- **Orquestación**: Docker Swarm
- **Virtualización**: Vagrant & VirtualBox (Ubuntu 22.04)
- **API Gateway**: Nginx (Reverse Proxy)
- **Bases de Datos**: PostgreSQL 16
- **Backend**: Node.js (Express)
- **Frontend**: React (Vite)

---

## 🚀 Instrucciones de Despliegue

### 1. Iniciar las Máquinas Virtuales
Desde la raíz del proyecto, ejecuta:
```bash
vagrant up -f Vagrantfile_docker
```

### 2. Inicializar el Swarm
Accede al manager e inicializa el cluster:
```bash
vagrant ssh managerDocker
cd /vagrant/provisioning_docker
./scripts/init-swarm-manager.sh
```
*Copia el comando `docker swarm join --token ...` que aparecerá en la terminal.*

### 3. Unir los Workers
En terminales separadas, accede a cada worker y pega el comando copiado:
```bash
vagrant ssh workerDocker1
# Pegar el comando de join aquí

vagrant ssh workerDocker2
# Pegar el comando de join aquí
```

### 4. Desplegar el Stack
Regresa al **managerDocker** y ejecuta el despliegue:
```bash
vagrant ssh managerDocker
cd /vagrant/provisioning_docker
./scripts/deploy-stack.sh
```

---

## 🌐 Configuración de Acceso (Importante)

Para acceder al sistema desde el navegador de tu máquina host a través del dominio `http://simcomp.co`, debes realizar las siguientes configuraciones:

### 🐧 En Linux (Host)
Debes mapear la IP del manager al dominio en tu archivo de hosts:
1. Abre una terminal.
2. Edita el archivo hosts: `sudo nano /etc/hosts`
3. Agrega la siguiente línea al final:
   ```text
   192.168.100.2  simcomp.co
   ```
4. Guarda y cierra (Ctrl+O, Enter, Ctrl+X).

### 🪟 En Windows (Host)
En Windows, VirtualBox a veces requiere que configures manualmente el adaptador de red para alcanzar el segmento `192.168.100.x`:

1. Ve a **Panel de Control** > **Centro de redes y recursos compartidos** > **Cambiar configuración del adaptador**.
2. Identifica el adaptador llamado **"VirtualBox Host-Only Network"**.
3. Clic derecho > **Propiedades** > Selecciona **Protocolo de Internet versión 4 (TCP/IPv4)** > **Propiedades**.
4. Haz clic en **Opciones avanzadas** > pestaña **Configuración de IP** > **Agregar** (en la sección Direcciones IP).
5. Ingresa una IP en el mismo rango, por ejemplo:
   - **Dirección IP**: `192.168.100.1`
   - **Máscara de subred**: `255.255.255.0`
6. Acepta todos los cambios.
7. Finalmente, edita el archivo hosts de Windows (usualmente en `C:\Windows\System32\drivers\etc\hosts`) como Administrador y agrega:
   ```text
   192.168.100.2  simcomp.co
   ```

---

## 📊 Monitoreo y Pruebas

- **Estado de Nodos**: `docker node ls`
- **Estado de Servicios**: `docker service ls`
- **Logs de un Servicio**: `docker service logs -f simcomp_<nombre_servicio>`
- **Dashboard API Docs**: `http://simcomp.co/api/docs` (vía Gateway)

> [!TIP]
> Si encuentras errores de conexión a la base de datos al inicio, es normal mientras los contenedores de PostgreSQL terminan de inicializarse. Los servicios se reiniciarán automáticamente.
