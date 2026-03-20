import { Router } from "express";
import { body, param } from "express-validator";
import {
  healthCheck,
  crearComparendoController,
  listarComparendosController,
  obtenerComparendoPorIdController,
  obtenerComparendoPorNumeroController,
  obtenerComparendosPorPlacaController,
  obtenerHistorialComparendoController,
  pagarComparendoController,
  anularComparendoController,
  revertirAPendienteController,
  actualizarComparendoController,
  obtenerSiguienteNumeroController,
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
 * components:
 *   schemas:
 *     Comparendo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
 *           example: 3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73001
 *         numero_comparendo:
 *           type: string
 *           example: CMP-2026-000001
 *         ciudadano_documento:
 *           type: string
 *           example: "1010001001"
 *         ciudadano_nombre:
 *           type: string
 *           example: Juan Perez
 *         agente_documento:
 *           type: string
 *           example: "1098700001"
 *         agente_nombre:
 *           type: string
 *           example: Carlos Gomez
 *         placa_vehiculo:
 *           type: string
 *           example: KSP214
 *         infraccion_codigo:
 *           type: string
 *           example: C03
 *         infraccion_descripcion:
 *           type: string
 *           example: Estacionar en sitio prohibido.
 *         valor_multa:
 *           type: number
 *           format: float
 *           example: 520000
 *         fecha_comparendo:
 *           type: string
 *           format: date-time
 *           example: 2026-01-10T08:15:00.000Z
 *         lugar:
 *           type: string
 *           example: Av. 3N con Calle 44
 *         ciudad:
 *           type: string
 *           example: Cali
 *         observaciones:
 *           type: string
 *           nullable: true
 *           example: Vehículo estacionado en zona de restricción.
 *         estado:
 *           type: string
 *           enum: [PENDIENTE, PAGADO, ANULADO]
 *           example: PENDIENTE
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     HistorialComparendo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
 *           example: e761c37e-0b3d-40e8-9d5c-9e4d8a911001
 *         comparendo_id:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
 *           example: 3e7f2d93-9c20-4a4d-b2e5-4ff0f1d73001
 *         estado_anterior:
 *           type: string
 *           nullable: true
 *           enum: [PENDIENTE, PAGADO, ANULADO]
 *           example: PENDIENTE
 *         estado_nuevo:
 *           type: string
 *           enum: [PENDIENTE, PAGADO, ANULADO]
 *           example: PAGADO
 *         observacion:
 *           type: string
 *           nullable: true
 *           example: Pago registrado en ventanilla.
 *         fecha_evento:
 *           type: string
 *           format: date-time
 *           example: 2026-01-15T09:10:00.000Z
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *
 *     CrearComparendoInput:
 *       type: object
 *       required:
 *         - numero_comparendo
 *         - ciudadano_documento
 *         - ciudadano_nombre
 *         - agente_documento
 *         - agente_nombre
 *         - placa_vehiculo
 *         - fecha_comparendo
 *         - lugar
 *         - ciudad
 *       properties:
 *         numero_comparendo:
 *           type: string
 *           example: CMP-2026-000009
 *         ciudadano_documento:
 *           type: string
 *           example: "1010001009"
 *         ciudadano_nombre:
 *           type: string
 *           example: Luis Martinez
 *         agente_documento:
 *           type: string
 *           example: "1098700009"
 *         agente_nombre:
 *           type: string
 *           example: Diana Rojas
 *         placa_vehiculo:
 *           type: string
 *           example: ABC123
 *         infraccion_codigo:
 *           type: string
 *           example: C11
 *         infraccion_descripcion:
 *           type: string
 *           example: Adelantar en zona prohibida.
 *         valor_multa:
 *           type: number
 *           format: float
 *           example: 980000
 *         infracciones:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               codigo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               valor_multa:
 *                 type: number
 *         fecha_comparendo:
 *           type: string
 *           format: date-time
 *           example: 2026-02-01T14:30:00.000Z
 *         lugar:
 *           type: string
 *           example: Calle 70 con Carrera 1
 *         ciudad:
 *           type: string
 *           example: Cali
 *         observaciones:
 *           type: string
 *           nullable: true
 *           example: Maniobra peligrosa evidenciada por agente.
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del microservicio
 *     tags: [Comparendos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servicio activo
 */
router.get("/health", healthCheck);

/**
 * @swagger
 * /comparendos:
 *   get:
 *     summary: Listar todos los comparendos
 *     tags: [Comparendos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comparendos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comparendo'
 */
/**
 * @swagger
 * /api/comparendos/siguiente-numero:
 *   get:
 *     summary: Obtener el siguiente número de comparendo disponible (global)
 *     tags: [Comparendos]
 *     responses:
 *       200:
 *         description: El siguiente número disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 */
router.get("/comparendos/siguiente-numero", obtenerSiguienteNumeroController);

router.get("/comparendos", listarComparendosController);

/**
 * @swagger
 * /comparendos/numero/{numero}:
 *   get:
 *     summary: Obtener comparendo por número
 *     tags: [Comparendos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *         example: CMP-2026-000001
 *     responses:
 *       200:
 *         description: Comparendo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Comparendo'
 *       404:
 *         description: Comparendo no encontrado
 */
router.get("/comparendos/numero/:numero", obtenerComparendoPorNumeroController);

/**
 * @swagger
 * /comparendos/placa/{placa}:
 *   get:
 *     summary: Obtener comparendos por placa de vehículo
 *     tags: [Comparendos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placa
 *         required: true
 *         schema:
 *           type: string
 *         example: ABC123
 *     responses:
 *       200:
 *         description: Lista de comparendos para la placa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comparendo'
 *       500:
 *         description: Error del servidor
 */
router.get("/comparendos/placa/:placa", obtenerComparendosPorPlacaController);

/**
 * @swagger
 * /comparendos/{id}:
 *   get:
 *     summary: Obtener comparendo por ID
 *     tags: [Comparendos]
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
 *         description: Comparendo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Comparendo'
 *       404:
 *         description: Comparendo no encontrado
 */
router.get(
  "/comparendos/:id",
  [param("id").isUUID().withMessage("El id debe ser un UUID válido")],
  obtenerComparendoPorIdController
);

/**
 * @swagger
 * /comparendos/{id}/historial:
 *   get:
 *     summary: Obtener historial de un comparendo
 *     tags: [Comparendos]
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
 *         description: Historial del comparendo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HistorialComparendo'
 *       404:
 *         description: Comparendo no encontrado
 */
router.get(
  "/comparendos/:id/historial",
  [param("id").isUUID().withMessage("El id debe ser un UUID válido")],
  obtenerHistorialComparendoController
);

/**
 * @swagger
 * /comparendos:
 *   post:
 *     summary: Crear un comparendo
 *     tags: [Comparendos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearComparendoInput'
 *     responses:
 *       201:
 *         description: Comparendo creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comparendo creado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Comparendo'
 *       400:
 *         description: Error de validación
 */
router.post(
  "/comparendos",
  [
    body("numero_comparendo")
      .notEmpty()
      .withMessage("numero_comparendo es requerido"),

    body("ciudadano_documento")
      .notEmpty()
      .withMessage("ciudadano_documento es requerido"),

    body("ciudadano_nombre")
      .notEmpty()
      .withMessage("ciudadano_nombre es requerido"),

    body("agente_documento")
      .notEmpty()
      .withMessage("agente_documento es requerido"),

    body("agente_nombre")
      .notEmpty()
      .withMessage("agente_nombre es requerido"),

    body("placa_vehiculo")
      .notEmpty()
      .withMessage("placa_vehiculo es requerida"),

    body("infraccion_codigo")
      .if(body("infracciones").not().exists())
      .notEmpty()
      .withMessage("infraccion_codigo es requerido si no se envía el arreglo de infracciones"),

    body("infraccion_descripcion")
      .if(body("infracciones").not().exists())
      .notEmpty()
      .withMessage("infraccion_descripcion es requerida si no se envía el arreglo de infracciones"),

    body("valor_multa")
      .if(body("infracciones").not().exists())
      .isNumeric()
      .withMessage("valor_multa debe ser numérico"),

    body("infracciones")
      .optional()
      .isArray()
      .withMessage("infracciones debe ser un arreglo"),

    body("fecha_comparendo")
      .isISO8601()
      .withMessage("fecha_comparendo debe ser una fecha válida"),

    body("lugar")
      .notEmpty()
      .withMessage("lugar es requerido"),

    body("ciudad")
      .notEmpty()
      .withMessage("ciudad es requerida"),

    body("observaciones")
      .optional()
      .isString()
      .withMessage("observaciones debe ser texto"),
  ],
  crearComparendoController
);

/**
 * @swagger
 * /comparendos/{id}/pagar:
 *   patch:
 *     summary: Marcar comparendo como pagado
 *     tags: [Comparendos]
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
 *         description: Comparendo pagado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comparendo pagado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Comparendo'
 *       400:
 *         description: No se pudo cambiar el estado
 */
router.patch(
  "/comparendos/:id/pagar",
  [param("id").isUUID().withMessage("El id debe ser un UUID válido")],
  pagarComparendoController
);

/**
 * @swagger
 * /comparendos/{id}/anular:
 *   patch:
 *     summary: Anular un comparendo
 *     tags: [Comparendos]
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
 *         description: Comparendo anulado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comparendo anulado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Comparendo'
 *       400:
 *         description: No se pudo cambiar el estado
 */
router.patch(
  "/comparendos/:id/anular",
  [param("id").isUUID().withMessage("El id debe ser un UUID válido")],
  anularComparendoController
);

/**
 * @swagger
 * /comparendos/{id}/revertir:
 *   patch:
 *     summary: Revertir comparendo a estado pendiente
 *     tags: [Comparendos]
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
 *         description: Comparendo regresado a estado pendiente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comparendo regresado a estado PENDIENTE
 *                 data:
 *                   $ref: '#/components/schemas/Comparendo'
 *       400:
 *         description: No se pudo cambiar el estado
 */
router.patch(
  "/comparendos/:id/revertir",
  [param("id").isUUID().withMessage("El id debe ser un UUID válido")],
  revertirAPendienteController
);

/**
 * @swagger
 * /comparendos/{id}:
 *   put:
 *     summary: Editar un comparendo (solo admin/agente, estado PENDIENTE)
 *     tags: [Comparendos]
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
 *             properties:
 *               placa_vehiculo:
 *                 type: string
 *                 example: ABC123
 *               infraccion_codigo:
 *                 type: string
 *                 example: C03
 *               infraccion_descripcion:
 *                 type: string
 *                 example: Estacionar en sitio prohibido.
 *               valor_multa:
 *                 type: number
 *                 example: 520000
 *               fecha_comparendo:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-10T08:15:00.000Z
 *               lugar:
 *                 type: string
 *                 example: Av. 3N con Calle 44
 *               ciudad:
 *                 type: string
 *                 example: Cali
 *               observaciones:
 *                 type: string
 *                 nullable: true
 *                 example: Correción de datos.
 *     responses:
 *       200:
 *         description: Comparendo actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comparendo actualizado correctamente
 *                 data:
 *                   $ref: '#/components/schemas/Comparendo'
 *       400:
 *         description: Error de validación o estado no permitido
 *       403:
 *         description: Sin permisos para editar
 */
router.put(
  "/comparendos/:id",
  [
    param("id").isUUID().withMessage("El id debe ser un UUID válido"),
    body("valor_multa").optional().isNumeric().withMessage("valor_multa debe ser numérico"),
    body("infracciones").optional().isArray().withMessage("infracciones debe ser un arreglo"),
    body("fecha_comparendo").optional().isISO8601().withMessage("fecha_comparendo debe ser fecha válida"),
    body("observaciones").optional().isString(),
  ],
  actualizarComparendoController
);

export default router;