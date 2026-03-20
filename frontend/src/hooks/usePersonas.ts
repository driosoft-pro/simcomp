import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createLicencia,
  createPersona,
  getLicenciaByNumero,
  getLicenciasByPersona,
  getPersonaByDocumento,
  getPersonaByEmail,
  getPersonaById,
  getPersonas,
  updatePersona,
  updateLicencia,
} from '../api/personas.api'
import type { LicenciaConduccion, Persona, UUID, CreatePersonaPayload, UpdatePersonaPayload, CreateLicenciaPayload, UpdateLicenciaPayload } from '../types'

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

export function usePersonaByEmail(email: string) {
  return useQuery<Persona>({
    queryKey: ['persona-email', email],
    queryFn: () => getPersonaByEmail(email),
    enabled: Boolean(email),
  })
}

export function useLicenciasByPersona(personaId: UUID) {
  return useQuery<LicenciaConduccion[]>({
    queryKey: ['licencias-persona', personaId],
    queryFn: () => getLicenciasByPersona(personaId),
    enabled: Boolean(personaId),
  })
}

export function useUpdatePersona() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: UUID; data: UpdatePersonaPayload }) =>
      updatePersona(id, data),
    onSuccess: (persona: Persona) => {
      queryClient.invalidateQueries({ queryKey: ['personas'] })
      queryClient.invalidateQueries({ queryKey: ['persona', persona.persona_id] })
    },
  })
}

export function useCreatePersona() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePersonaPayload) =>
      createPersona(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] })
    },
  })
}

export function useLicenciaByNumero(numero: string) {
  return useQuery<LicenciaConduccion>({
    queryKey: ['licencia-numero', numero],
    queryFn: () => getLicenciaByNumero(numero),
    enabled: Boolean(numero),
  })
}

export function useCreateLicencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: CreateLicenciaPayload,
    ) => createLicencia(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['licencias-persona', variables.persona_id],
      })
    },
  })
}

export function useUpdateLicencia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: UUID; data: UpdateLicenciaPayload }) =>
      updateLicencia(id, data),
    onSuccess: (licencia: LicenciaConduccion) => {
      queryClient.invalidateQueries({
        queryKey: ['licencias-persona', licencia.persona_id],
      })
    },
  })
}
