import archiver from "archiver";
import { PassThrough } from "stream";
import { fetchModuleData } from "./httpClients.js";
import { toCsv } from "./csv.service.js";
import { buildExcelDataset } from "./excel.service.js";
import { buildPdfReport } from "./pdf.service.js";
import { buildGeneralStatistics } from "./statistics.service.js";

export async function buildFullDataset(token) {
  const [usuarios, personas, automotores, infracciones, comparendos] = await Promise.all([
    fetchModuleData("usuarios", token),
    fetchModuleData("personas", token),
    fetchModuleData("automotores", token),
    fetchModuleData("infracciones", token),
    fetchModuleData("comparendos", token)
  ]);

  return {
    usuarios,
    personas,
    automotores,
    infracciones,
    comparendos
  };
}

export async function buildDatasetZipBuffer(token) {
  const dataset = await buildFullDataset(token);
  const stats = await buildGeneralStatistics(token);

  const excelBuffer = await buildExcelDataset(dataset);

  const pdfBuffer = await buildPdfReport("Reporte general SIMCOMP", [
    {
      title: "Resumen general",
      lines: Object.entries(stats.resumen).map(([k, v]) => `${k}: ${v}`)
    },
    {
      title: "Usuarios por rol",
      lines: Object.entries(stats.usuariosPorRol).map(([k, v]) => `${k}: ${v}`)
    },
    {
      title: "Comparendos por estado",
      lines: Object.entries(stats.comparendosPorEstado).map(([k, v]) => `${k}: ${v}`)
    }
  ]);

  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    const chunks = [];
    const archive = archiver("zip", { zlib: { level: 9 } });

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);

    archive.on("error", reject);
    archive.pipe(stream);

    for (const [name, rows] of Object.entries(dataset)) {
      archive.append(toCsv(rows), { name: `${name}.csv` });
    }

    archive.append(excelBuffer, { name: "dataset_completo.xlsx" });
    archive.append(pdfBuffer, { name: "reporte_general.pdf" });

    archive.finalize();
  });
}