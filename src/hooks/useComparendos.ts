import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  anularComparendo,
  createComparendo,
  getComparendoById,
  getComparendoByNumero,
  getComparendos,
  getComparendosByAutomotor,
  getComparendosByPersona,
  getComparendosByPlaca,
  pagarComparendo,
  revertirComparendo,
  getComparendoHistorial,
  updateComparendo,
  getSiguienteNumeroComparendo,
} from '../api/comparendos.api'
import type { Comparendo, UUID, CreateComparendoPayload, ComparendoHistorial } from '../types'

export function useComparendosByPlaca(placa: string) {
  return useQuery<Comparendo[]>({
    queryKey: ['comparendos-placa', placa],
    queryFn: () => getComparendosByPlaca(placa),
    enabled: Boolean(placa),
  })
}

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


// ... (skipping some exports)

export function useCreateComparendo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateComparendoPayload) => createComparendo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
      queryClient.invalidateQueries({ queryKey: ['comparendos', 'siguiente-numero'] })
    },
  })
}

export function usePagarComparendo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: UUID) => pagarComparendo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
      queryClient.invalidateQueries({ queryKey: ['comparendo', id] })
    },
  })
}

export function useAnularComparendo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: UUID) => anularComparendo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
      queryClient.invalidateQueries({ queryKey: ['comparendo', id] })
    },
  })
}

export function useRevertirComparendo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: UUID) => revertirComparendo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
      queryClient.invalidateQueries({ queryKey: ['comparendo', id] })
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

export function useUpdateComparendo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: UUID; data: Partial<CreateComparendoPayload> }) =>
      updateComparendo(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['comparendos'] })
      queryClient.invalidateQueries({ queryKey: ['comparendo', id] })
    },
  })
}

export function useSiguienteNumeroComparendo() {
  return useQuery({
    queryKey: ['comparendos', 'siguiente-numero'],
    queryFn: getSiguienteNumeroComparendo,
    refetchOnWindowFocus: false,
    staleTime: 0,
  })
}