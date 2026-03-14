import { useQuery } from '@tanstack/react-query'
import {
  getInfraccionByCodigo,
  getInfraccionById,
  getInfracciones,
} from '../api/infracciones.api'
import type { Infraccion, UUID } from '../types'

export function useInfracciones() {
  return useQuery<Infraccion[]>({
    queryKey: ['infracciones'],
    queryFn: getInfracciones,
  })
}

export function useInfraccion(id: UUID) {
  return useQuery<Infraccion>({
    queryKey: ['infraccion', id],
    queryFn: () => getInfraccionById(id),
    enabled: Boolean(id),
  })
}

export function useInfraccionByCodigo(codigo: string) {
  return useQuery<Infraccion>({
    queryKey: ['infraccion-codigo', codigo],
    queryFn: () => getInfraccionByCodigo(codigo),
    enabled: Boolean(codigo),
  })
}