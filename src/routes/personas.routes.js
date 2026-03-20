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
 *     security:
 *       - bearerAuth: []
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
 * /Personas:
 *   post:
 *     summary: Crear una persona
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Persona'
 *     responses:
 *     responses:
 *       201:
 *         description: Persona creada correctamente
 */
router.post(
  "/",
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
 * /Personas:
 *   get:
 *     summary: Listar personas
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de personas
 */
router.get("/", listarPersonasController);

/**
 * @swagger
 * /Personas/{id}:
 *   get:
 *     summary: Buscar persona por ID
 *     tags: [Personas]
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
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       404:
 *         description: Persona no encontrada
 */
router.get(
  "/:persona_id",
  [param("persona_id").isUUID()],
  obtenerPersonaPorIdController
);

/**
 * @swagger
 * /Personas/documento/{numero}:
 *   get:
 *     summary: Buscar persona por documento
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
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
router.get("/documento/:numero", obtenerPersonaPorDocumentoController);

/**
 * @swagger
 * /Personas/existe/{numero}:
 *   get:
 *     summary: Validar existencia de persona por documento
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
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
router.get("/existe/:numero", validarExistenciaPersonaController);

/**
 * @swagger
 * /Personas/{id}:
 *   put:
 *     summary: Actualizar una persona
 *     tags: [Personas]
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
 *             $ref: '#/components/schemas/Persona'
 *     responses:
 *       200:
 *         description: Persona actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Persona'
 *       404:
 *         description: Persona no encontrada
 */
router.put(
  "/:persona_id",
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
 * /Personas/email/{email}:
 *   get:
 *     summary: Buscar persona por email
 *     tags: [Personas]
 *     security:
 *       - bearerAuth: []
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
router.get("/email/:email", obtenerPersonaPorEmailController);
