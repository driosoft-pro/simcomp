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
 *               - vin
 *               - numero_motor
 *               - numero_chasis
 *               - marca
 *               - linea
 *               - modelo
 *               - color
 *               - clase
 *               - propietario_documento
 *               - propietario_nombre
 *             properties:
 *               placa:
 *                 type: string
 *                 example: ABC123
 *               vin:
 *                 type: string
 *                 example: 1HB5H1234567890
 *               numero_motor:
 *                 type: string
 *                 example: MOT-123456
 *               numero_chasis:
 *                 type: string
 *                 example: CHA-123456
 *               marca:
 *                 type: string
 *                 example: Toyota
 *               linea:
 *                 type: string
 *                 example: Corolla
 *               modelo:
 *                 type: integer
 *                 example: 2022
 *               color:
 *                 type: string
 *                 example: Rojo
 *               clase:
 *                 type: string
 *                 enum: [AUTOMOVIL, MOTOCICLETA, CAMIONETA, CAMPERO, BUS, CAMION]
 *                 example: AUTOMOVIL
 *               servicio:
 *                 type: string
 *                 enum: [PARTICULAR, PUBLICO, OFICIAL]
 *                 example: PARTICULAR
 *               propietario_documento:
 *                 type: string
 *                 example: "12345678"
 *               propietario_nombre:
 *                 type: string
 *                 example: Juan Perez
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, inmovilizado]
 *                 example: activo
 *     responses:
 *       201:
 *         description: Automotor creado correctamente
 *       409:
 *         description: El automotor ya existe
 *       400:
 *         description: Datos inválidos
 */
router.post("/automotores", createAutomotorController);

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
router.get("/automotores", getAutomotores);

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
router.get("/automotores/placa/:placa", getAutomotorByPlacaController);

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
router.get("/automotores/:id", getAutomotorByIdController);

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
 *               vin:
 *                 type: string
 *               numero_motor:
 *                 type: string
 *               numero_chasis:
 *                 type: string
 *               marca:
 *                 type: string
 *               linea:
 *                 type: string
 *               modelo:
 *                 type: integer
 *               color:
 *                 type: string
 *               clase:
 *                 type: string
 *                 enum: [AUTOMOVIL, MOTOCICLETA, CAMIONETA, CAMPERO, BUS, CAMION]
 *               servicio:
 *                 type: string
 *                 enum: [PARTICULAR, PUBLICO, OFICIAL]
 *               propietario_documento:
 *                 type: string
 *               propietario_nombre:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, inmovilizado]
 *     responses:
 *       200:
 *         description: Automotor actualizado
 *       404:
 *         description: Automotor no encontrado
 */
router.put("/automotores/:id", updateAutomotorController);

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
router.delete("/automotores/:id", deleteAutomotorController);

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
 *                 enum: [activo, inactivo, inmovilizado]
 *                 example: inactivo
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Automotor no encontrado
 */
router.patch("/automotores/:id/estado", changeAutomotorStatusController);

export default router;