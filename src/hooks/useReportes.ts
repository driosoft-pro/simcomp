import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as reportesApi from '../api/reportes.api'

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: reportesApi.getStatistics,
    refetchInterval: 30000, // Refetch every 30s
  })
}

export function useExport() {
  return useMutation({
    mutationFn: ({ modulo, format, all }: { modulo?: string; format: any, all?: boolean }) => {
      if (all) return reportesApi.exportAll(format)
      return reportesApi.exportByModule(modulo!, format)
    },
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const filename = variables.all 
        ? `dataset_completo.${variables.format === 'zip' ? 'zip' : 'xlsx'}`
        : `${variables.modulo}_reporte.${variables.format}`
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    }
  })
}

export function useImport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ modulo, file }: { modulo: string; file: File }) => 
      reportesApi.importData(modulo, file),
    onSuccess: () => {
      // Invalidate all queries to refresh data after import
      queryClient.invalidateQueries()
    }
  })
}

export function useReportesHealth() {
  return useQuery({
    queryKey: ['reportes-health'],
    queryFn: reportesApi.getReportesHealth,
  })
}
