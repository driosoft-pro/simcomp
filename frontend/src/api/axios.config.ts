import axios from 'axios'

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    // Si ya tiene un token (ej. inyectado manualmente), no lo sobrescribimos
    if (config.headers.Authorization) return config;

    const raw = localStorage.getItem('simcomp-auth');
    if (raw) {
      try {
        const { accessToken } = JSON.parse(raw);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (e) {
        // Token corrupto o inválido en storage
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo especial de 401 para ser más claro
    if (error.response?.status === 401) {
      error.message = 'Sesión expirada o no autorizada. Por favor inicie sesión de nuevo.';
    }

    // Normalizar errores de validación de Express/Sequelize
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      const fieldErrors: Record<string, string> = {}
      const messages = error.response.data.errors.map((err: any) => {
        if (err.path) {
          fieldErrors[err.path] = err.msg || err.message
        }
        return err.msg || err.message
      })
      error.fieldErrors = fieldErrors
      error.message = `${error.response.data.message || 'Error de validación'}: ${messages.join(', ')}`
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