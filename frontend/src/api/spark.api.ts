import { API_URLS } from '../utils/constants';
import { apiClient } from './axios.config';

const BASE_URL = API_URLS.spark;

export const getDatasets = async () => {
  const response = await apiClient.get(`${BASE_URL}/datasets`);
  return response.data;
};

export const uploadDataset = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`${BASE_URL}/datasets/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDatasetSummary = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/summary`);
  return response.data;
};

export const getMissingValues = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/missing`);
  return response.data;
};

export const getNumericColumns = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/numeric-columns`);
  return response.data;
};

export const getCategoricalColumns = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/categorical-columns`);
  return response.data;
};

export const getTopCategories = async (filename: string, column: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/top-categories`, {
    params: { column },
  });
  return response.data;
};

export const getCorrelationMatrix = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/correlation-matrix`);
  return response.data;
};

export const getNumericTop = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/numeric-top`);
  return response.data;
};

export const getPaginatedData = async (filename: string, page: number, limit: number) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/data`, {
    params: { page, limit },
  });
  return response.data;
};

// SIMCOMP-specific
export const getSimcompKpis = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/kpis`);
  return response.data;
};

export const getSimcompPorCiudad = async (filename: string, limit = 10) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/por-ciudad`, {
    params: { limit },
  });
  return response.data;
};

export const getSimcompPorEstado = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/por-estado`);
  return response.data;
};

export const getSimcompPorTipoSancion = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/por-tipo-sancion`);
  return response.data;
};

export const getSimcompPorValorMulta = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/por-valor-multa`);
  return response.data;
};

export const getSimcompTendenciaMensual = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/tendencia-mensual`);
  return response.data;
};

export const getSimcompPorMarca = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/por-marca`);
  return response.data;
};

export const getSimcompPorTipoServicio = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/por-tipo-servicio`);
  return response.data;
};

export const getSimcompPorCategoriaLicencia = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/por-categoria-licencia`);
  return response.data;
};

export const getSimcompPorAnio = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/simcomp/por-anio`);
  return response.data;
};

export const getRecommendations = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/recommendations`);
  return response.data;
};

export const getNumericStatistics = async (filename: string) => {
  const response = await apiClient.get(`${BASE_URL}/datasets/${filename}/numeric-statistics`);
  return response.data;
};
