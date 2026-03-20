import { apiClient } from './axios.config'
import type { ApiResponse, LicenciaConduccion, Persona, UUID, CreatePersonaPayload, UpdatePersonaPayload, CreateLicenciaPayload, UpdateLicenciaPayload } from '../types'
import { API_URLS } from '../utils/constants'

export async function getPersonas(): Promise<Persona[]> {
  const response = await apiClient.get<ApiResponse<Persona[]>>(
    `${API_URLS.personas}/personas`,
  )
  return response.data.data.map(p => ({ ...p, persona_id: (p as any).id }))
}

export async function getPersonaById(id: UUID): Promise<Persona> {
  const response = await apiClient.get<ApiResponse<Persona>>(
    `${API_URLS.personas}/personas/${id}`,
  )
  const data = response.data.data
  return { ...data, persona_id: (data as any).id }
}

export async function getPersonaByDocumento(numero: string): Promise<Persona> {
  const response = await apiClient.get<ApiResponse<Persona>>(
    `${API_URLS.personas}/personas/documento/${numero}`,
  )
  const data = response.data.data
  if (!data) return null as any
  return { ...data, persona_id: (data as any).id }
}

export async function getPersonaByEmail(email: string): Promise<Persona> {
  const response = await apiClient.get<ApiResponse<Persona>>(
    `${API_URLS.personas}/personas/email/${email}`,
  )
  const data = response.data.data
  if (!data) return null as any
  return { ...data, persona_id: (data as any).id }
}

export async function getLicenciasByPersona(personaId: UUID): Promise<LicenciaConduccion[]> {
  const response = await apiClient.get<ApiResponse<LicenciaConduccion[]>>(
    `${API_URLS.personas}/licencias/persona/${personaId}`,
  )
  return response.data.data.map(l => ({ 
    ...l, 
    licencia_id: (l as any).id,
    persona_id: (l as any).persona_id 
  }))
}

export async function createPersona(
  data: CreatePersonaPayload,
): Promise<Persona> {
  const response = await apiClient.post<ApiResponse<Persona>>(
    `${API_URLS.personas}/personas`,
    data,
  )
  const resData = response.data.data
  return { ...resData, persona_id: (resData as any).id }
}

export async function updatePersona(
  id: UUID,
  data: UpdatePersonaPayload,
): Promise<Persona> {
  const response = await apiClient.put<ApiResponse<Persona>>(
    `${API_URLS.personas}/personas/${id}`,
    data,
  )
  const resData = response.data.data
  return { ...resData, persona_id: (resData as any).id }
}

export async function createLicencia(
  data: CreateLicenciaPayload,
): Promise<LicenciaConduccion> {
  const response = await apiClient.post<ApiResponse<LicenciaConduccion>>(
    `${API_URLS.personas}/licencias`,
    data,
  )
  const resData = response.data.data
  return { ...resData, licencia_id: (resData as any).id }
}

export async function getLicenciaByNumero(numero: string): Promise<LicenciaConduccion> {
  const response = await apiClient.get<ApiResponse<LicenciaConduccion>>(
    `${API_URLS.personas}/licencias/${numero}`,
  )
  const data = response.data.data
  return { ...data, licencia_id: (data as any).id }
}

export async function updateLicencia(
  id: UUID,
  data: UpdateLicenciaPayload,
): Promise<LicenciaConduccion> {
  const response = await apiClient.put<ApiResponse<LicenciaConduccion>>(
    `${API_URLS.personas}/licencias/${id}`,
    data,
  )
  const resData = response.data.data
  return { ...resData, licencia_id: (resData as any).id }
}
