export const APP_VERSION = '1.0'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_URLS = {
  auth: import.meta.env.VITE_AUTH_API || `${API_BASE}/auth`,
  personas: import.meta.env.VITE_PERSONAS_API || `${API_BASE}/personas`,
  automotores: import.meta.env.VITE_AUTOMOTORES_API || `${API_BASE}/automotores`,
  infracciones: import.meta.env.VITE_INFRACCIONES_API || `${API_BASE}/infracciones`,
  comparendos: import.meta.env.VITE_COMPARENDOS_API || `${API_BASE}/comparendos`,
  reportes: import.meta.env.VITE_REPORTES_API || `${API_BASE}/reportes`,
} as const;


export const ROUTES = {
  login: '/login',
  dashboard: '/',
  personas: '/personas',
  automotores: '/automotores',
  infracciones: '/infracciones',
  comparendos: '/comparendos',
  nuevoComparendo: '/comparendos/nuevo',
  usuarios: '/usuarios',
  reportes: '/reportes',
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