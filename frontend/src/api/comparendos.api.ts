import { apiClient } from './axios.config'
import type { ApiResponse, Comparendo, UUID } from '../types'
import { API_URLS } from '../utils/constants'

export async function getComparendos(): Promise<Comparendo[]> {
  const response = await apiClient.get<ApiResponse<Comparendo[]>>(
    `${API_URLS.comparendos}/comparendos`,
  )
  return response.data.data
}

export async function getComparendoById(id: UUID): Promise<Comparendo> {
  const response = await apiClient.get<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/${id}`,
  )
  return response.data.data
}

export async function getComparendoByNumero(numero: string): Promise<Comparendo> {
  const response = await apiClient.get<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/numero/${numero}`,
  )
  return response.data.data
}

export async function getComparendosByPersona(personaId: UUID): Promise<Comparendo[]> {
  const response = await apiClient.get<ApiResponse<Comparendo[]>>(
    `${API_URLS.comparendos}/comparendos/persona/${personaId}`,
  )
  return response.data.data
}

export async function getComparendosByAutomotor(automotorId: UUID): Promise<Comparendo[]> {
  const response = await apiClient.get<ApiResponse<Comparendo[]>>(
    `${API_URLS.comparendos}/comparendos/automotor/${automotorId}`,
  )
  return response.data.data
}

export async function createComparendo(
  data: {
    numero_comparendo: string
    fecha_hora: string
    automotor_id: UUID
    persona_id?: UUID
    infraccion_id: UUID
    direccion_exacta: string
    observaciones?: string
  },
): Promise<Comparendo> {
  const response = await apiClient.post<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos`,
    data,
  )
  return response.data.data
}

export async function pagarComparendo(id: UUID): Promise<Comparendo> {
  const response = await apiClient.patch<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/${id}/pagar`,
  )
  return response.data.data
}

export async function anularComparendo(id: UUID): Promise<Comparendo> {
  const response = await apiClient.patch<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/${id}/anular`,
  )
  return response.data.data
}

export async function revertirComparendo(id: UUID): Promise<Comparendo> {
  const response = await apiClient.patch<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/${id}/revertir`,
  )
  return response.data.data
}

export async function getComparendoHistorial(id: UUID): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `${API_URLS.comparendos}/comparendos/${id}/historial`,
  )
  return response.data.data
}