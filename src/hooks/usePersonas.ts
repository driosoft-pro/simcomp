import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPersona,
  getLicenciasByPersona,
  getPersonaByDocumento,
  getPersonaById,
  getPersonas,
} from '../api/personas.api'
import type { LicenciaConduccion, Persona, UUID } from '../types'

export function usePersonas() {
  return useQuery<Persona[]>({
    queryKey: ['personas'],
    queryFn: getPersonas,
  })
}

export function usePersona(id: UUID) {
  return useQuery<Persona>({
    queryKey: ['persona', id],
    queryFn: () => getPersonaById(id),
    enabled: Boolean(id),
  })
}

export function usePersonaByDocumento(numero: string) {
  return useQuery<Persona>({
    queryKey: ['persona-documento', numero],
    queryFn: () => getPersonaByDocumento(numero),
    enabled: Boolean(numero),
  })
}

export function useLicenciasByPersona(personaId: UUID) {
  return useQuery<LicenciaConduccion[]>({
    queryKey: ['licencias-persona', personaId],
    queryFn: () => getLicenciasByPersona(personaId),
    enabled: Boolean(personaId),
  })
}

export function useCreatePersona() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: Omit<Persona, 'persona_id' | 'created_at' | 'updated_at'>,
    ) => createPersona(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] })
    },
  })
}