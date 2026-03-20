import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getInfraccionByCodigo,
  getInfraccionById,
  getInfracciones,
  createInfraccion,
  updateInfraccion,
  deleteInfraccion,
  toggleVigenciaInfraccion,
  activateInfraccion,
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

export function useCreateInfraccion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: import('../types').CreateInfraccionPayload) => createInfraccion(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infracciones'] }),
  })
}

export function useUpdateInfraccion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: UUID; data: import('../types').UpdateInfraccionPayload }) => updateInfraccion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infracciones'] })
      queryClient.invalidateQueries({ queryKey: ['infraccion'] })
    },
  })
}

export function useDeleteInfraccion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => deleteInfraccion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['infracciones'] }),
  })
}

export function useToggleVigenciaInfraccion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => toggleVigenciaInfraccion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infracciones'] })
      queryClient.invalidateQueries({ queryKey: ['infraccion'] })
    },
  })
}

export function useActivateInfraccion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => activateInfraccion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infracciones'] })
      queryClient.invalidateQueries({ queryKey: ['infraccion'] })
    },
  })
}