# SIMCOMP — Aprovisionamiento de Infraestructura

Este directorio contiene la configuración de **Ansible** para desplegar los servicios de SIMCOMP en máquinas virtuales gestionadas por **Vagrant**.

## Arquitectura de Red
El sistema se distribuye en tres máquinas virtuales con las siguientes configuraciones de red:

| Máquina | IP | Hostname | Propósito |
| :--- | :--- | :--- | :--- |
| **svr-dns** | `192.168.100.2` | `svr-dns` | Servidor DNS (BIND9) para `simcomp.co` |
| **svr-api** | `192.168.100.3` | `svr-api` | Servidores de Microservicios (Node.js) y Bases de Datos (PostgreSQL) |
| **svr-web** | `192.168.100.4` | `svr-web` | Nginx API Gateway y Frontend (React SPA) |

---

## Estructura de Proyecto

La configuración de Ansible sigue una estructura modular para despliegue y mantenimiento:

```text
provisioning/
├── group_vars/          # Variables globales y de grupo (PostgreSQL, Node, etc.)
├── inventory/           # Definición de hosts (svr-dns, svr-api, svr-web)
├── roles/               # Tareas modulares:
│   ├── serve-dns/       # Configuración de BIND9 y zona simcomp.co
│   ├── serve-api/       # Backend: Node.js, PostgreSQL y Microservicios
│   └── server-web/      # Frontend/Gateway: Nginx y React SPA
├── site.yml             # Playbook principal de aprovisionamiento
├── verify.yml           # Pruebas de conectividad y estado post-despliegue
└── README.md            # Esta guía de usuario
```

---

## Tecnologías Utilizadas

El entorno de infraestructura y aprovisionamiento se basa en el siguiente stack tecnológico:

- **Virtualización**: [Vagrant](https://www.vagrantup.com/) & [VirtualBox](https://www.virtualbox.org/)
- **Sistema Operativo**: Ubuntu 22.04 LTS (Jammy)
- **Aprovisionamiento**: [Ansible](https://www.ansible.com/) (Playbooks modulares)
- **Servidor Web / Gateway**: [Nginx](https://www.nginx.com/) 
- **Gestión de DNS**: [BIND9](https://www.isc.org/bind/)
- **Entorno de Ejecución**: [Node.js 22](https://nodejs.org/)
- **Administrador de Procesos**: [PM2](https://pm2.io/)
- **Base de Datos**: [PostgreSQL 12](https://www.postgresql.org/)

---

## Instrucciones de Acceso

Para que el navegador pueda resolver el dominio `simcomp.co` y comunicarse con las máquinas virtuales, siga las instrucciones según su sistema operativo:

### Linux
En Linux, debe mapear manualmente la IP del servidor web al dominio en el archivo de hosts.

1. Abra una terminal y edite el archivo `/etc/hosts`:
   ```bash
   sudo nano /etc/hosts
   ```
2. Agregue la siguiente línea al final del archivo:
   ```text
   192.168.100.4  simcomp.co www.simcomp.co api.simcomp.co
   ```
3. Guarde los cambios (`Ctrl+O`, `Enter`) y salga (`Ctrl+X`).

### Windows
En Windows, además de editar el archivo de hosts, es posible que deba configurar el adaptador de red de VirtualBox para asegurar la visibilidad de las IPs.

#### 1. Configuración del Adaptador de Red (IPv4)
Si no puede hacer `ping 192.168.100.4` o las IPs no cargan en el navegador:
1. Vaya a **Panel de Control** > **Redes e Internet** > **Centro de redes y recursos compartidos**.
2. Seleccione **Cambiar configuración del adaptador** en el menú lateral.
3. Localice el adaptador llamado **VirtualBox Host-Only Network**.
4. Haga clic derecho sobre él y seleccione **Propiedades**.
5. Seleccione **Protocolo de Internet versión 4 (TCP/IPv4)** y haga clic en **Propiedades**.
6. Elija **Usar la siguiente dirección IP** y configure:
   - **Dirección IP**: `192.168.100.1` (o cualquier IP en el rango `.5` a `.254`)
   - **Máscara de subred**: `255.255.255.0`
7. (Opcional) En **Servidor DNS preferido**, puede colocar `192.168.100.2` para usar el servidor DNS de la VM.
8. Haga clic en **Aceptar** en todas las ventanas.

#### 2. Edición del Archivo de Hosts
1. Busque **Bloc de notas** en el menú de inicio.
2. Haga clic derecho y seleccione **Ejecutar como administrador**.
3. Abra el archivo: `C:\Windows\System32\drivers\etc\hosts`.
4. Agregue la siguiente línea:
   ```text
   192.168.100.4  simcomp.co www.simcomp.co api.simcomp.co
   ```
5. Guarde el archivo.

---

## Comandos de Despliegue
Desde la raíz del proyecto, utilice los siguientes comandos para gestionar la infraestructura:

*   **Iniciar/Crear máquinas:** `vagrant up`
*   **Re-ejecutar Ansible:** `vagrant provision`
*   **Reiniciar máquinas:** `vagrant reload`
*   **Apagar máquinas:** `vagrant halt`
*   **Eliminar máquinas:** `vagrant destroy -f`

---
> [!IMPORTANT]
> Asegúrese de que el puerto **80** esté libre en su máquina host, ya que el sistema redirige el tráfico web a través de la IP `192.168.100.4` en ese puerto.
