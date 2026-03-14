export const API_URLS = {
  auth: import.meta.env.VITE_AUTH_API || 'http://localhost:8001/api/auth',
  personas: import.meta.env.VITE_PERSONAS_API || 'http://localhost:8002/api',
  automotores: import.meta.env.VITE_AUTOMOTORES_API || 'http://localhost:8003/api',
  infracciones: import.meta.env.VITE_INFRACCIONES_API || 'http://localhost:8004/api',
  comparendos: import.meta.env.VITE_COMPARENDOS_API || 'http://localhost:8005/api',
} as const

export const ROUTES = {
  login: '/login',
  dashboard: '/',
  personas: '/personas',
  automotores: '/automotores',
  infracciones: '/infracciones',
  comparendos: '/comparendos',
  nuevoComparendo: '/comparendos/nuevo',
  usuarios: '/usuarios',
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  AGENTE: 'agente',
  SUPERVISOR: 'supervisor',
} as const

export const COMPARENDO_ESTADOS = {
  VIGENTE: 'VIGENTE',
  EN_PROCESO_DE_PAGO: 'EN_PROCESO_DE_PAGO',
  PAGADO: 'PAGADO',
  CERRADO: 'CERRADO',
  EN_COBRO_COACTIVO: 'EN_COBRO_COACTIVO',
  IMPUGNADO: 'IMPUGNADO',
  EXONERADO: 'EXONERADO',
  ANULADO: 'ANULADO',
  CREADO: 'CREADO',
} as const