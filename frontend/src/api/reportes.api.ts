import { apiClient } from './axios.config'
import type { ApiResponse } from '../types'
import { API_URLS } from '../utils/constants'

export interface SystemStatistics {
  resumen: {
    totalPersonas: number
    totalUsuarios: number
    totalAutomotores: number
    totalInfracciones: number
    totalComparendos: number
  }
  usuariosPorRol: Record<string, number>
  comparendosPorEstado: Record<string, number>
}

export interface ImportResult {
  total: number
  inserted: number
  failed: number
  errors: { row: number; error: any }[]
}

export async function getStatistics(): Promise<SystemStatistics> {
  const response = await apiClient.get<ApiResponse<SystemStatistics>>(
    `${API_URLS.reportes}/estadisticas`,
  )
  return response.data.data
}

export async function exportByModule(modulo: string, format: 'csv' | 'excel' | 'pdf', limit?: string): Promise<Blob> {
  const query = limit ? `?limit=${limit}` : ''
  const response = await apiClient.get(
    `${API_URLS.reportes}/export/${modulo}/${format}${query}`,
    { responseType: 'blob' }
  )
  return response.data
}

export async function exportAll(format: 'zip' | 'excel', limit?: string): Promise<Blob> {
  const query = limit ? `?limit=${limit}` : ''
  const response = await apiClient.get(
    `${API_URLS.reportes}/export/all/${format}${query}`,
    { responseType: 'blob' }
  )
  return response.data
}

export async function importData(modulo: string, file: File): Promise<ImportResult> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await apiClient.post<ApiResponse<ImportResult>>(
    `${API_URLS.reportes}/import/${modulo}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data.data
}

export async function getReportesHealth(): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.get<ApiResponse<any>>(`${API_URLS.reportes}/health`)
  return { success: response.status === 200, message: response.data.message || 'OK' }
}
