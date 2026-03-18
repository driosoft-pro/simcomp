import { Router } from "express";
import { body, param } from "express-validator";
import {
  crearLicenciaController,
  listarLicenciasPorPersonaController,
  obtenerLicenciaPorNumeroController,
} from "../controllers/licencias.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Licencias
 *   description: Gestión de licencias de conducción
 */

/**
 * @swagger
 * /licencias:
 *   post:
 *     summary: Crear licencia de conducción
 *     tags: [Licencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - persona_id
 *               - numero_licencia
 *               - categoria
 *               - fecha_expedicion
 *               - fecha_vencimiento
 *               - estado
 *             properties:
 *               persona_id:
 *                 type: integer
 *                 example: 1
 *               numero_licencia:
 *                 type: string
 *                 example: LIC-1001
 *               categoria:
 *                 type: string
 *                 example: B1
 *               fecha_expedicion:
 *                 type: string
 *                 format: date
 *                 example: 2025-01-01
 *               fecha_vencimiento:
 *                 type: string
 *                 format: date
 *                 example: 2030-01-01
 *               estado:
 *                 type: string
 *                 example: VIGENTE
 *     responses:
 *       201:
 *         description: Licencia creada correctamente
 */
router.post(
  "/licencias",
  [
    body("persona_id").notEmpty().isUUID(),
    body("numero_licencia").notEmpty().isString(),
    body("categoria")
      .notEmpty()
      .isIn(["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"]),
    body("fecha_expedicion").notEmpty().isDate(),
    body("fecha_vencimiento").notEmpty().isDate(),
    body("estado")
      .notEmpty()
      .isIn(["vigente", "suspendida", "vencida", "cancelada"]),
  ],
  crearLicenciaController
);

/**
 * @swagger
 * /licencias/persona/{persona_id}:
 *   get:
 *     summary: Listar licencias por persona
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: persona_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de licencias
 */
router.get(
  "/licencias/persona/:persona_id",
  [param("persona_id").isUUID()],
  listarLicenciasPorPersonaController
);

/**
 * @swagger
 * /licencias/{numero}:
 *   get:
 *     summary: Buscar licencia por número
 *     tags: [Licencias]
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Licencia encontrada
 *       404:
 *         description: Licencia no encontrada
 */
router.get("/licencias/:numero", obtenerLicenciaPorNumeroController);

export default router;