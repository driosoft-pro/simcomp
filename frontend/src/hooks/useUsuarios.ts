import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cambiarEstadoUsuario,
  createUsuario,
  getUsuarioById,
  getUsuarios,
  updateUsuario,
} from '../api/usuarios.api'
import type { CreateUsuarioPayload, UpdateUsuarioPayload, UserEstado, UUID } from '../types'

export function useUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
  })
}

export function useUsuario(id: UUID) {
  return useQuery({
    queryKey: ['usuario', id],
    queryFn: () => getUsuarioById(id),
    enabled: Boolean(id),
  })
}

export function useCreateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUsuarioPayload) => createUsuario(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['usuarios'] }),
  })
}

export function useUpdateUsuario(id: UUID) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUsuarioPayload) => updateUsuario(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['usuario', id] })
    },
  })
}

export function useCambiarEstado(id: UUID) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (estado: UserEstado) => cambiarEstadoUsuario(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['usuarios'] })
      qc.invalidateQueries({ queryKey: ['usuario', id] })
    },
  })
}
