import axios from 'axios'

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const messages = error.response.data.errors.map((err: any) => err.msg || err.message)
      error.message = `${error.response.data.message}: ${messages.join(', ')}`
    } else if (error.response?.data?.message) {
      error.message = error.response.data.message
    }
    return Promise.reject(error)
  },
)

export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common.Authorization
  }
}