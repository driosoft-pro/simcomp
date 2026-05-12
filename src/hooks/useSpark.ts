import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as sparkApi from '../api/spark.api';

export const useDatasets = () => {
  return useQuery({
    queryKey: ['spark', 'datasets'],
    queryFn: sparkApi.getDatasets,
  });
};

export const useUploadDataset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sparkApi.uploadDataset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spark', 'datasets'] });
    },
  });
};

export const useSparkKpis = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'kpis', filename],
    queryFn: () => sparkApi.getSimcompKpis(filename!),
    enabled: !!filename,
  });
};

export const useSparkPorCiudad = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'por-ciudad', filename],
    queryFn: () => sparkApi.getSimcompPorCiudad(filename!),
    enabled: !!filename,
  });
};

export const useSparkPorEstado = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'por-estado', filename],
    queryFn: () => sparkApi.getSimcompPorEstado(filename!),
    enabled: !!filename,
  });
};

export const useSparkPorTipoSancion = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'por-tipo-sancion', filename],
    queryFn: () => sparkApi.getSimcompPorTipoSancion(filename!),
    enabled: !!filename,
  });
};

export const useSparkPorValorMulta = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'por-valor-multa', filename],
    queryFn: () => sparkApi.getSimcompPorValorMulta(filename!),
    enabled: !!filename,
  });
};

export const useSparkTendenciaMensual = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'tendencia-mensual', filename],
    queryFn: () => sparkApi.getSimcompTendenciaMensual(filename!),
    enabled: !!filename,
  });
};

export const useSparkPorMarca = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'por-marca', filename],
    queryFn: () => sparkApi.getSimcompPorMarca(filename!),
    enabled: !!filename,
  });
};

export const useSparkPorTipoServicio = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'por-tipo-servicio', filename],
    queryFn: () => sparkApi.getSimcompPorTipoServicio(filename!),
    enabled: !!filename,
  });
};

export const useSparkPorCategoriaLicencia = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'por-categoria-licencia', filename],
    queryFn: () => sparkApi.getSimcompPorCategoriaLicencia(filename!),
    enabled: !!filename,
  });
};

export const useSparkPorAnio = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'por-anio', filename],
    queryFn: () => sparkApi.getSimcompPorAnio(filename!),
    enabled: !!filename,
  });
};

export const useSparkSummary = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'summary', filename],
    queryFn: () => sparkApi.getDatasetSummary(filename!),
    enabled: !!filename,
  });
};

export const useSparkMissing = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'missing', filename],
    queryFn: () => sparkApi.getMissingValues(filename!),
    enabled: !!filename,
  });
};

export const useSparkNumericTop = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'numeric-top', filename],
    queryFn: () => sparkApi.getNumericTop(filename!),
    enabled: !!filename,
  });
};

export const useSparkCorrelationMatrix = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'correlation-matrix', filename],
    queryFn: () => sparkApi.getCorrelationMatrix(filename!),
    enabled: !!filename,
  });
};

export const useSparkRecommendations = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'recommendations', filename],
    queryFn: () => sparkApi.getRecommendations(filename!),
    enabled: !!filename,
  });
};

export const useSparkNumericStats = (filename: string | null) => {
  return useQuery({
    queryKey: ['spark', 'numeric-stats', filename],
    queryFn: () => sparkApi.getNumericStatistics(filename!),
    enabled: !!filename,
  });
};

export const useSparkPaginatedData = (filename: string | null, page: number, limit: number) => {
  return useQuery({
    queryKey: ['spark', 'data', filename, page, limit],
    queryFn: () => sparkApi.getPaginatedData(filename!, page, limit),
    enabled: !!filename,
  });
};
