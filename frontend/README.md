# SIMCOMP — Frontend

Panel de administración del Sistema de Comparendos de Tránsito.

**Stack:** React 19 + TypeScript + Vite + TailwindCSS 3 + React Query + React Hook Form + pnpm

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 22 LTS         |
| pnpm        | 10             |

---

## Estructura del Proyecto

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx
│   ├── App.tsx                      ← Router + ProtectedRoute
│   ├── index.css
│   │
│   ├── api/                         ← Clientes HTTP por microservicio
│   │   ├── axios.config.ts          ← Interceptor JWT + refresh automático
│   │   ├── auth.api.ts              ← login, logout, refresh, me
│   │   ├── personas.api.ts
│   │   ├── vehiculos.api.ts
│   │   ├── infracciones.api.ts
│   │   └── comparendos.api.ts
│   │
│   ├── context/
│   │   └── AuthContext.tsx          ← Estado global de sesión + tokens
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx           ← Muestra usuario y rol activo
│   │   │   └── Layout.tsx
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx   ← Redirige a /login si no hay sesión
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── Toast.tsx
│   │   └── forms/
│   │       ├── PersonaForm.tsx
│   │       ├── VehiculoForm.tsx
│   │       ├── InfraccionForm.tsx
│   │       └── ComparendoForm.tsx
│   │
│   ├── pages/
│   │   ├── Login.tsx                ← Pantalla de login
│   │   ├── Dashboard.tsx
│   │   ├── personas/
│   │   │   ├── PersonasList.tsx
│   │   │   └── PersonaDetail.tsx
│   │   ├── vehiculos/
│   │   │   ├── VehiculosList.tsx
│   │   │   └── VehiculoDetail.tsx
│   │   ├── infracciones/
│   │   │   └── InfraccionesList.tsx
│   │   └── comparendos/
│   │       ├── ComparendosList.tsx
│   │       ├── ComparendoDetail.tsx
│   │       └── NuevoComparendo.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               ← Acceso al AuthContext
│   │   ├── usePersonas.ts
│   │   ├── useVehiculos.ts
│   │   ├── useInfracciones.ts
│   │   └── useComparendos.ts
│   │
│   └── utils/
│       ├── formatters.ts
│       └── constants.ts             ← URLs, enums, roles
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.ts
├── .env
├── .env.example
├── .env.production
├── .gitignore
└── package.json
```

---

## Variables de Entorno

### Desarrollo local (`.env`)
```env
VITE_AUTH_API=http://localhost:3005/api/auth
VITE_PERSONAS_API=http://localhost:3001/api
VITE_VEHICULOS_API=http://localhost:3002/api
VITE_INFRACCIONES_API=http://localhost:3003/api
VITE_COMPARENDOS_API=http://localhost:3004/api
```

### Producción Vagrant (`.env.production`)
```env
VITE_AUTH_API=http://api.simcomp.co/api/auth
VITE_PERSONAS_API=http://api.simcomp.co/api/personas
VITE_VEHICULOS_API=http://api.simcomp.co/api/vehiculos
VITE_INFRACCIONES_API=http://api.simcomp.co/api/infracciones
VITE_COMPARENDOS_API=http://api.simcomp.co/api/comparendos
```

---

## Dependencias

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "axios": "^1.8.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.0.0",
    "date-fns": "^4.0.0",
    "lucide-react": "^0.500.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.45",
    "tailwindcss": "^3.4.19",
    "vite": "^7.0.0",
    "eslint": "^9.0.0"
  }
}
```

```
pnpm install
cp .env.example .env
pnpm dev
pnpm build
pnpm preview
```

---

## Autenticación y Flujo JWT

### Flujo completo
```
1. Usuario abre http://simcomp.co → App.jsx detecta que no hay sesión
2. Redirige a /login (ProtectedRoute)
3. Login: POST /api/auth/login → { access_token, refresh_token, user }
4. AuthContext guarda tokens:
     - access_token  → memoria (variable JS, no localStorage)
     - refresh_token → cookie HttpOnly (más seguro) o sessionStorage
5. Cada petición axios incluye automáticamente:
     Authorization: Bearer <access_token>
6. Si access_token expira (15min) → interceptor axios hace automáticamente:
     POST /api/auth/refresh → nuevo access_token
7. Si refresh_token expira (7d) → redirige a /login
8. Logout: POST /api/auth/logout → revoca refresh_token en DB → limpia contexto
```

### AuthContext — Estado global de sesión
```jsx
// Provee al árbol de componentes:
const { user, role, isAuthenticated, login, logout } = useAuth()

// user   → { id, username, email, rol }
// role   → 'admin' | 'agente' | 'supervisor'
```

### Interceptor Axios (`api/axios.config.js`)
```js
// Agrega automáticamente el Bearer token a todas las peticiones
// Reintenta con refresh si recibe 401
// Redirige a /login si el refresh también falla
```

---

## Rutas y Control de Acceso

| Ruta                    | Componente        | Rol mínimo  | Descripción                      |
|-------------------------|-------------------|-------------|----------------------------------|
| `/login`                | Login             | público     | Pantalla de inicio de sesión     |
| `/`                     | Dashboard         | supervisor  | Panel con estadísticas           |
| `/personas`             | PersonasList      | agente      | Listado de personas              |
| `/personas/:id`         | PersonaDetail     | agente      | Detalle y licencias              |
| `/vehiculos`            | VehiculosList     | agente      | Listado de vehículos             |
| `/vehiculos/:id`        | VehiculoDetail    | agente      | Detalle del vehículo             |
| `/infracciones`         | InfraccionesList  | agente      | Catálogo de infracciones         |
| `/comparendos`          | ComparendosList   | supervisor  | Listado de comparendos           |
| `/comparendos/nuevo`    | NuevoComparendo   | agente      | Formulario de nuevo comparendo   |
| `/comparendos/:id`      | ComparendoDetail  | supervisor  | Detalle y acciones               |

`ProtectedRoute` verifica `isAuthenticated` y el rol antes de renderizar.
Si el usuario no tiene el rol requerido, muestra una pantalla de acceso denegado.

---

## Flujo de Creación de Comparendo

1. Agente busca la **persona** por número de documento
2. Selecciona el **vehículo** del propietario o busca por placa
3. Selecciona la **infracción** del catálogo (muestra código y valor)
4. Completa lugar, fecha e identificación del agente
5. Envía `POST /api/comparendos` con el `access_token` en el header
6. Nginx valida el token → enruta a comparendos-service
7. El sistema muestra el número de comparendo generado

---

## Instalación y Uso

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno local
cp .env.example .env
# Editar .env con las URLs de los microservicios locales

# 3. Iniciar en desarrollo (requiere Docker Compose corriendo)
npm run dev
# Disponible en: http://localhost:5173

# 4. Build para producción (Vagrant)
npm run build
# Genera: frontend/dist/

# 5. Preview del build
npm run preview
```

---

## Solución de Problemas

**La app redirige siempre a /login:**
- Verificar que `auth-service` está corriendo (`curl http://localhost:3005/api/health`)
- Revisar las variables de entorno en `.env`

**Error 401 al hacer peticiones:**
- El `access_token` expiró y el refresh falló
- Verificar que `JWT_SECRET` es el mismo en todos los servicios

**CORS en desarrollo:**
- Verificar que los servicios Docker tienen CORS habilitado para `http://localhost:5173`

---

*SIMCOMP Frontend — React 18 + Vite 5 + TailwindCSS + JWT · v1.0.0*