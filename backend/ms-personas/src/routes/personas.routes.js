import { Router } from "express";
import { body, param } from "express-validator";
import {
  crearPersonaController,
  listarPersonasController,
  obtenerPersonaPorDocumentoController,
  obtenerPersonaPorIdController,
  validarExistenciaPersonaController,
} from "../controllers/personas.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Personas
 *   description: Gestión de personas
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check del servicio
 *     tags: [Personas]
 *     responses:
 *       200:
 *         description: Servicio activo
 */
router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: process.env.SERVICE_NAME || "ms-personas",
    status: "running",
  });
});

/**
 * @swagger
 * /personas:
 *   post:
 *     summary: Crear una persona
 *     tags: [Personas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo_documento
 *               - numero_documento
 *               - primer_nombre
 *               - primer_apellido
 *             properties:
 *               tipo_documento:
 *                 type: string
 *                 example: CC
 *               numero_documento:
 *                 type: string
 *                 example: "1234567890"
 *               primer_nombre:
 *                 type: string
 *                 example: Juan
 *               segundo_nombre:
 *                 type: string
 *                 example: Carlos
 *               primer_apellido:
 *                 type: string
 *                 example: Pérez
 *               segundo_apellido:
 *                 type: string
 *                 example: Gómez
 *               direccion:
 *                 type: string
 *                 example: Calle 1 # 2-3
 *               telefono:
 *                 type: string
 *                 example: "3001234567"
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *     responses:
 *       201:
 *         description: Persona creada correctamente
 */
router.post(
  "/personas",
  [
    body("tipo_documento")
      .notEmpty()
      .isIn(["CC", "CE", "PAS", "TI"]),
    body("numero_documento").notEmpty().isString(),
    body("primer_nombre").notEmpty().isString(),
    body("primer_apellido").notEmpty().isString(),
    body("email").optional().isEmail(),
  ],
  crearPersonaController
);

/**
 * @swagger
 * /personas:
 *   get:
 *     summary: Listar personas
 *     tags: [Personas]
 *     responses:
 *       200:
 *         description: Lista de personas
 */
router.get("/personas", listarPersonasController);

/**
 * @swagger
 * /personas/{persona_id}:
 *   get:
 *     summary: Buscar persona por ID
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: persona_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       404:
 *         description: Persona no encontrada
 */
router.get(
  "/personas/:persona_id",
  [param("persona_id").isInt()],
  obtenerPersonaPorIdController
);

/**
 * @swagger
 * /personas/documento/{numero}:
 *   get:
 *     summary: Buscar persona por documento
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       404:
 *         description: Persona no encontrada
 */
router.get("/personas/documento/:numero", obtenerPersonaPorDocumentoController);

/**
 * @swagger
 * /personas/existe/{numero}:
 *   get:
 *     summary: Validar existencia de persona por documento
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado de validación
 */
router.get("/personas/existe/:numero", validarExistenciaPersonaController);

export default router;