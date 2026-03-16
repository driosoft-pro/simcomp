import { apiClient } from './axios.config'
import type { ApiResponse, Automotor, UUID } from '../types'
import { API_URLS } from '../utils/constants'

export async function getAutomotores(): Promise<Automotor[]> {
  const response = await apiClient.get<ApiResponse<Automotor[]>>(
    `${API_URLS.automotores}/automotores`,
  )
  return response.data.data
}

export async function getAutomotorById(id: UUID): Promise<Automotor> {
  const response = await apiClient.get<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores/${id}`,
  )
  return response.data.data
}

export async function searchAutomotorByPlaca(placa: string): Promise<Automotor> {
  const response = await apiClient.get<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores/placa/${placa}`,
  )
  return response.data.data
}

export async function getAutomotoresByPropietario(personaId: UUID): Promise<Automotor[]> {
  const response = await apiClient.get<ApiResponse<Automotor[]>>(
    `${API_URLS.automotores}/automotores/propietario/${personaId}`,
  )
  return response.data.data
}

export async function createAutomotor(data: import('../types').CreateAutomotorPayload): Promise<Automotor> {
  const response = await apiClient.post<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores`,
    data,
  )
  return response.data.data
}

export async function updateAutomotor(id: UUID, data: import('../types').UpdateAutomotorPayload): Promise<Automotor> {
  const response = await apiClient.put<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores/${id}`,
    data,
  )
  return response.data.data
}

export async function deleteAutomotor(id: UUID): Promise<boolean> {
  const response = await apiClient.delete<ApiResponse<boolean>>(
    `${API_URLS.automotores}/automotores/${id}`,
  )
  return response.data.success
}

export async function toggleEstadoAutomotor(id: UUID): Promise<Automotor> {
  const response = await apiClient.patch<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores/${id}/estado`,
  )
  return response.data.data
}
