import express from "express";
import { param } from "express-validator";
import { validateRequest } from "../middlewares/validation.middleware.js";

import {
  createAutomotorController,
  getAutomotores,
  getAutomotorByIdController,
  getAutomotorByPlacaController,
  getAutomotoresByPropietarioController,
  updateAutomotorController,
  deleteAutomotorController,
  changeAutomotorStatusController,
  inmovilizarPorPlacaController,
  syncPropietarioController
} from "../controllers/automotores.controllers.js";

const router = express.Router();

/**
 * @swagger
 * /automotores:
 *   post:
 *     summary: Crear un automotor
 *     tags: [Automotores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAutomotor'
 *     responses:
 *       201:
 *         description: Automotor creado correctamente
 *       409:
 *         description: El automotor ya existe
 *       400:
 *         description: Datos inválidos
 */
router.post("/", createAutomotorController);

/**
 * @swagger
 * /automotores:
 *   get:
 *     summary: Listar todos los automotores
 *     tags: [Automotores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de automotores
 *       500:
 *         description: Error del servidor
 */
router.get("/", getAutomotores);

/**
 * @swagger
 * /Automotores/placa/{placa}:
 *   get:
 *     summary: Obtener automotor por placa
 *     tags: [Automotores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placa
 *         required: true
 *         schema:
 *           type: string
 *         description: Placa del automotor
 *     responses:
 *       200:
 *         description: Automotor encontrado
 *       404:
 *         description: Automotor no encontrado
 */
router.get("/placa/:placa", getAutomotorByPlacaController);

/**
 * @swagger
 * /automotores/propietario/{documento}:
 *   get:
 *     summary: Obtener automotores de un propietario por número de documento
 *     tags: [Automotores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del propietario
 *     responses:
 *       200:
 *         description: Lista de automotores del propietario
 *       500:
 *         description: Error del servidor
 */
router.get("/propietario/:documento", getAutomotoresByPropietarioController);

/**
 * @swagger
 * /automotores/{id}:
 *   get:
 *     summary: Obtener automotor por ID
 *     tags: [Automotores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
 *         description: ID del automotor
 *     responses:
 *       200:
 *         description: Automotor encontrado
 *       404:
 *         description: Automotor no encontrado
 */
router.get(
  "/:id",
  [param("id").isUUID().withMessage("El id debe ser un UUID válido")],
  validateRequest,
  getAutomotorByIdController
);

/**
 * @swagger
 * /automotores/{id}:
 *   put:
 *     summary: Actualizar un automotor
 *     tags: [Automotores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAutomotor'
 *     responses:
 *       200:
 *         description: Automotor actualizado
 *       404:
 *         description: Automotor no encontrado
 */
router.put(
  "/:id",
  [param("id").isUUID().withMessage("El id debe ser un UUID válido")],
  validateRequest,
  updateAutomotorController
);

/**
 * @swagger
 * /automotores/{id}:
 *   delete:
 *     summary: Eliminar un automotor (soft delete)
 *     tags: [Automotores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
     responses:
 *       200:
 *         description: Automotor eliminado correctamente
 *       404:
 *         description: Automotor no encontrado
 */
router.delete(
  "/:id",
  [param("id").isUUID().withMessage("El id debe ser un UUID válido")],
  validateRequest,
  deleteAutomotorController
);

/**
 * @swagger
 * /Automotores/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de un automotor
 *     tags: [Automotores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, inmovilizado]
 *                 example: inactivo
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Automotor no encontrado
 */
router.patch(
  "/:id/estado",
  [param("id").isUUID().withMessage("El id debe ser un UUID válido")],
  validateRequest,
  changeAutomotorStatusController
);

/**
 * @swagger
 * /automotores/placa/{placa}/inmovilizar:
 *   patch:
 *     summary: Inmovilizar un automotor por placa
 *     tags: [Automotores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placa
 *         required: true
 *         schema:
 *           type: string
 *         description: Placa del automotor
 *     responses:
 *       200:
 *         description: Vehículo inmovilizado correctamente
 *       404:
 *         description: Automotor no encontrado
 */
router.patch("/placa/:placa/inmovilizar", inmovilizarPorPlacaController);

/**
 * @swagger
 * /automotores/internal/sync-propietario:
 *   patch:
 *     summary: Sincronizar datos del propietario masivamente (Uso interno)
 *     tags: [Automotores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldDocumento:
 *                 type: string
 *               newDocumento:
 *                 type: string
 *               newNombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sincronización exitosa
 */
router.patch("/internal/sync-propietario", syncPropietarioController);

export default router;