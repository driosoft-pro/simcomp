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
│   │   ├── automotores.api.ts       ← Gestión de vehículos
│   │   ├── infracciones.api.ts
│   │   ├── comparendos.api.ts
│   │   └── usuarios.api.ts          ← Gestión de usuarios internos
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
│   │       ├── AutomotorForm.tsx
│   │       ├── InfraccionForm.tsx
│   │       └── ComparendoForm.tsx
│   │
│   ├── pages/
│   │   ├── Login.tsx                ← Pantalla de login
│   │   ├── Dashboard.tsx
│   │   ├── personas/
│   │   │   ├── PersonasList.tsx
│   │   │   └── PersonaDetail.tsx
│   │   ├── automotores/             ← Gestión de vehículos
│   │   │   ├── AutomotoresList.tsx
│   │   │   └── AutomotorDetail.tsx
│   │   ├── infracciones/
│   │   │   └── InfraccionesList.tsx
│   │   ├── comparendos/
│   │   │   ├── ComparendosList.tsx
│   │   │   ├── ComparendoDetail.tsx
│   │   │   └── NuevoComparendo.tsx
│   │   └── usuarios/                ← Gestión de usuarios
│   │       ├── UsuariosList.tsx
│   │       └── UsuarioDetail.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               ← Acceso al AuthContext
│   │   ├── usePersonas.ts
│   │   ├── useAutomotores.ts
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
VITE_AUTH_API=http://localhost:8001/api/auth
VITE_PERSONAS_API=http://localhost:8002/api
VITE_AUTOMOTORES_API=http://localhost:8003/api
VITE_INFRACCIONES_API=http://localhost:8004/api
VITE_COMPARENDOS_API=http://localhost:8005/api
```

### Producción Vagrant (`.env.production`)
```env
VITE_AUTH_API=http://api.simcomp.co:3001/api/auth
VITE_PERSONAS_API=http://api.simcomp.co:3002/api
VITE_AUTOMOTORES_API=http://api.simcomp.co:3003/api
VITE_INFRACCIONES_API=http://api.simcomp.co:3004/api
VITE_COMPARENDOS_API=http://api.simcomp.co:3005/api
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

// user   → { id, username, email, rol, deleted_at }
// role   → 'admin' | 'agente' | 'supervisor' | 'ciudadano'
```

### Interceptor Axios (`api/axios.config.js`)
```js
// Agrega automáticamente el Bearer token a todas las peticiones
// Reintenta con refresh si recibe 401
// Redirige a /login si el refresh también falla
```

---

## Rutas y Control de Acceso

| Ruta                    | Componente        | Roles permitidos             | Descripción                      |
|-------------------------|-------------------|------------------------------|----------------------------------|
| `/login`                | Login             | público                      | Pantalla de inicio de sesión     |
| `/`                     | Dashboard         | todos                        | Panel con estadísticas           |
| `/personas`             | PersonasList      | todos                        | Listado de personas              |
| `/personas/:id`         | PersonaDetail     | todos                        | Detalle y licencias              |
| `/automotores`          | AutomotoresList   | todos                        | Listado de vehículos             |
| `/automotores/:id`      | AutomotorDetail   | todos                        | Detalle del vehículo             |
| `/infracciones`         | InfraccionesList  | admin, agente, supervisor    | Catálogo de infracciones         |
| `/comparendos`          | ComparendosList   | todos                        | Listado de comparendos           |
| `/comparendos/nuevo`    | NuevoComparendo   | admin, agente                | Formulario de nuevo comparendo   |
| `/comparendos/:id`      | ComparendoDetail  | todos                        | Detalle y acciones               |
| `/usuarios`             | UsuariosList      | todos                        | Listado de usuarios del sistema  |
| `/usuarios/:id`         | UsuarioDetail     | todos                        | Detalle del usuario              |

`ProtectedRoute` verifica `isAuthenticated` y el rol antes de renderizar.

---

## Flujo de Creación de Comparendo

1. Agente busca o registra la **persona** y obtiene sus datos (documento, nombres).
2. Selecciona el **vehículo** y obtiene sus datos (placa).
3. Selecciona la **infracción** (código, descripción, valor).
4. Completa lugar, fecha e identificación del agente.
5. Envía `POST /api/comparendos` con los **datos denormalizados** (nombres y documentos incluidos).
6. El sistema persiste el comparendo y retorna el número generado.

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
- Verificar que `auth-service` está corriendo (`curl http://api.simcomp.co:3001/api/health`)
- Revisar las variables de entorno en `.env.production`

**Error 401 al hacer peticiones:**
- El `access_token` expiró y el refresh falló
- Verificar que `JWT_SECRET` es el mismo en todos los servicios

**CORS en desarrollo:**
- Verificar que los servicios Docker tienen CORS habilitado para `http://localhost:5173`

---

*SIMCOMP Frontend — React 18 + Vite 5 + TailwindCSS + JWT · v1.1.0*