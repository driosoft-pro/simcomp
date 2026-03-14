import { useQuery } from '@tanstack/react-query'
import {
  getVehiculoById,
  getVehiculos,
  getVehiculosByPropietario,
  searchVehiculoByPlaca,
} from '../api/vehiculos.api'
import type { Automotor, UUID } from '../types'

export function useVehiculos() {
  return useQuery<Automotor[]>({
    queryKey: ['vehiculos'],
    queryFn: getVehiculos,
  })
}

export function useVehiculo(id: UUID) {
  return useQuery<Automotor>({
    queryKey: ['vehiculo', id],
    queryFn: () => getVehiculoById(id),
    enabled: Boolean(id),
  })
}

export function useVehiculoByPlaca(placa: string) {
  return useQuery<Automotor>({
    queryKey: ['vehiculo-placa', placa],
    queryFn: () => searchVehiculoByPlaca(placa),
    enabled: Boolean(placa),
  })
}

export function useVehiculosByPropietario(personaId: UUID) {
  return useQuery<Automotor[]>({
    queryKey: ['vehiculos-propietario', personaId],
    queryFn: () => getVehiculosByPropietario(personaId),
    enabled: Boolean(personaId),
  })
}