import { apiClient } from './axios.config'
import type { ApiResponse, Automotor, UUID, PaginatedResponse } from '../types'
import { API_URLS } from '../utils/constants'

export async function getAutomotores(params?: { page?: number; limit?: number; search?: string; estado?: string; propietario?: string; order?: string }): Promise<PaginatedResponse<Automotor>> {
  const response = await apiClient.get<PaginatedResponse<Automotor>>(
    `${API_URLS.automotores}/automotores`,
    { params }
  )
  return {
    ...response.data,
    data: response.data.data.map((a: Automotor) => ({ ...a, automotor_id: (a as any).id }))
  }
}

export async function getAutomotorById(id: UUID): Promise<Automotor> {
  const response = await apiClient.get<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores/${id}`,
  )
  const data = response.data.data
  return { ...data, automotor_id: (data as any).id }
}

export async function searchAutomotorByPlaca(placa: string): Promise<Automotor> {
  const response = await apiClient.get<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores/placa/${placa}`,
  )
  const data = response.data.data
  if (!data) return null as any
  return { ...data, automotor_id: (data as any).id }
}

export async function getAutomotoresByPropietario(documento: string): Promise<Automotor[]> {
  const response = await apiClient.get<ApiResponse<Automotor[]>>(
    `${API_URLS.automotores}/automotores/propietario/${encodeURIComponent(documento)}`,
  )
  return response.data.data.map((a: Automotor) => ({ ...a, automotor_id: (a as any).id }))
}

export async function createAutomotor(data: import('../types').CreateAutomotorPayload): Promise<Automotor> {
  const response = await apiClient.post<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores`,
    data,
  )
  const resData = response.data.data
  return { ...resData, automotor_id: (resData as any).id }
}

export async function updateAutomotor(id: UUID, data: import('../types').UpdateAutomotorPayload): Promise<Automotor> {
  const response = await apiClient.put<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores/${id}`,
    data,
  )
  const resData = response.data.data
  return { ...resData, automotor_id: (resData as any).id }
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
  const resData = response.data.data
  return { ...resData, automotor_id: (resData as any).id }
}
