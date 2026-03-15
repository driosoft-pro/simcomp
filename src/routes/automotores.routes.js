import express from "express";

import {
  createAutomotorController,
  getAutomotores,
  getAutomotorByIdController,
  getAutomotorByPlacaController,
  updateAutomotorController,
  deleteAutomotorController,
  changeAutomotorStatusController
} from "../controllers/automotores.controllers.js";

const router = express.Router();

/**
 * @swagger
 * /api/automotores:
 *   post:
 *     summary: Crear un automotor
 *     tags: [Automotores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - placa
 *               - tipo
 *               - marca
 *               - modelo
 *               - anio
 *               - color
 *               - cilindraje
 *               - propietario_id
 *             properties:
 *               placa:
 *                 type: string
 *                 example: ABC123
 *               tipo:
 *                 type: string
 *                 enum: [MOTO, CARRO, BUS, BUSETA, CAMION, TRACTOMULA, CUATRIMOTO]
 *                 example: CARRO
 *               marca:
 *                 type: string
 *                 example: Toyota
 *               modelo:
 *                 type: string
 *                 example: Corolla
 *               anio:
 *                 type: integer
 *                 example: 2022
 *               color:
 *                 type: string
 *                 example: Rojo
 *               cilindraje:
 *                 type: integer
 *                 example: 1800
 *               estado:
 *                 type: string
 *                 enum: [LEGAL, REPORTADO_ROBO, RECUPERADO, EMBARGADO]
 *                 example: LEGAL
 *               propietario_id:
 *                 type: string
 *                 format: uuid
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
 * /api/automotores:
 *   get:
 *     summary: Listar todos los automotores
 *     tags: [Automotores]
 *     responses:
 *       200:
 *         description: Lista de automotores
 *       500:
 *         description: Error del servidor
 */
router.get("/", getAutomotores);

/**
 * @swagger
 * /api/automotores/placa/{placa}:
 *   get:
 *     summary: Obtener automotor por placa
 *     tags: [Automotores]
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
 * /api/automotores/{id}:
 *   get:
 *     summary: Obtener automotor por ID
 *     tags: [Automotores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del automotor
 *     responses:
 *       200:
 *         description: Automotor encontrado
 *       404:
 *         description: Automotor no encontrado
 */
router.get("/:id", getAutomotorByIdController);

/**
 * @swagger
 * /api/automotores/{id}:
 *   put:
 *     summary: Actualizar un automotor
 *     tags: [Automotores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               placa:
 *                 type: string
 *               tipo:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               anio:
 *                 type: integer
 *               color:
 *                 type: string
 *               cilindraje:
 *                 type: integer
 *               estado:
 *                 type: string
 *               propietario_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Automotor actualizado
 *       404:
 *         description: Automotor no encontrado
 */
router.put("/:id", updateAutomotorController);

/**
 * @swagger
 * /api/automotores/{id}:
 *   delete:
 *     summary: Eliminar un automotor (soft delete)
 *     tags: [Automotores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Automotor eliminado correctamente
 *       404:
 *         description: Automotor no encontrado
 */
router.delete("/:id", deleteAutomotorController);

/**
 * @swagger
 * /api/automotores/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de un automotor
 *     tags: [Automotores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 enum: [LEGAL, REPORTADO_ROBO, RECUPERADO, EMBARGADO]
 *                 example: REPORTADO_ROBO
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Automotor no encontrado
 */
router.patch("/:id/estado", changeAutomotorStatusController);

export default router;