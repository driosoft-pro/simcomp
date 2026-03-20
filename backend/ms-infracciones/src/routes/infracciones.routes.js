import { Router } from "express";

import {
  listInfracciones,
  getInfraccion,
  createInfraccionController,
  updateInfraccionController,
  deleteInfraccionController,
  activateInfraccionController,
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
 * /infracciones:
 *   get:
 *     summary: Listar todas las infracciones
 *     tags: [Infracciones]
 *     security:
 *       - bearerAuth: []
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
router.get("/infracciones", listInfracciones);

/**
 * @swagger
 * /infracciones/{id}:
 *   get:
 *     summary: Obtener una infracción por ID
 *     tags: [Infracciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la infracción
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
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
  "/infracciones/:id",
  idParamValidator,
  validateRequest,
  getInfraccion
);

/**
 * @swagger
 * /infracciones:
 *   post:
 *     summary: Crear una nueva infracción
 *     tags: [Infracciones]
 *     security:
 *       - bearerAuth: []
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
  "/infracciones",
  createInfraccionValidator,
  validateRequest,
  createInfraccionController
);

/**
 * @swagger
 * /infracciones/{id}:
 *   put:
 *     summary: Actualizar una infracción
 *     tags: [Infracciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la infracción
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
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
  "/infracciones/:id",
  idParamValidator,
  updateInfraccionValidator,
  validateRequest,
  updateInfraccionController
);

/**
 * @swagger
 * /infracciones/{id}:
 *   delete:
 *     summary: Eliminar una infracción (borrado lógico)
 *     tags: [Infracciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la infracción
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
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
  "/infracciones/:id",
  idParamValidator,
  validateRequest,
  deleteInfraccionController
);

/**
 * @swagger
 * /infracciones/{id}/activar:
 *   patch:
 *     summary: Activar una infracción (borrado lógico inverso)
 *     tags: [Infracciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la infracción
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
 *     responses:
 *       200:
 *         description: Infracción activada correctamente
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
  "/infracciones/:id/activar",
  idParamValidator,
  validateRequest,
  activateInfraccionController
);

/**
 * @swagger
 * /infracciones/{id}/vigente:
 *   patch:
 *     summary: Cambiar estado de vigencia de una infracción
 *     tags: [Infracciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la infracción
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
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
  "/infracciones/:id/vigente",
  idParamValidator,
  changeVigenciaValidator,
  validateRequest,
  changeInfraccionStatusController
);

export default router;