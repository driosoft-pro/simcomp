import { parseCsvBuffer, toCsv, validateCsvRows } from "../services/csv.service.js";
import { fetchModuleData, postModuleRow, assertModule } from "../services/httpClients.js";
import { buildExcelSingleSheet, buildExcelDataset } from "../services/excel.service.js";
import { buildPdfReport } from "../services/pdf.service.js";
import { buildGeneralStatistics } from "../services/statistics.service.js";
import { buildFullDataset, buildDatasetZipBuffer } from "../services/dataset.service.js";
import { exportConsolidatedCsv } from "../services/consolidado.service.js";

export async function health(req, res) {
  res.json({
    success: true,
    service: "ms-reportes",
    message: "OK",
    timestamp: new Date().toISOString(),
  });
}

/**
 * Importación CSV concurrente por batches.
 * Antes: `for await postModuleRow` secuencial → N requests en serie.
 * Ahora: batches de BATCH_SIZE en paralelo → N/BATCH_SIZE rondas de requests.
 *
 * BATCH_SIZE=10: equilibrio entre velocidad y no saturar el microservicio destino.
 */
const IMPORT_BATCH_SIZE = 10;

export async function importCsvByModule(req, res) {
  const { modulo } = req.params;
  const token = req.headers.authorization;
  assertModule(modulo);

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Debes enviar un archivo CSV",
    });
  }

  const rows = parseCsvBuffer(req.file.buffer);
  validateCsvRows(modulo, rows);

  const result = { total: rows.length, inserted: 0, failed: 0, errors: [] };

  // Procesar en batches paralelos
  for (let i = 0; i < rows.length; i += IMPORT_BATCH_SIZE) {
    const batch = rows.slice(i, i + IMPORT_BATCH_SIZE);

    const outcomes = await Promise.allSettled(
      batch.map((row) => postModuleRow(modulo, row, token))
    );

    outcomes.forEach((outcome, j) => {
      if (outcome.status === "fulfilled") {
        result.inserted += 1;
      } else {
        result.failed += 1;
        result.errors.push({
          row: i + j + 1,
          error: outcome.reason?.response?.data || outcome.reason?.message,
        });
      }
    });
  }

  res.json({
    success: true,
    message: `Importacion completada para ${modulo}`,
    data: result,
  });
}

export async function exportCsvByModule(req, res) {
  const { modulo } = req.params;
  const { limit } = req.query;
  const token = req.headers.authorization;
  assertModule(modulo);

  const fetchOpts = (limit && limit !== "all" && !isNaN(parseInt(limit)))
    ? { limit: parseInt(limit) }
    : { limit: 1000000 };

  const data = await fetchModuleData(modulo, token, fetchOpts);
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

  const fetchOpts = (limit && limit !== "all" && !isNaN(parseInt(limit)))
    ? { limit: parseInt(limit) }
    : { limit: 1000000 };

  const data = await fetchModuleData(modulo, token, fetchOpts);
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

  const fetchOpts = (limit && limit !== "all" && !isNaN(parseInt(limit)))
    ? { limit: parseInt(limit) }
    : { limit: 1000000 };

  const data = await fetchModuleData(modulo, token, fetchOpts);

  const sectionLines = data.map((row, index) => {
    if (modulo === "personas") {
      return `${index + 1}. [${row.tipo_documento} ${row.numero_documento}] ${row.nombres} ${row.apellidos} - ${row.email}`;
    }
    return `${index + 1}. ${JSON.stringify(row)}`;
  });

  const buffer = await buildPdfReport(`Reporte del modulo ${modulo}`, [
    {
      title: "Resumen",
      lines: [`Total registros exportados: ${data.length}`],
    },
    {
      title: "Registros",
      lines: sectionLines.length ? sectionLines : ["Sin registros"],
    },
  ]);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${modulo}.pdf"`);
  res.send(buffer);
}

export async function exportFullDataset(req, res) {
  const token = req.headers.authorization;
  const limit = req.query.limit || 1000000;
  const zipBuffer = await buildDatasetZipBuffer(token, limit);

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", 'attachment; filename="dataset_simcomp.zip"');
  res.send(zipBuffer);
}

export async function exportConsolidatedCsvController(req, res) {
  const token = req.headers.authorization;
  const csv = await exportConsolidatedCsv(token);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="dataset_simcomp.csv"');
  res.send(csv);
}

export async function exportFullDatasetExcel(req, res) {
  const token = req.headers.authorization;
  const limit = req.query.limit || 1000000;
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
    data: stats,
    // El cache TTL es de 60s — indicar al cliente que puede hacer cache también
    cacheControl: "max-age=60",
  });
}

export async function exportStatisticsPdf(req, res) {
  const token = req.headers.authorization;
  const stats = await buildGeneralStatistics(token);

  const buffer = await buildPdfReport("Reporte Estadístico de Infraestructura", {
    tables: [
      {
        title: "Resumen de Registros Globales",
        headers: ["Entidad", "Total Registros"],
        rows: Object.entries(stats.resumen).map(([k, v]) => [
          k.replace("total", "").replace(/([A-Z])/g, ' $1').trim(),
          v
        ])
      },
      {
        title: "Distribución de Usuarios por Rol",
        headers: ["Rol de Usuario", "Cantidad"],
        rows: Object.entries(stats.usuariosPorRol)
      }
    ],
    charts: [
      {
        title: "Estado de Comparendos (Muestra)",
        color: "#10b981", // Emerald-500
        data: Object.entries(stats.comparendosPorEstado).map(([label, value]) => ({ label, value }))
      }
    ]
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="estadisticas_simcomp.pdf"');
  res.send(buffer);
}