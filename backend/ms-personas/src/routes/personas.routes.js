import { Router } from "express";
import { body, param } from "express-validator";
import {
  crearPersonaController,
  listarPersonasController,
  obtenerPersonaPorDocumentoController,
  obtenerPersonaPorIdController,
  validarExistenciaPersonaController,
  obtenerPersonaPorEmailController,
  actualizarPersonaController,
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
 *               - nombres
 *               - apellidos
 *               - fecha_nacimiento
 *               - genero
 *             properties:
 *               tipo_documento:
 *                 type: string
 *                 example: CC
 *               numero_documento:
 *                 type: string
 *                 example: "1234567890"
 *               nombres:
 *                 type: string
 *                 example: Juan Carlos
 *               apellidos:
 *                 type: string
 *                 example: Perez Gomez
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               genero:
 *                 type: string
 *                 enum: [M, F, O]
 *                 example: M
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
      .isIn(["CC", "CE", "TI", "PASAPORTE"]),
    body("numero_documento").notEmpty().isString(),
    body("nombres").notEmpty().isString(),
    body("apellidos").notEmpty().isString(),
    body("fecha_nacimiento").notEmpty().isISO8601(),
    body("genero").notEmpty().isIn(["M", "F", "O"]),
    body("direccion").notEmpty().isString(),
    body("telefono").notEmpty().isString(),
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
  [param("persona_id").isUUID()],
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

/**
 * @swagger
 * /personas/{persona_id}:
 *   put:
 *     summary: Actualizar una persona
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: persona_id
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
 *             properties:
 *               tipo_documento:
 *                 type: string
 *                 example: CC
 *               numero_documento:
 *                 type: string
 *                 example: "1234567890"
 *               nombres:
 *                 type: string
 *                 example: Juan Carlos
 *               apellidos:
 *                 type: string
 *                 example: Perez Gomez
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               genero:
 *                 type: string
 *                 enum: [M, F, O]
 *                 example: M
 *               direccion:
 *                 type: string
 *                 example: Calle 1 # 2-3
 *               telefono:
 *                 type: string
 *                 example: "3001234567"
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo]
 *                 example: activo
 *     responses:
 *       200:
 *         description: Persona actualizada correctamente
 *       404:
 *         description: Persona no encontrada
 */
router.put(
  "/personas/:persona_id",
  [
    param("persona_id").isUUID(),
    body("tipo_documento")
      .optional()
      .isIn(["CC", "CE", "TI", "PASAPORTE"]),
    body("numero_documento").optional().isString(),
    body("nombres").optional().isString(),
    body("apellidos").optional().isString(),
    body("fecha_nacimiento").optional().isISO8601(),
    body("genero").optional().isIn(["M", "F", "O"]),
    body("direccion").optional().isString(),
    body("telefono").optional().isString(),
    body("email").optional().isEmail(),
    body("estado").optional().isIn(["activo", "inactivo"]),
  ],
  actualizarPersonaController
);

export default router;
/**
 * @swagger
 * /personas/email/{email}:
 *   get:
 *     summary: Buscar persona por email
 *     tags: [Personas]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       404:
 *         description: Persona no encontrada
 */
router.get("/personas/email/:email", obtenerPersonaPorEmailController);
