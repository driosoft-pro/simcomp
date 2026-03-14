import { apiClient } from './axios.config'
import type { ApiResponse, LicenciaConduccion, Persona, UUID } from '../types'
import { API_URLS } from '../utils/constants'

export async function getPersonas(): Promise<Persona[]> {
  const response = await apiClient.get<ApiResponse<Persona[]>>(
    `${API_URLS.personas}/personas`,
  )
  return response.data.data
}

export async function getPersonaById(id: UUID): Promise<Persona> {
  const response = await apiClient.get<ApiResponse<Persona>>(
    `${API_URLS.personas}/personas/${id}`,
  )
  return response.data.data
}

export async function getPersonaByDocumento(numero: string): Promise<Persona> {
  const response = await apiClient.get<ApiResponse<Persona>>(
    `${API_URLS.personas}/personas/documento/${numero}`,
  )
  return response.data.data
}

export async function getLicenciasByPersona(personaId: UUID): Promise<LicenciaConduccion[]> {
  const response = await apiClient.get<ApiResponse<LicenciaConduccion[]>>(
    `${API_URLS.personas}/personas/${personaId}/licencias`,
  )
  return response.data.data
}

export async function createPersona(
  data: Omit<Persona, 'persona_id' | 'created_at' | 'updated_at'>,
): Promise<Persona> {
  const response = await apiClient.post<ApiResponse<Persona>>(
    `${API_URLS.personas}/personas`,
    data,
  )
  return response.data.data
}