import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  anularComparendo,
  createComparendo,
  getComparendoById,
  getComparendoByNumero,
  getComparendos,
  getComparendosByAutomotor,
  getComparendosByPersona,
  getComparendosByDocumento,
  pagarComparendo,
  revertirComparendo,
  getComparendoHistorial,
} from '../api/comparendos.api'
import type { Comparendo, UUID, CreateComparendoPayload, ComparendoHistorial } from '../types'

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

export function useComparendosByDocumento(documento: string) {
  return useQuery<Comparendo[]>({
    queryKey: ['comparendos-documento', documento],
    queryFn: () => getComparendosByDocumento(documento),
    enabled: Boolean(documento),
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
    mutationFn: (data: CreateComparendoPayload) => createComparendo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
      queryClient.invalidateQueries({ queryKey: ['comparendos-documento'] })
    },
  })
}

export function usePagarComparendo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => pagarComparendo(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
      queryClient.invalidateQueries({ queryKey: ['comparendos-documento'] })
      queryClient.invalidateQueries({ queryKey: ['comparendo', id] })
      queryClient.invalidateQueries({ queryKey: ['comparendo-historial', id] })
    },
  })
}

export function useAnularComparendo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => anularComparendo(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
      queryClient.invalidateQueries({ queryKey: ['comparendos-documento'] })
      queryClient.invalidateQueries({ queryKey: ['comparendo', id] })
      queryClient.invalidateQueries({ queryKey: ['comparendo-historial', id] })
    },
  })
}

export function useRevertirComparendo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: UUID) => revertirComparendo(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
      queryClient.invalidateQueries({ queryKey: ['comparendos-documento'] })
      queryClient.invalidateQueries({ queryKey: ['comparendo', id] })
      queryClient.invalidateQueries({ queryKey: ['comparendo-historial', id] })
    },
  })
}

export function useComparendoHistorial(id: UUID) {
  return useQuery<ComparendoHistorial[]>({
    queryKey: ['comparendo-historial', id],
    queryFn: () => getComparendoHistorial(id),
    enabled: Boolean(id),
  })
}