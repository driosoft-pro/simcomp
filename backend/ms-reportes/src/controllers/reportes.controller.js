import { parseCsvBuffer, toCsv, validateCsvRows } from "../services/csv.service.js";
import { fetchModuleData, postModuleRow, assertModule } from "../services/httpClients.js";
import { buildExcelSingleSheet, buildExcelDataset } from "../services/excel.service.js";
import { buildPdfReport } from "../services/pdf.service.js";
import { buildGeneralStatistics } from "../services/statistics.service.js";
import { buildFullDataset, buildDatasetZipBuffer } from "../services/dataset.service.js";

export async function health(req, res) {
  res.json({
    success: true,
    service: "ms-reportes",
    message: "OK"
  });
}

export async function importCsvByModule(req, res) {
  const { modulo } = req.params;
  const token = req.headers.authorization;
  assertModule(modulo);

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Debes enviar un archivo CSV"
    });
  }

  const rows = parseCsvBuffer(req.file.buffer);
  validateCsvRows(modulo, rows);

  const result = {
    total: rows.length,
    inserted: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < rows.length; i += 1) {
    try {
      await postModuleRow(modulo, rows[i], token);
      result.inserted += 1;
    } catch (error) {
      result.failed += 1;
      result.errors.push({
        row: i + 1,
        error: error.response?.data || error.message
      });
    }
  }

  res.json({
    success: true,
    message: `Importacion completada para ${modulo}`,
    data: result
  });
}

export async function exportCsvByModule(req, res) {
  const { modulo } = req.params;
  const { limit } = req.query;
  const token = req.headers.authorization;
  assertModule(modulo);

  let data = await fetchModuleData(modulo, token);
  
  if (limit && limit !== "all" && !isNaN(parseInt(limit))) {
    data = data.slice(0, parseInt(limit));
  }

  const csv = toCsv(data);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${modulo}.csv"`);

  res.send(csv);
}

export async function exportExcelByModule(req, res) {
  const { modulo } = req.params;
  const { limit } = req.query;
  const token = req.headers.authorization;
  assertModule(modulo);

  let data = await fetchModuleData(modulo, token);

  if (limit && limit !== "all" && !isNaN(parseInt(limit))) {
    data = data.slice(0, parseInt(limit));
  }

  const buffer = await buildExcelSingleSheet(modulo, data);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${modulo}.xlsx"`);

  res.send(Buffer.from(buffer));
}

export async function exportPdfByModule(req, res) {
  const { modulo } = req.params;
  const { limit } = req.query;
  const token = req.headers.authorization;
  assertModule(modulo);

  let data = await fetchModuleData(modulo, token);

  const appliedLimit = (limit && limit !== "all" && !isNaN(parseInt(limit))) 
    ? parseInt(limit) 
    : data.length;

  const displayData = data.slice(0, appliedLimit);

  const sectionLines = displayData.map((row, index) => {
    if (modulo === "personas") {
      return `${index + 1}. [${row.tipo_documento} ${row.numero_documento}] ${row.nombres} ${row.apellidos} - ${row.email}`;
    }
    return `${index + 1}. ${JSON.stringify(row)}`;
  });

  const buffer = await buildPdfReport(`Reporte del modulo ${modulo}`, [
    {
      title: "Resumen",
      lines: [`Total registros exportados: ${displayData.length} de ${data.length}`]
    },
    {
      title: "Registros",
      lines: sectionLines.length ? sectionLines : ["Sin registros"]
    }
  ]);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${modulo}.pdf"`);

  res.send(buffer);
}

export async function exportFullDataset(req, res) {
  const token = req.headers.authorization;
  const { limit } = req.query;
  const zipBuffer = await buildDatasetZipBuffer(token, limit);

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="dataset_simcomp.zip"');

  res.send(zipBuffer);
}

export async function exportFullDatasetExcel(req, res) {
  const token = req.headers.authorization;
  const { limit } = req.query;
  const dataset = await buildFullDataset(token, limit);
  const buffer = await buildExcelDataset(dataset);

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="dataset_simcomp.xlsx"');

  res.send(Buffer.from(buffer));
}

export async function getStatistics(req, res) {
  const token = req.headers.authorization;
  const stats = await buildGeneralStatistics(token);

  res.json({
    success: true,
    data: stats
  });
}

export async function exportStatisticsPdf(req, res) {
  const token = req.headers.authorization;
  const stats = await buildGeneralStatistics(token);

  const buffer = await buildPdfReport("Estadisticas generales SIMCOMP", [
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

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="estadisticas_simcomp.pdf"');

  res.send(buffer);
}