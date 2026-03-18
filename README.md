# SIMCOMP — Despliegue en Vagrant

Guía para desplegar en **3 VMs** con Vagrant + Ansible. Sin Docker en producción.

---

# Imagenes Módulos SIMCOMP

- login
![Login.png](img/Login.png)

- dashboard
![Dashboard.png](img/Dashboard.png)

- personas
![Personas.png](img/Personas.png)

- automotores
![Automotores.png](img/Automotores.png)

- infracciones
![Infracciones.png](img/Infracciones.png)

- comparendos
![Comparendos.png](img/Comparendos.png)

- detalles-comparendo
![DetallesComparendo.png](img/DetallesComparendo.png)

- recibo-comparendo
![ReciboComparendo.png](img/ReciboComparendo.png)

- paga-comparendo
![PagaComparendo.png](img/PagaComparendo.png)

- usuarios
![Usuarios.png](img/Usuarios.png)


---

## Arquitectura (red 192.168.100.x)

```
Tu navegador → DNS 192.168.100.2

srv-simcomp-dns  192.168.100.2   BIND9 — zona simcomp.co
srv-simcomp-api  192.168.100.3   5 microservicios + PostgreSQL + PM2
srv-simcomp-web  192.168.100.4   Nginx API Gateway JWT + React SPA

srv-simcomp-api corre los 5 servicios por localhost:
  auth-service         :8001  →  usuarios_db     (puerto 5432)
  personas-service     :8002  →  personas_db     (puerto 5433)
  vehiculos-service    :8003  →  vehiculos_db     (puerto 5434)
  infracciones-service :8004  →  infracciones_db  (puerto 5435)
  comparendos-service  :8005  →  comparendos_db   (puerto 5436)

srv-simcomp-web actúa como Gateway multi-puerto (3001-3005):
  :3001 (Gateway)    → srv-simcomp-api:8001  [público]
  :3002 (Gateway)    → srv-simcomp-api:8002  [JWT]
  :3003 (Gateway)    → srv-simcomp-api:8003  [JWT]
  :3004 (Gateway)    → srv-simcomp-api:8004  [JWT]
  :3005 (Gateway)    → srv-simcomp-api:8005  [JWT]
  Port 80            → /var/www/simcomp  [React SPA]

Flujo JWT (API Gateway):
  Petición → Nginx :3002 (srv-simcomp-web)
    └─ subrequest POST /_auth_validate → 192.168.100.3:8001
         200 OK → proxy al servicio personas (:8002)
         401    → JSON de error al cliente
```

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| VirtualBox  | 7.0            |
| Vagrant     | 2.3            |
| Node.js     | 20 LTS (build del frontend) |

```bash
vagrant --version && VBoxManage --version && node --version
```

---

## Máquinas Virtuales

| VM              | IP              | RAM    | CPU | Rol                                |
|-----------------|-----------------|--------|-----|------------------------------------|
| srv-simcomp-dns | 192.168.100.2   | 1 GB   | 1   | DNS BIND9 — zona simcomp.co        |
| srv-simcomp-api | 192.168.100.3   | 4 GB   | 2   | 5 servicios Node.js + PostgreSQL + PM2 |
| srv-simcomp-web | 192.168.100.4   | 2 GB   | 1   | Nginx API Gateway JWT + React SPA  |

---

## Archivos de Infraestructura

```
simcomp/
├── Vagrantfile
├── provisioning/
│   ├── site.yml                        ← orquesta los 3 roles
│   ├── verify.yml                      ← health check de todos los servicios
│   ├── inventory/
│   │   └── hosts.ini                   ← inventario 192.168.100.x optimizado
│   ├── group_vars/
│   │   ├── all.yml                     ← IPs, passwords, JWT_SECRET, lista de servicios
│   │   ├── srv-simcomp-api.yml         ← config PostgreSQL / PM2
│   │   └── srv-simcomp-web.yml         ← upstreams y rutas del gateway
│   └── roles/
│       ├── serve-dns/
│       │   ├── tasks/main.yml          ← BIND9 + zona simcomp.co + zona inversa
│       │   └── handlers/main.yml       ← Reinicios de BIND9
│       ├── serve-api/
│       │   ├── tasks/main.yml          ← PostgreSQL v14 + Node.js + PM2 rsync
│       │   ├── templates/              ← Plantillas .env y ecosystem.config.js
│       │   └── handlers/main.yml       ← Reinicios de PostgreSQL
│       └── server-web/
│           ├── tasks/main.yml          ← Nginx API Gateway + React SPA rsync
│           ├── templates/              ← Plantilla nginx.conf.j2 dinámica
│           └── handlers/main.yml       ← Reinicios de Nginx
│
├── backend/
│   ├── ms-auth-service/
│   ├── ms-personas-service/
│   ├── ms-vehiculos-service/
│   ├── ms-infracciones-service/
│   └── ms-comparendos-service/
└── frontend/
    └── dist/
```

---

## Qué hace el aprovisionamiento en cada VM

### srv-simcomp-dns (Módulo DNS)
- Instala BIND9 y crea la zona directa `simcomp.co`
- Configura la zona inversa `100.168.192.in-addr.arpa` para resolución de red local
- Registros: `simcomp.co → 192.168.100.4`, `api.simcomp.co → 192.168.100.4`, `dns.simcomp.co → 192.168.100.2`
- Forwarders a `8.8.8.8` para dominios externos

### srv-simcomp-api (Módulo Backend/Datos)
- Añade el repositorio oficial PGDG e instala **PostgreSQL 14**
- Crea las 5 bases de datos: `usuarios_db`, `personas_db`, `vehiculos_db`, `infracciones_db`, `comparendos_db`
- Instala **Node.js 22** y **PM2**
- Sincroniza los 5 servicios usando **rsync para excluir explícitamente node_modules** del host
- Instala las dependencias (`npm install`) nativamente dentro de la VM
- Genera archivos `.env` dinámicos desde plantillas Jinja2
- Orquesta el arranque con PM2 usando un archivo `ecosystem.config.js` dinámico
- Configura reglas de Firewall (UFW) para los puertos 8001-8005 y 5432-5436

### srv-simcomp-web (Módulo Frontend/Gateway)
- Instala **Nginx** y sincroniza el build del frontend (excluyendo node_modules si existieran)
- Configura Nginx como **API Gateway** mediante una plantilla dinámica que mapea los servicios a los puertos 3001-3005
- Implementa validación JWT mediante `auth_request` centralizado en `auth-service` (:8001)
- Configura el manejo de rutas para React (SPA routing) en puerto 80
- Asegura la resolución DNS interna apuntando a `srv-simcomp-dns`
- Abre puertos 80 y 3001-3005 en UFW

---

## Despliegue paso a paso

### Paso 1 — Backend preparado (sin .env)

```
backend/auth-service/
backend/personas-service/
backend/vehiculos-service/
backend/infracciones-service/
backend/comparendos-service/
```

### Paso 2 — Build del frontend

```bash
cd frontend
npm install

cat > .env.production << EOF
VITE_AUTH_API=http://api.simcomp.co:3001/api/auth
VITE_PERSONAS_API=http://api.simcomp.co:3002/api/personas
VITE_VEHICULOS_API=http://api.simcomp.co:3003/api/vehiculos
VITE_INFRACCIONES_API=http://api.simcomp.co:3004/api/infracciones
VITE_COMPARENDOS_API=http://api.simcomp.co:3005/api/comparendos
EOF

npm run build
ls dist/   # debe mostrar index.html y assets/
cd ..
```

### Paso 3 — Levantar las VMs

```bash
vagrant up srv-simcomp-dns
vagrant up srv-simcomp-api
vagrant up srv-simcomp-web

# O todas juntas
vagrant up
```

### Paso 4 — Configurar DNS en tu computador

**Windows:** Panel de Control → IPv4 → DNS preferido: `192.168.100.2`

**macOS:**
```bash
sudo networksetup -setdnsservers Wi-Fi 192.168.100.2 8.8.8.8
```

**Linux:**
```bash
sudo sed -i '1s/^/nameserver 192.168.100.2\n/' /etc/resolv.conf
```

### Paso 5 — Verificar

```bash
# DNS
nslookup simcomp.co 192.168.100.2       # → 192.168.100.4
nslookup api.simcomp.co 192.168.100.2   # → 192.168.100.4

# Health checks directos a srv-simcomp-api
curl http://192.168.100.3:8001/api/health   # auth
curl http://192.168.100.3:8002/api/health   # personas
curl http://192.168.100.3:8003/api/health   # vehiculos
curl http://192.168.100.3:8004/api/health   # infracciones
curl http://192.168.100.3:8005/api/health   # comparendos

# Gateway JWT — debe rechazar sin token (usando puertos 300x)
curl -i http://api.simcomp.co:3002/api/personas   # → 401

# Login a través del gateway (puerto 3001)
curl -X POST http://api.simcomp.co:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@simcomp.co","password":"Admin123!"}'

# Playbook de verificación completo
export ANSIBLE_INVENTORY=provisioning/inventory/hosts.ini
ansible-playbook provisioning/verify.yml
```

---

## URLs de Acceso

| URL                                      | Auth    | Descripción                      |
|------------------------------------------|---------|----------------------------------|
| http://simcomp.co                        | —       | Frontend React (puerto 80)       |
| http://api.simcomp.co:3001/api/auth/login| público | Login via Gateway                |
| http://api.simcomp.co:3002/api/personas  | JWT     | Personas via Gateway             |
| http://api.simcomp.co:3003/api/vehiculos | JWT     | Vehículos via Gateway            |
| http://api.simcomp.co:3004/api/infracc...| JWT     | Infracciones via Gateway         |
| http://api.simcomp.co:3005/api/comparen..| JWT     | Comparendos via Gateway          |
| http://192.168.100.3:8001/api/docs       | —       | Swagger auth-service             |
| http://192.168.100.3:8005/api/docs       | —       | Swagger comparendos-service      |

---

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

## Comandos Vagrant

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
curl http://localhost:3001/api/health
```

**Nginx 502 Bad Gateway:**
```bash
vagrant ssh srv-simcomp-web
sudo tail -f /var/log/nginx/simcomp-error.log
curl http://192.168.100.3:3002/api/health
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

*SIMCOMP — Vagrant + Ansible · 3 VMs · 192.168.100.x · Node.js 22 + PostgreSQL 14 + PM2 + Nginx JWT Gateway · v1.1.0*