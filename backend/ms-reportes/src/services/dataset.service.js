import archiver from "archiver";
import { PassThrough } from "stream";
import { fetchModuleData } from "./httpClients.js";
import { toCsv } from "./csv.service.js";
import { buildExcelDataset } from "./excel.service.js";
import { buildPdfReport } from "./pdf.service.js";
import { buildGeneralStatistics } from "./statistics.service.js";

/**
 * Construye el dataset completo del sistema.
 * Todos los módulos se solicitan en paralelo (Promise.all).
 * Si se pasa limit, se aplica a la query HTTP, no en memoria.
 */
export async function buildFullDataset(token, limit) {
  const fetchOpts = (limit && limit !== "all" && !isNaN(parseInt(limit)))
    ? { limit: parseInt(limit) }
    : {};

  // Fetch en paralelo de los 5 módulos
  const [usuarios, personas, automotores, infracciones, comparendos] = await Promise.all([
    fetchModuleData("usuarios",    token, fetchOpts),
    fetchModuleData("personas",    token, fetchOpts),
    fetchModuleData("automotores", token, fetchOpts),
    fetchModuleData("infracciones",token, fetchOpts),
    fetchModuleData("comparendos", token, fetchOpts),
  ]);

  return { usuarios, personas, automotores, infracciones, comparendos };
}

/**
 * Construye el ZIP con CSV + Excel + PDF del dataset completo.
 * Optimizaciones:
 * - buildFullDataset y buildGeneralStatistics comparten el fetch si las stats
 *   están en cache (evita la segunda ronda de 5 llamadas HTTP).
 * - Generación de Excel y PDF en paralelo con Promise.all.
 * - Compresión zlib level 6 en lugar de 9 (point sweet: velocidad vs tamaño).
 */
export async function buildDatasetZipBuffer(token, limit) {
  // Lanzar dataset y stats en paralelo.
  // Si stats está en cache, el segundo Promise.all retorna de inmediato.
  const [dataset, stats] = await Promise.all([
    buildFullDataset(token, limit),
    buildGeneralStatistics(token),
  ]);

  // Generar Excel y PDF en paralelo (operaciones CPU-bound independientes)
  const [excelBuffer, pdfBuffer] = await Promise.all([
    buildExcelDataset(dataset),
    buildPdfReport("Reporte general SIMCOMP", [
      {
        title: "Resumen general",
        lines: Object.entries(stats.resumen).map(([k, v]) => `${k}: ${v}`),
      },
      {
        title: "Usuarios por rol",
        lines: Object.entries(stats.usuariosPorRol).map(([k, v]) => `${k}: ${v}`),
      },
      {
        title: "Comparendos por estado",
        lines: Object.entries(stats.comparendosPorEstado).map(([k, v]) => `${k}: ${v}`),
      },
      {
        title: "Generado en",
        lines: [stats.generatedAt || new Date().toISOString()],
      },
    ]),
  ]);

  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks = [];

    // Level 6: punto óptimo velocidad/compresión (level 9 es 2-3x más lento por ~5% menos tamaño)
    const archive = archiver("zip", { zlib: { level: 6 } });

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    archive.on("error", reject);
    archive.pipe(stream);

    for (const [name, rows] of Object.entries(dataset)) {
      archive.append(toCsv(rows), { name: `${name}.csv` });
    }

    archive.append(excelBuffer, { name: "dataset_completo.xlsx" });
    archive.append(pdfBuffer,   { name: "reporte_general.pdf" });

    archive.finalize();
  });
}