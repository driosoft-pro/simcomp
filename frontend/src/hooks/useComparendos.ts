import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  anularComparendo,
  createComparendo,
  getComparendoById,
  getComparendoByNumero,
  getComparendos,
  getComparendosByAutomotor,
  getComparendosByPersona,
  pagarComparendo,
  revertirComparendo,
  getComparendoHistorial,
} from '../api/comparendos.api'
import type { Comparendo, UUID } from '../types'

export function useComparendos() {
  return useQuery<Comparendo[]>({
    queryKey: ['comparendos'],
    queryFn: getComparendos,
  })
}

export function useComparendo(id: UUID) {
  return useQuery<Comparendo>({
    queryKey: ['comparendo', id],
    queryFn: () => getComparendoById(id),
    enabled: Boolean(id),
  })
}

export function useComparendoByNumero(numero: string) {
  return useQuery<Comparendo>({
    queryKey: ['comparendo-numero', numero],
    queryFn: () => getComparendoByNumero(numero),
    enabled: Boolean(numero),
  })
}

export function useComparendosByPersona(personaId: UUID) {
  return useQuery<Comparendo[]>({
    queryKey: ['comparendos-persona', personaId],
    queryFn: () => getComparendosByPersona(personaId),
    enabled: Boolean(personaId),
  })
}

export function useComparendosByAutomotor(automotorId: UUID) {
  return useQuery<Comparendo[]>({
    queryKey: ['comparendos-automotor', automotorId],
    queryFn: () => getComparendosByAutomotor(automotorId),
    enabled: Boolean(automotorId),
  })
}

export function useCreateComparendo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      numero_comparendo: string
      fecha_hora: string
      automotor_id: UUID
      persona_id?: UUID
      infraccion_id: UUID
      direccion_exacta: string
      observaciones?: string
    }) => createComparendo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
    },
  })
}

export function usePagarComparendo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: UUID) => pagarComparendo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
    },
  })
}

export function useAnularComparendo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: UUID) => anularComparendo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
    },
  })
}

export function useRevertirComparendo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: UUID) => revertirComparendo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
    },
  })
}

export function useComparendoHistorial(id: UUID) {
  return useQuery({
    queryKey: ['comparendo-historial', id],
    queryFn: () => getComparendoHistorial(id),
    enabled: Boolean(id),
  })
}