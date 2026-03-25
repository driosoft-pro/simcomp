import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api/axios.config'

/**
 * Generic hook to check a microservice health endpoint.
 * @param url  Full health URL, e.g. `${API_URLS.personas}/health`
 * @param key  Unique query key, e.g. 'personas-health'
 */
export function useServiceHealth(url: string, key: string) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => {
      try {
        const response = await apiClient.get(url)
        return { online: response.status === 200 }
      } catch {
        return { online: false }
      }
    },
    refetchInterval: 30000,
    retry: false,
  })
}
