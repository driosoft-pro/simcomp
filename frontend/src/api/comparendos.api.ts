import { apiClient } from './axios.config'
import type { ApiResponse, Comparendo, UUID, CreateComparendoPayload } from '../types'
import { API_URLS } from '../utils/constants'

export async function getComparendos(): Promise<Comparendo[]> {
  const response = await apiClient.get<ApiResponse<Comparendo[]>>(
    `${API_URLS.comparendos}/comparendos`,
  )
  return response.data.data.map(c => ({ ...c, comparendo_id: (c as any).id }))
}

export async function getComparendoById(id: UUID): Promise<Comparendo> {
  const response = await apiClient.get<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/${id}`,
  )
  const data = response.data.data
  return { ...data, comparendo_id: (data as any).id }
}

export async function getComparendoByNumero(numero: string): Promise<Comparendo> {
  const response = await apiClient.get<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/numero/${numero}`,
  )
  const data = response.data.data
  return { ...data, comparendo_id: (data as any).id }
}

export async function getComparendosByPersona(personaId: UUID): Promise<Comparendo[]> {
  const response = await apiClient.get<ApiResponse<Comparendo[]>>(
    `${API_URLS.comparendos}/comparendos/persona/${personaId}`,
  )
  return response.data.data.map(c => ({ ...c, comparendo_id: (c as any).id }))
}

export async function getComparendosByAutomotor(automotorId: UUID): Promise<Comparendo[]> {
  const response = await apiClient.get<ApiResponse<Comparendo[]>>(
    `${API_URLS.comparendos}/comparendos/automotor/${automotorId}`,
  )
  return response.data.data.map(c => ({ ...c, comparendo_id: (c as any).id }))
}

export async function getComparendosByPlaca(placa: string): Promise<Comparendo[]> {
  const response = await apiClient.get<ApiResponse<Comparendo[]>>(
    `${API_URLS.comparendos}/comparendos/placa/${placa}`,
  )
  return response.data.data.map(c => ({ ...c, comparendo_id: (c as any).id }))
}

export async function createComparendo(
  data: CreateComparendoPayload,
): Promise<Comparendo | Comparendo[]> {
  const response = await apiClient.post<ApiResponse<Comparendo | Comparendo[]>>(
    `${API_URLS.comparendos}/comparendos`,
    data,
  )
  const resData = response.data.data
  
  if (Array.isArray(resData)) {
    return resData.map(c => ({ ...c, comparendo_id: (c as any).id }))
  }
  
  return { ...resData, comparendo_id: (resData as any).id }
}

export async function pagarComparendo(id: UUID): Promise<Comparendo> {
  const response = await apiClient.patch<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/${id}/pagar`,
  )
  const data = response.data.data
  return { ...data, comparendo_id: (data as any).id }
}

export async function anularComparendo(id: UUID): Promise<Comparendo> {
  const response = await apiClient.patch<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/${id}/anular`,
  )
  const data = response.data.data
  return { ...data, comparendo_id: (data as any).id }
}

export async function revertirComparendo(id: UUID): Promise<Comparendo> {
  const response = await apiClient.patch<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/${id}/revertir`,
  )
  const data = response.data.data
  return { ...data, comparendo_id: (data as any).id }
}

export async function getComparendoHistorial(id: UUID): Promise<any[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `${API_URLS.comparendos}/comparendos/${id}/historial`,
  )
  return response.data.data
}

export async function updateComparendo(id: UUID, data: Partial<CreateComparendoPayload>): Promise<Comparendo> {
  const response = await apiClient.put<ApiResponse<Comparendo>>(
    `${API_URLS.comparendos}/comparendos/${id}`,
    data,
  )
  const resData = response.data.data
  return { ...resData, comparendo_id: (resData as any).id }
}

export async function getSiguienteNumeroComparendo(): Promise<string> {
  const response = await apiClient.get<ApiResponse<string>>(
    `${API_URLS.comparendos}/comparendos/siguiente-numero`,
  )
  return response.data.data
}