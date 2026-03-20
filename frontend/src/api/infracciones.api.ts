import { apiClient } from './axios.config'
import type { ApiResponse, Infraccion, UUID } from '../types'
import { API_URLS } from '../utils/constants'

export async function getInfracciones(): Promise<Infraccion[]> {
  const response = await apiClient.get<ApiResponse<Infraccion[]>>(
    `${API_URLS.infracciones}/infracciones`,
  )
  return response.data.data
}

export async function getInfraccionById(id: UUID): Promise<Infraccion> {
  const response = await apiClient.get<ApiResponse<Infraccion>>(
    `${API_URLS.infracciones}/infracciones/${id}`,
  )
  return response.data.data
}

export async function getInfraccionByCodigo(codigo: string): Promise<Infraccion> {
  const response = await apiClient.get<ApiResponse<Infraccion>>(
    `${API_URLS.infracciones}/infracciones/codigo/${codigo}`,
  )
  return response.data.data
}

export async function createInfraccion(data: import('../types').CreateInfraccionPayload): Promise<Infraccion> {
  const response = await apiClient.post<ApiResponse<Infraccion>>(
    `${API_URLS.infracciones}/infracciones`,
    data,
  )
  return response.data.data
}

export async function updateInfraccion(id: UUID, data: import('../types').UpdateInfraccionPayload): Promise<Infraccion> {
  const response = await apiClient.put<ApiResponse<Infraccion>>(
    `${API_URLS.infracciones}/infracciones/${id}`,
    data,
  )
  return response.data.data
}

export async function deleteInfraccion(id: UUID): Promise<boolean> {
  const response = await apiClient.delete<ApiResponse<boolean>>(
    `${API_URLS.infracciones}/infracciones/${id}`,
  )
  return response.data.success
}

export async function toggleVigenciaInfraccion(id: UUID): Promise<Infraccion> {
  const response = await apiClient.patch<ApiResponse<Infraccion>>(
    `${API_URLS.infracciones}/infracciones/${id}/vigente`,
  )
  return response.data.data
}

export async function activateInfraccion(id: UUID): Promise<Infraccion> {
  const response = await apiClient.patch<ApiResponse<Infraccion>>(
    `${API_URLS.infracciones}/infracciones/${id}/activar`,
  )
  return response.data.data
}