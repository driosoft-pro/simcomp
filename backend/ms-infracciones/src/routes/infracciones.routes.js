import { Router } from "express";

import {
  listInfracciones,
  getInfraccion,
  createInfraccionController,
  updateInfraccionController,
  deleteInfraccionController,
  changeInfraccionStatusController,
} from "../controllers/infracciones.controllers.js";

import {
  createInfraccionValidator,
  updateInfraccionValidator,
  changeVigenciaValidator,
  idParamValidator,
} from "../validators/infracciones.validator.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/infracciones:
 *   get:
 *     summary: Listar todas las infracciones
 *     tags: [Infracciones]
 *     responses:
 *       200:
 *         description: Lista de infracciones obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseList'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", listInfracciones);

/**
 * @swagger
 * /api/infracciones/{id}:
 *   get:
 *     summary: Obtener una infracción por ID
 *     tags: [Infracciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la infracción
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Infracción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Infracción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error consultando infracción
 */
router.get(
  "/:id",
  idParamValidator,
  validateRequest,
  getInfraccion
);

/**
 * @swagger
 * /api/infracciones:
 *   post:
 *     summary: Crear una nueva infracción
 *     tags: [Infracciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInfraccion'
 *     responses:
 *       201:
 *         description: Infracción creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: La infracción ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/",
  createInfraccionValidator,
  validateRequest,
  createInfraccionController
);

/**
 * @swagger
 * /api/infracciones/{id}:
 *   put:
 *     summary: Actualizar una infracción
 *     tags: [Infracciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la infracción
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInfraccion'
 *     responses:
 *       200:
 *         description: Infracción actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Infracción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/:id",
  idParamValidator,
  updateInfraccionValidator,
  validateRequest,
  updateInfraccionController
);

/**
 * @swagger
 * /api/infracciones/{id}:
 *   delete:
 *     summary: Eliminar una infracción (borrado lógico)
 *     tags: [Infracciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la infracción
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Infracción eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseMessage'
 *       404:
 *         description: Infracción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/:id",
  idParamValidator,
  validateRequest,
  deleteInfraccionController
);

/**
 * @swagger
 * /api/infracciones/{id}/vigente:
 *   patch:
 *     summary: Cambiar estado de vigencia de una infracción
 *     tags: [Infracciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la infracción
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeVigencia'
 *     responses:
 *       200:
 *         description: Estado de vigencia actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Infracción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
  "/:id/vigente",
  idParamValidator,
  changeVigenciaValidator,
  validateRequest,
  changeInfraccionStatusController
);

export default router;