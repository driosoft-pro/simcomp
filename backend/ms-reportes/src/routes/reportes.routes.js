import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  health,
  importCsvByModule,
  exportCsvByModule,
  exportExcelByModule,
  exportPdfByModule,
  exportFullDataset,
  exportFullDatasetExcel,
  getStatistics,
  exportStatisticsPdf
} from "../controllers/reportes.controller.js";

const router = Router();

/**
 * @swagger
 * /api/reportes/health:
 *   get:
 *     summary: Verificar el estado del microservicio
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio disponible
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get("/health", asyncHandler(health));

/**
 * @swagger
 * /api/reportes/import/{modulo}:
 *   post:
 *     summary: Importar un archivo CSV por modulo
 *     tags: [Importacion]
 *     parameters:
 *       - $ref: '#/components/parameters/ModuloParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Importacion completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Importacion completada para personas
 *                 data:
 *                   $ref: '#/components/schemas/ImportResult'
 *       400:
 *         description: Archivo o modulo invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/import/:modulo", upload.single("file"), asyncHandler(importCsvByModule));

/**
 * @swagger
 * /api/reportes/export/all/zip:
 *   get:
 *     summary: Exportar el dataset completo del sistema en ZIP
 *     tags: [Exportacion]
 *     responses:
 *       200:
 *         description: Archivo ZIP generado correctamente
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/export/all/zip", asyncHandler(exportFullDataset));

/**
 * @swagger
 * /api/reportes/export/all/excel:
 *   get:
 *     summary: Exportar el dataset completo del sistema en Excel
 *     tags: [Exportacion]
 *     responses:
 *       200:
 *         description: Archivo Excel generado correctamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/export/all/excel", asyncHandler(exportFullDatasetExcel));

/**
 * @swagger
 * /api/reportes/export/{modulo}/csv:
 *   get:
 *     summary: Exportar un modulo en formato CSV
 *     tags: [Exportacion]
 *     parameters:
 *       - $ref: '#/components/parameters/ModuloParam'
 *     responses:
 *       200:
 *         description: Archivo CSV generado correctamente
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get("/export/:modulo/csv", asyncHandler(exportCsvByModule));

/**
 * @swagger
 * /api/reportes/export/{modulo}/excel:
 *   get:
 *     summary: Exportar un modulo en formato Excel
 *     tags: [Exportacion]
 *     parameters:
 *       - $ref: '#/components/parameters/ModuloParam'
 *     responses:
 *       200:
 *         description: Archivo Excel generado correctamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/export/:modulo/excel", asyncHandler(exportExcelByModule));

/**
 * @swagger
 * /api/reportes/export/{modulo}/pdf:
 *   get:
 *     summary: Exportar un modulo en formato PDF
 *     tags: [Exportacion]
 *     parameters:
 *       - $ref: '#/components/parameters/ModuloParam'
 *     responses:
 *       200:
 *         description: Archivo PDF generado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/export/:modulo/pdf", asyncHandler(exportPdfByModule));

// Note: /export/all/zip and /export/all/excel are registered ABOVE the parameterized routes

/**
 * @swagger
 * /api/reportes/estadisticas:
 *   get:
 *     summary: Obtener estadisticas generales del sistema
 *     tags: [Estadisticas]
 *     responses:
 *       200:
 *         description: Estadisticas calculadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StatisticsResponse'
 */
router.get("/estadisticas", asyncHandler(getStatistics));

/**
 * @swagger
 * /api/reportes/estadisticas/pdf:
 *   get:
 *     summary: Exportar las estadisticas generales en PDF
 *     tags: [Estadisticas]
 *     responses:
 *       200:
 *         description: PDF de estadisticas generado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/estadisticas/pdf", asyncHandler(exportStatisticsPdf));

export default router;
