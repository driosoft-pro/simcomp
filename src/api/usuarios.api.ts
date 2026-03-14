import { apiClient } from './axios.config'
import type { ApiResponse, CreateUsuarioPayload, UpdateUsuarioPayload, Usuario, UserEstado, UUID } from '../types'
import { API_URLS } from '../utils/constants'

const BASE = `${API_URLS.auth.replace('/auth', '')}/usuarios`

export async function getUsuarios(): Promise<Usuario[]> {
  const response = await apiClient.get<ApiResponse<Usuario[]>>(BASE)
  return response.data.data
}

export async function getUsuarioById(id: UUID): Promise<Usuario> {
  const response = await apiClient.get<ApiResponse<Usuario>>(`${BASE}/${id}`)
  return response.data.data
}

export async function createUsuario(data: CreateUsuarioPayload): Promise<Usuario> {
  const response = await apiClient.post<ApiResponse<Usuario>>(BASE, data)
  return response.data.data
}

export async function updateUsuario(id: UUID, data: UpdateUsuarioPayload): Promise<Usuario> {
  const response = await apiClient.put<ApiResponse<Usuario>>(`${BASE}/${id}`, data)
  return response.data.data
}

export async function cambiarEstadoUsuario(id: UUID, estado: UserEstado): Promise<Usuario> {
  const response = await apiClient.patch<ApiResponse<Usuario>>(`${BASE}/${id}/estado`, { estado })
  return response.data.data
}
