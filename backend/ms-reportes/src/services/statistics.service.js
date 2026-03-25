import { fetchModuleData } from "./httpClients.js";

export async function buildGeneralStatistics(token) {
  const [usuarios, personas, automotores, infracciones, comparendos] = await Promise.all([
    fetchModuleData("usuarios", token),
    fetchModuleData("personas", token),
    fetchModuleData("automotores", token),
    fetchModuleData("infracciones", token),
    fetchModuleData("comparendos", token)
  ]);

  const comparendosPorEstado = comparendos.reduce((acc, item) => {
    const estado = item.estado || "SIN_ESTADO";
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const usuariosPorRol = usuarios.reduce((acc, item) => {
    const rol = item.rol || "SIN_ROL";
    acc[rol] = (acc[rol] || 0) + 1;
    return acc;
  }, {});

  return {
    resumen: {
      totalUsuarios: usuarios.length,
      totalPersonas: personas.length,
      totalAutomotores: automotores.length,
      totalInfracciones: infracciones.length,
      totalComparendos: comparendos.length
    },
    usuariosPorRol,
    comparendosPorEstado
  };
}