# SIMCOMP — Despliegue en Vagrant

Guía para desplegar en **3 VMs** con Vagrant + Ansible. Sin Docker en producción.

---

## Arquitectura (red 192.168.100.x)

```
Tu navegador → DNS 192.168.100.2

svr-dns  192.168.100.2   BIND9 — zona simcomp.co
svr-api  192.168.100.3   5 microservicios + PostgreSQL + PM2
svr-web  192.168.100.4   Nginx API Gateway JWT + React SPA

svr-api corre los 5 servicios por localhost:
  auth-service         :3001  →  usuarios_db
  personas-service     :3002  →  personas_db
  vehiculos-service    :3003  →  vehiculos_db
  infracciones-service :3004  →  infracciones_db
  comparendos-service  :3005  →  comparendos_db

svr-web enruta todo a svr-api (192.168.100.3):
  /api/auth/*        → :3001  [público]
  /api/personas/*    → :3002  [JWT]
  /api/vehiculos/*   → :3003  [JWT]
  /api/infracciones/*→ :3004  [JWT]
  /api/comparendos/* → :3005  [JWT]
  /                  → /var/www/simcomp  [React SPA]

Flujo JWT (API Gateway):
  Petición → Nginx (svr-web)
    └─ subrequest POST /_auth_validate → 192.168.100.3:3001
         200 OK → proxy al servicio destino
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

| VM       | IP              | RAM    | CPU | Rol                                |
|----------|-----------------|--------|-----|------------------------------------|
| svr-dns  | 192.168.100.2   | 512 MB | 1   | DNS BIND9 — zona simcomp.co        |
| svr-api  | 192.168.100.3   | 2 GB   | 2   | 5 servicios Node.js + PostgreSQL + PM2 |
| svr-web  | 192.168.100.4   | 1 GB   | 1   | Nginx API Gateway JWT + React SPA  |

---

## Archivos de Infraestructura

```
simcomp/
├── Vagrantfile
├── provisioning/
│   ├── site.yml                    ← orquesta los 3 roles
│   ├── verify.yml                  ← health check de todos los servicios
│   ├── hosts.ini                   ← inventario 192.168.100.x
│   ├── group_vars/
│   │   ├── all.yml                 ← IPs, passwords, JWT_SECRET, lista de servicios
│   │   ├── svr-api.yml             ← config PostgreSQL / PM2
│   │   └── svr-web.yml             ← upstreams y rutas del gateway
│   └── roles/
│       ├── serve-dns/main.yml      ← BIND9 + zona simcomp.co
│       ├── serve-api/main.yml      ← PostgreSQL×5 + Node.js + PM2 con 5 servicios
│       └── server-web/main.yml     ← Nginx API Gateway JWT + React SPA
│
├── backend/
│   ├── auth-service/
│   ├── personas-service/
│   ├── vehiculos-service/
│   ├── infracciones-service/
│   └── comparendos-service/
└── frontend/
    └── dist/
```

---

## Qué hace el aprovisionamiento en cada VM

### svr-dns
- Instala BIND9 y crea la zona `simcomp.co`
- Registros: `simcomp.co → 192.168.100.4`, `api.simcomp.co → 192.168.100.4`, `dns.simcomp.co → 192.168.100.2`
- Forwarders a `8.8.8.8` para dominios externos

### svr-api
- Instala **PostgreSQL 14** y crea las 5 bases de datos: `usuarios_db`, `personas_db`, `vehiculos_db`, `infracciones_db`, `comparendos_db`
- Instala **Node.js 20** y **PM2**
- Copia los 5 servicios desde `/vagrant/backend/` a `/opt/simcomp/`
- Elimina `node_modules` locales y los reinstala nativamente en Ubuntu
- Genera `.env` de producción para cada servicio (los servicios se llaman entre sí por `localhost`)
- Crea `/opt/simcomp/ecosystem.config.js` — `auth-service` arranca primero
- Levanta los 5 servicios con PM2 y configura startup automático al boot
- Abre puertos 3001-3005 en UFW

### svr-web
- Instala **Nginx**
- Copia `frontend/dist/` a `/var/www/simcomp/` (build generado en local)
- Configura Nginx como **API Gateway con validación JWT** (`auth_request`)
- Configura SPA routing para React Router
- Abre puerto 80 en UFW

---

## Despliegue paso a paso

### Paso 1 — Backend preparado (sin node_modules, sin .env)

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
VITE_AUTH_API=http://api.simcomp.co/api/auth
VITE_PERSONAS_API=http://api.simcomp.co/api/personas
VITE_VEHICULOS_API=http://api.simcomp.co/api/vehiculos
VITE_INFRACCIONES_API=http://api.simcomp.co/api/infracciones
VITE_COMPARENDOS_API=http://api.simcomp.co/api/comparendos
EOF

npm run build
ls dist/   # debe mostrar index.html y assets/
cd ..
```

### Paso 3 — Levantar las VMs

```bash
vagrant up svr-dns
vagrant up svr-api
vagrant up svr-web

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

# Health checks directos a svr-api
curl http://192.168.100.3:3001/api/health   # auth
curl http://192.168.100.3:3002/api/health   # personas
curl http://192.168.100.3:3003/api/health   # vehiculos
curl http://192.168.100.3:3004/api/health   # infracciones
curl http://192.168.100.3:3005/api/health   # comparendos

# Gateway JWT — debe rechazar sin token
curl -i http://api.simcomp.co/api/personas   # → 401

# Login a través del gateway
curl -X POST http://api.simcomp.co/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@simcomp.co","password":"Admin123!"}'

# Playbook de verificación completo
ansible-playbook provisioning/verify.yml -i provisioning/hosts.ini
```

---

## 🌐 URLs de Acceso

| URL                                      | Auth    | Descripción                  |
|------------------------------------------|---------|------------------------------|
| http://simcomp.co                        | —       | Frontend React               |
| http://api.simcomp.co/api/auth/login     | público | Login                        |
| http://api.simcomp.co/api/auth/refresh   | público | Renovar token                |
| http://api.simcomp.co/api/personas       | JWT     | Personas via gateway         |
| http://api.simcomp.co/api/vehiculos      | JWT     | Vehículos via gateway        |
| http://api.simcomp.co/api/infracciones   | JWT     | Infracciones via gateway     |
| http://api.simcomp.co/api/comparendos    | JWT     | Comparendos via gateway      |
| http://192.168.100.3:3001/api/docs       | —       | Swagger auth-service         |
| http://192.168.100.3:3002/api/docs       | —       | Swagger personas-service     |
| http://192.168.100.3:3003/api/docs       | —       | Swagger vehiculos-service    |
| http://192.168.100.3:3004/api/docs       | —       | Swagger infracciones-service |
| http://192.168.100.3:3005/api/docs       | —       | Swagger comparendos-service  |

---

## Comandos Vagrant

```bash
vagrant status
vagrant ssh svr-dns
vagrant ssh svr-api
vagrant ssh svr-web
vagrant provision svr-api          # re-aprovisionar tras cambios en backend
vagrant provision svr-web          # re-aprovisionar tras nuevo build frontend
vagrant reload --provision svr-api
vagrant halt
vagrant up --no-provision
vagrant destroy -f && vagrant up
```

## PM2 en svr-api

```bash
vagrant ssh svr-api

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
vagrant provision svr-api

# Frontend
cd frontend && npm run build && cd ..
vagrant provision svr-web
```

---

## Solución de Problemas

**Gateway devuelve 401 en todas las rutas:**
```bash
vagrant ssh svr-api
pm2 logs auth-service --lines 30
pm2 restart auth-service
curl http://localhost:3001/api/health
```

**Nginx 502 Bad Gateway:**
```bash
vagrant ssh svr-web
sudo tail -f /var/log/nginx/simcomp-error.log
curl http://192.168.100.3:3002/api/health
sudo systemctl restart nginx
```

**DNS no resuelve:**
```bash
vagrant ssh svr-dns
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

*SIMCOMP — Vagrant + Ansible · 3 VMs · 192.168.100.x · Node.js 20 + PostgreSQL 14 + PM2 + Nginx JWT Gateway · v1.0.0*