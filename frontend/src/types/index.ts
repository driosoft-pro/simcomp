export type UUID = string

export type UserRole = 'admin' | 'agente' | 'supervisor' | 'ciudadano'
export type UserEstado = 'activo' | 'inactivo'

export interface AuthUser {
  id: UUID
  username: string
  email: string
  rol: UserRole
}

export interface Usuario {
  id: UUID
  username: string
  email: string
  rol: UserRole
  estado: UserEstado
  created_at?: string
  updated_at?: string
}

export interface CreateUsuarioPayload {
  username: string
  email: string
  password: string
  rol: UserRole
}

export interface UpdateUsuarioPayload {
  username?: string
  email?: string
  rol?: UserRole
}

export interface LoginPayload {
  identifier: string
  password: string
}

export interface LoginResponseData {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface Persona {
  id: UUID
  persona_id: UUID
  tipo_documento: 'CC' | 'CE' | 'PASAPORTE' | 'TI'
  numero_documento: string
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: 'M' | 'F' | 'O'
  direccion: string
  telefono: string
  email: string
  estado: 'activo' | 'inactivo'
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface CreatePersonaPayload {
  tipo_documento: 'CC' | 'CE' | 'PASAPORTE' | 'TI'
  numero_documento: string
  nombres: string
  apellidos: string
  fecha_nacimiento: string
  genero: 'M' | 'F' | 'O'
  direccion: string
  telefono: string
  email: string
  estado?: 'activo' | 'inactivo'
}

export interface UpdatePersonaPayload extends Partial<CreatePersonaPayload> {}

export interface LicenciaConduccion {
  id: UUID
  licencia_id: UUID
  persona_id: UUID
  numero_licencia: string
  fecha_expedicion: string
  categoria: 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3'
  fecha_vencimiento: string
  estado: 'vigente' | 'suspendida' | 'vencida' | 'cancelada'
  observaciones?: string | null
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface CreateLicenciaPayload {
  persona_id: UUID
  numero_licencia: string
  fecha_expedicion: string
  categoria: 'A1' | 'A2' | 'B1' | 'B2' | 'B3' | 'C1' | 'C2' | 'C3'
  fecha_vencimiento: string
  estado: 'vigente' | 'suspendida' | 'vencida' | 'cancelada'
  observaciones?: string | null
}

export interface UpdateLicenciaPayload extends Partial<Omit<CreateLicenciaPayload, 'persona_id'>> {}

export interface Automotor {
  id: UUID
  automotor_id: UUID
  placa: string
  vin: string
  numero_motor: string
  numero_chasis: string
  marca: string
  linea: string
  modelo: number
  color: string
  clase: 'AUTOMOVIL' | 'MOTOCICLETA' | 'CAMIONETA' | 'CAMPERO' | 'BUS' | 'CAMION'
  servicio: 'PARTICULAR' | 'PUBLICO' | 'OFICIAL'
  propietario_documento: string
  propietario_nombre: string
  estado: 'activo' | 'inactivo' | 'inmovilizado'
  condicion: 'LEGAL' | 'REPORTADO_ROBO' | 'RECUPERADO' | 'EMBARGADO'
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface Infraccion {
  id: UUID
  infraccion_id: UUID
  codigo: string
  descripcion: string
  articulo_codigo: string
  tipo_sancion: 'MONETARIA' | 'SUSPENSION_LICENCIA' | 'INMOVILIZACION' | 'MIXTA'
  valor_multa: number
  dias_suspension?: number | null
  estado: string
  aplica_descuento: boolean
  vigente: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface CreateInfraccionPayload {
  codigo: string
  descripcion: string
  articulo_codigo: string
  tipo_sancion: 'MONETARIA' | 'SUSPENSION_LICENCIA' | 'INMOVILIZACION' | 'MIXTA'
  valor_multa: number
  dias_suspension?: number
  aplica_descuento?: boolean
  vigente?: boolean
}

export interface UpdateInfraccionPayload extends Partial<CreateInfraccionPayload> {}

export interface CreateAutomotorPayload {
  placa: string
  vin: string
  numero_motor: string
  numero_chasis: string
  marca: string
  linea: string
  modelo: number
  color: string
  clase: 'AUTOMOVIL' | 'MOTOCICLETA' | 'CAMIONETA' | 'CAMPERO' | 'BUS' | 'CAMION'
  servicio?: 'PARTICULAR' | 'PUBLICO' | 'OFICIAL'
  propietario_documento: string
  propietario_nombre: string
  estado?: 'activo' | 'inactivo' | 'inmovilizado'
  condicion?: 'LEGAL' | 'REPORTADO_ROBO' | 'RECUPERADO' | 'EMBARGADO'
}

export interface UpdateAutomotorPayload extends Partial<CreateAutomotorPayload> {}

export interface Comparendo {
  id: UUID
  comparendo_id: UUID
  numero_comparendo: string
  ciudadano_documento: string
  ciudadano_nombre: string
  agente_documento: string
  agente_nombre: string
  placa_vehiculo: string
  clase_vehiculo?: string
  infraccion_codigo: string
  infraccion_descripcion: string
  valor_multa: number | string
  fecha_comparendo: string
  lugar: string
  ciudad: string
  observaciones?: string | null
  estado: 'PENDIENTE' | 'PAGADO' | 'ANULADO' | 'VIGENTE' | 'CERRADO' | 'EN_PROCESO_DE_PAGO' | 'EN_COBRO_COACTIVO' | 'IMPUGNADO' | 'EXONERADO'
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface ComparendoHistorial {
  id: UUID
  comparendo_id: UUID
  estado_anterior: string | null
  estado_nuevo: string
  observacion: string
  fecha_evento: string
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface CreateComparendoPayload {
  numero_comparendo: string
  ciudadano_documento: string
  ciudadano_nombre: string
  agente_documento: string
  agente_nombre: string
  placa_vehiculo: string
  clase_vehiculo?: string
  infraccion_codigo?: string
  infraccion_descripcion?: string
  valor_multa?: number
  infracciones?: {
    codigo: string
    descripcion: string
    valor_multa: number
  }[]
  fecha_comparendo: string
  lugar: string
  ciudad: string
  observaciones?: string
}