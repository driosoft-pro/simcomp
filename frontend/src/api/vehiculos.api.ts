import { apiClient } from './axios.config'
import type { ApiResponse, Automotor, UUID } from '../types'
import { API_URLS } from '../utils/constants'

export async function getVehiculos(): Promise<Automotor[]> {
  const response = await apiClient.get<ApiResponse<Automotor[]>>(
    `${API_URLS.automotores}/automotores`,
  )
  return response.data.data
}

export async function getVehiculoById(id: UUID): Promise<Automotor> {
  const response = await apiClient.get<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores/${id}`,
  )
  return response.data.data
}

export async function searchVehiculoByPlaca(placa: string): Promise<Automotor> {
  const response = await apiClient.get<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores/placa/${placa}`,
  )
  return response.data.data
}

export async function getVehiculosByPropietario(personaId: UUID): Promise<Automotor[]> {
  const response = await apiClient.get<ApiResponse<Automotor[]>>(
    `${API_URLS.automotores}/automotores/propietario/${personaId}`,
  )
  return response.data.data
}

export async function createVehiculo(
  data: Omit<Automotor, 'automotor_id' | 'created_at' | 'updated_at'>,
): Promise<Automotor> {
  const response = await apiClient.post<ApiResponse<Automotor>>(
    `${API_URLS.automotores}/automotores`,
    data,
  )
  return response.data.data
}