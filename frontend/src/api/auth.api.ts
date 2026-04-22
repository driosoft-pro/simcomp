import axios from 'axios'
import type { ApiResponse, LoginPayload, LoginResponseData } from '../types'
import { API_URLS } from '../utils/constants'

const authApi = axios.create({
  baseURL: API_URLS.auth,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginResponseData> {
  const response = await authApi.post<ApiResponse<LoginResponseData>>(
    '/auth/login',
    payload,
  )
  return response.data.data
}

export async function logoutRequest(refreshToken?: string): Promise<void> {
  await authApi.post('/auth/logout', { refreshToken })
}

export async function refreshTokenRequest(
  refreshToken: string,
): Promise<LoginResponseData> {
  const response = await authApi.post<ApiResponse<LoginResponseData>>(
    '/auth/refresh',
    { refreshToken },
  )
  return response.data.data
}