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