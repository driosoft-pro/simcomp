import { API_URL } from '../config/runtime';

export const APP_VERSION = '1.0'

const API_BASE = API_URL;

export const API_URLS = {
  auth: API_BASE,
  personas: API_BASE,
  automotores: API_BASE,
  infracciones: API_BASE,
  comparendos: API_BASE,
  reportes: API_BASE,
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