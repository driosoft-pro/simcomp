import { Router } from "express";
import { body, param } from "express-validator";
import {
  crearLicenciaController,
  listarLicenciasController,
  listarLicenciasPorPersonaController,
  obtenerLicenciaPorNumeroController,
  actualizarLicenciaController,
  suspenderLicenciasPorDocumentoController,
  reactivarLicenciasPorDocumentoController,
  cancelarLicenciaController,
} from "../controllers/licencias.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Licencias
 *   description: Gestión de licencias de conducción
 */

/**
 * @swagger
 * /Licencias:
 *   post:
 *     summary: Crear licencia de conducción
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Licencia'
 *     responses:
 *       201:
 *         description: Licencia creada correctamente
 */
router.post(
  "/",
  [
    body("persona_id").notEmpty().isUUID(),
    body("numero_licencia").notEmpty().isString(),
    body("categoria")
      .notEmpty()
      .isIn(["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"]),
    body("fecha_expedicion").notEmpty().isDate(),
    body("fecha_vencimiento").notEmpty().isDate(),
    body("estado")
      .notEmpty()
      .isIn(["vigente", "suspendida", "vencida", "cancelada"]),
  ],
  crearLicenciaController
);

/**
 * @swagger
 * /Licencias:
 *   get:
 *     summary: Listar todas las licencias
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de licencias
 */
router.get("/", listarLicenciasController);

/**
 * @swagger
 * /Licencias/persona/{persona_id}:
 *   get:
 *     summary: Listar licencias por persona
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: persona_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           default: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3"
 *     responses:
 *       200:
 *         description: Lista de licencias
 */
router.get(
  "/persona/:persona_id",
  [param("persona_id").isUUID()],
  listarLicenciasPorPersonaController
);

/**
 * @swagger
 * /Licencias/{numero}:
 *   get:
 *     summary: Buscar licencia por número
 *     tags: [Licencias]
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
 *         description: Licencia encontrada
 *       404:
 *         description: Licencia no encontrada
 */
router.get("/:numero", obtenerLicenciaPorNumeroController);


/**
 * @swagger
 * /Licencias/{id}:
 *   put:
 *     summary: Actualizar licencia de conducción
 *     tags: [Licencias]
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
 *             $ref: '#/components/schemas/Licencia'
 *     responses:
 *       200:
 *         description: Licencia actualizada correctamente
 *       404:
 *         description: Licencia no encontrada
 */
router.put(
  "/:licencia_id",
  [
    param("licencia_id").isUUID(),
    body("numero_licencia").optional().isString(),
    body("categoria")
      .optional()
      .isIn(["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"]),
    body("fecha_expedicion").optional().isDate(),
    body("fecha_vencimiento").optional().isDate(),
    body("estado")
      .optional()
      .isIn(["vigente", "suspendida", "vencida", "cancelada"]),
  ],
  actualizarLicenciaController
);

/**
 * @swagger
 * /Licencias/suspender/{documento}:
 *   patch:
 *     summary: Suspender todas las licencias vigentes de una persona por documento
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del infractor
 *     responses:
 *       200:
 *         description: Licencias suspendidas correctamente
 *       404:
 *         description: Persona no encontrada
 */
router.patch("/suspender/:documento", suspenderLicenciasPorDocumentoController);

/**
 * @swagger
 * /Licencias/reactivar/{documento}:
 *   patch:
 *     summary: Reactivar todas las licencias suspendidas de una persona por documento
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documento
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento del conductor
 *     responses:
 *       200:
 *         description: Licencias reactivadas correctamente
 *       404:
 *         description: Persona no encontrada
 */
router.patch("/reactivar/:documento", reactivarLicenciasPorDocumentoController);

/**
 * @swagger
 * /Licencias/{licencia_id}:
 *   delete:
 *     summary: Cancelar una licencia de conducción (Irreversible)
 *     tags: [Licencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: licencia_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Licencia cancelada correctamente
 *       404:
 *         description: Licencia no encontrada
 *       400:
 *         description: Error en la cancelación
 */
router.delete("/:licencia_id", [param("licencia_id").isUUID()], cancelarLicenciaController);

export default router;
