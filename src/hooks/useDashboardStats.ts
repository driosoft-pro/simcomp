import { useQuery } from '@tanstack/react-query'
import { getStatistics } from '../api/reportes.api'

export function useDashboardStats() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['statistics'],
    queryFn: getStatistics,
    staleTime: 60000, // 60 segundos
  })

  const colors = [
    '#6366f1', // violet-500
    '#0ea5e9', // sky-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#f43f5e', // rose-500
    '#8b5cf6', // purple-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
  ]

  const comparendosPorEstado = data ? Object.entries(data.comparendosPorEstado).map(([name, value], index) => ({
    name,
    value,
    fill: colors[index % colors.length]
  })) : []

  return {
    stats: data?.resumen || {
      totalPersonas: 0,
      totalAutomotores: 0,
      totalComparendos: 0,
      totalInfracciones: 0
    },
    charts: {
      comparendosPorHora: data?.comparendosPorHora || [],
      comparendosPorEstado,
    },
    isLoading,
    isError,
  }
}
