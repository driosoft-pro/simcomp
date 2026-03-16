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
  persona_id: UUID
  tipo_documento: 'CC' | 'CE' | 'PAS' | 'TI'
  numero_documento: string
  primer_nombre: string
  segundo_nombre?: string | null
  primer_apellido: string
  segundo_apellido?: string | null
  direccion: string
  telefono: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface LicenciaConduccion {
  licencia_id: UUID
  persona_id: UUID
  numero_licencia: string
  fecha_expedicion: string
  categoria: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
  fecha_vencimiento: string
  estado: 'VIGENTE' | 'SUSPENDIDA' | 'VENCIDA' | 'CANCELADA'
}

export interface Automotor {
  automotor_id: UUID
  placa: string
  tipo: 'MOTO' | 'CARRO' | 'BUS' | 'BUSETA' | 'CAMION' | 'TRACTOMULA' | 'CUATRIMOTO'
  marca: string
  modelo: string
  anio: number
  color: string
  cilindraje: number
  estado: 'LEGAL' | 'REPORTADO_ROBO' | 'RECUPERADO' | 'EMBARGADO'
  propietario_id: UUID
  created_at?: string
  updated_at?: string
}

export interface Infraccion {
  infraccion_id: UUID
  codigo: string
  descripcion: string
  articulo_codigo: string
  tipo_sancion: 'MONETARIA' | 'SUSPENSION_LICENCIA' | 'INMOVILIZACION' | 'MIXTA'
  valor_multa: number
  dias_suspension?: number | null
  aplica_descuento: boolean
  vigente: boolean
}

export interface Comparendo {
  comparendo_id: UUID
  numero_comparendo: string
  fecha_hora: string
  automotor_id: UUID
  persona_id: UUID
  infraccion_id: UUID
  direccion_exacta: string
  estado:
    | 'CREADO'
    | 'VIGENTE'
    | 'EN_PROCESO_DE_PAGO'
    | 'PAGADO'
    | 'CERRADO'
    | 'EN_COBRO_COACTIVO'
    | 'IMPUGNADO'
    | 'EXONERADO'
    | 'ANULADO'
  valor_multa: number
  observaciones?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreateInfraccionPayload {
  codigo: string
  descripcion: string
  articulo_codigo: string
  tipo_sancion: 'MONETARIA' | 'SUSPENSION_LICENCIA' | 'INMOVILIZACION' | 'MIXTA'
  valor_multa: number
  dias_suspension?: number | null
  aplica_descuento: boolean
  vigente: boolean
}

export interface UpdateInfraccionPayload extends Partial<CreateInfraccionPayload> {}

export interface CreateAutomotorPayload {
  placa: string
  tipo: 'MOTO' | 'CARRO' | 'BUS' | 'BUSETA' | 'CAMION' | 'TRACTOMULA' | 'CUATRIMOTO'
  marca: string
  modelo: string
  anio: number
  color: string
  cilindraje: number
  estado: 'LEGAL' | 'REPORTADO_ROBO' | 'RECUPERADO' | 'EMBARGADO'
  propietario_id: UUID
}

export interface UpdateAutomotorPayload extends Partial<CreateAutomotorPayload> {}