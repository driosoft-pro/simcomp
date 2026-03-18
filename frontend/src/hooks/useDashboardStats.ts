import { useQuery } from '@tanstack/react-query'
import { getPersonas } from '../api/personas.api'
import { getAutomotores } from '../api/automotores.api'
import { getComparendos } from '../api/comparendos.api'
import { getInfracciones } from '../api/infracciones.api'
import { parseISO, getHours } from 'date-fns'

export function useDashboardStats() {
  const personasQuery = useQuery({
    queryKey: ['personas'],
    queryFn: getPersonas,
  })

  const automotoresQuery = useQuery({
    queryKey: ['automotores'],
    queryFn: getAutomotores,
  })

  const comparendosQuery = useQuery({
    queryKey: ['comparendos'],
    queryFn: getComparendos,
  })

  const infraccionesQuery = useQuery({
    queryKey: ['infracciones'],
    queryFn: getInfracciones,
  })

  const isLoading = 
    personasQuery.isLoading || 
    automotoresQuery.isLoading || 
    comparendosQuery.isLoading || 
    infraccionesQuery.isLoading

  const isError = 
    personasQuery.isError || 
    automotoresQuery.isError || 
    comparendosQuery.isError || 
    infraccionesQuery.isError

  const stats = {
    totalPersonas: personasQuery.data?.length || 0,
    totalAutomotores: automotoresQuery.data?.length || 0,
    totalComparendos: comparendosQuery.data?.length || 0,
    totalInfracciones: infraccionesQuery.data?.length || 0,
  }

  // Procesar comparendos por hora
  const comparendosPorHora = Array.from({ length: 24 }, (_, i) => ({
    hora: `${i}:00`,
    cantidad: 0,
  }))

  comparendosQuery.data?.forEach(c => {
    try {
      const date = parseISO(c.fecha_comparendo)
      const hour = getHours(date)
      if (hour >= 0 && hour < 24) {
        comparendosPorHora[hour].cantidad++
      }
    } catch (e) {
      console.error('Error parsing date:', c.fecha_comparendo, e)
    }
  })

  // Procesar estado de comparendos
  const estadosCounter: Record<string, number> = {}
  comparendosQuery.data?.forEach(c => {
    estadosCounter[c.estado] = (estadosCounter[c.estado] || 0) + 1
  })

  const comparendosPorEstado = Object.entries(estadosCounter).map(([name, value]) => ({
    name,
    value,
  }))

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

  const comparendosPorEstadoWithColors = comparendosPorEstado.map((item, index) => ({
    ...item,
    fill: colors[index % colors.length]
  }))

  return {
    stats,
    charts: {
      comparendosPorHora,
      comparendosPorEstado: comparendosPorEstadoWithColors,
    },
    isLoading,
    isError,
  }
}
