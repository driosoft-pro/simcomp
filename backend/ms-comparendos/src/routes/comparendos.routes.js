import { Router } from "express";
import { body } from "express-validator";
import {
  healthCheck,
  crearComparendoController,
  listarComparendosController,
  obtenerComparendoPorIdController,
  obtenerComparendoPorNumeroController,
  obtenerHistorialComparendoController,
  pagarComparendoController,
  anularComparendoController,
  revertirAPendienteController,
  obtenerComparendosPorPersonaController,
  obtenerComparendosPorAutomotorController,
} from "../controllers/comparendos.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Comparendos
 *     description: Gestión de comparendos
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del microservicio
 *     tags: [Comparendos]
 *     responses:
 *       200:
 *         description: Servicio activo
 */
router.get("/health", healthCheck);

/**
 * @swagger
 * /comparendos:
 *   post:
 *     summary: Crear un comparendo
 *     tags: [Comparendos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero_comparendo
 *               - fecha_hora
 *               - automotor_id
 *               - persona_id
 *               - infraccion_id
 *               - direccion_exacta
 *             properties:
 *               numero_comparendo:
 *                 type: string
 *               fecha_hora:
 *                 type: string
 *                 format: date-time
 *               automotor_id:
 *                 type: string
 *                 format: uuid
 *               persona_id:
 *                 type: string
 *                 format: uuid
 *               infraccion_id:
 *                 type: string
 *                 format: uuid
 *               direccion_exacta:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comparendo creado correctamente
 */
router.post(
  "/comparendos",
  [
    body("numero_comparendo")
      .notEmpty()
      .withMessage("numero_comparendo es requerido"),

    body("fecha_hora")
      .notEmpty()
      .withMessage("fecha_hora es requerida"),

    body("automotor_id")
      .isUUID()
      .withMessage("automotor_id debe ser UUID válido"),

    body("persona_id")
      .isUUID()
      .withMessage("persona_id debe ser UUID válido"),

    body("infraccion_id")
      .isUUID()
      .withMessage("infraccion_id debe ser UUID válido"),

    body("direccion_exacta")
      .notEmpty()
      .withMessage("direccion_exacta es requerida"),
  ],
  crearComparendoController
);

/**
 * @swagger
 * /comparendos:
 *   get:
 *     summary: Listar todos los comparendos
 *     tags: [Comparendos]
 *     responses:
 *       200:
 *         description: Lista de comparendos
 */
router.get("/comparendos", listarComparendosController);

/**
 * @swagger
 * /comparendos/{id}:
 *   get:
 *     summary: Obtener comparendo por ID
 *     tags: [Comparendos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comparendo encontrado
 *       404:
 *         description: Comparendo no encontrado
 */
router.get("/comparendos/:id", obtenerComparendoPorIdController);

/**
 * @swagger
 * /comparendos/numero/{numero}:
 *   get:
 *     summary: Obtener comparendo por número
 *     tags: [Comparendos]
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comparendo encontrado
 */
router.get("/comparendos/numero/:numero", obtenerComparendoPorNumeroController);

/**
 * @swagger
 * /comparendos/persona/{personaId}:
 *   get:
 *     summary: Obtener comparendos por ID de persona
 *     tags: [Comparendos]
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de comparendos de la persona
 */
router.get("/comparendos/persona/:personaId", obtenerComparendosPorPersonaController);

/**
 * @swagger
 * /comparendos/automotor/{automotorId}:
 *   get:
 *     summary: Obtener comparendos por ID de automotor
 *     tags: [Comparendos]
 *     parameters:
 *       - in: path
 *         name: automotorId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de comparendos del automotor
 */
router.get("/comparendos/automotor/:automotorId", obtenerComparendosPorAutomotorController);

/**
 * @swagger
 * /comparendos/{id}/historial:
 *   get:
 *     summary: Obtener historial de estados de un comparendo
 *     tags: [Comparendos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Historial del comparendo
 */
router.get("/comparendos/:id/historial", obtenerHistorialComparendoController);

/**
 * @swagger
 * /comparendos/{id}/pagar:
 *   patch:
 *     summary: Marcar comparendo como pagado
 *     tags: [Comparendos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comparendo pagado
 */
router.patch("/comparendos/:id/pagar", pagarComparendoController);

/**
 * @swagger
 * /comparendos/{id}/anular:
 *   patch:
 *     summary: Anular un comparendo
 *     tags: [Comparendos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comparendo anulado
 */
router.patch("/comparendos/:id/anular", anularComparendoController);

/**
 * @swagger
 * /comparendos/{id}/revertir:
 *   patch:
 *     summary: Revertir comparendo a estado pendiente
 *     tags: [Comparendos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comparendo revertido
 */
router.patch("/comparendos/:id/revertir", revertirAPendienteController);

export default router;