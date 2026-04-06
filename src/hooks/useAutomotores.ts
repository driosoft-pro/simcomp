import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAutomotores,
  getAutomotorById,
  searchAutomotorByPlaca,
  getAutomotoresByPropietario,
  createAutomotor,
  updateAutomotor,
  deleteAutomotor,
  toggleEstadoAutomotor,
} from '../api/automotores.api'
import type { Automotor, UUID } from '../types'

export function useAutomotores() {
  return useQuery<Automotor[]>({
    queryKey: ['automotores'],
    queryFn: getAutomotores,
  })
}

export function useAutomotor(id: UUID) {
  return useQuery<Automotor>({
    queryKey: ['automotor', id],
    queryFn: () => getAutomotorById(id),
    enabled: Boolean(id),
  })
}

export function useAutomotorByPlaca(placa: string) {
  return useQuery<Automotor>({
    queryKey: ['automotor-placa', placa],
    queryFn: () => searchAutomotorByPlaca(placa),
    enabled: Boolean(placa),
  })
}

export function useAutomotoresByPropietario(documento: string) {
  return useQuery<Automotor[]>({
    queryKey: ['automotores-propietario', documento],
    queryFn: () => getAutomotoresByPropietario(documento),
    enabled: Boolean(documento),
  })
}

export function useCreateAutomotor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: import('../types').CreateAutomotorPayload) => createAutomotor(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automotores'] }),
  })
}

export function useUpdateAutomotor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: UUID; data: import('../types').UpdateAutomotorPayload }) => updateAutomotor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotores'] })
      queryClient.invalidateQueries({ queryKey: ['automotor'] })
    },
  })
}

export function useDeleteAutomotor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => deleteAutomotor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automotores'] }),
  })
}

export function useToggleEstadoAutomotor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => toggleEstadoAutomotor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automotores'] })
      queryClient.invalidateQueries({ queryKey: ['automotor'] })
    },
  })
}
