import { Router } from "express";
import {
  listUsers,
  getUser,
  getUserByEmailController,
  getUserByUsernameController,
  createUserController,
  updateUserController,
  changeUserStatusController,
  syncPersonaController,
} from "../controllers/users.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/", authMiddleware, roleMiddleware("admin", "supervisor", "agente", "ciudadano"), listUsers);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRequest'
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El usuario ya existe
 */
router.post("/", authMiddleware, roleMiddleware("admin", "agente", "ciudadano"), createUserController);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por id
 *     tags: [Usuarios]
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
 *         description: Usuario encontrado
 */
router.get("/:id", authMiddleware, roleMiddleware("admin", "supervisor", "agente", "ciudadano"), getUser);

/**
 * @swagger
 * /usuarios/email/{email}:
 *   get:
 *     summary: Obtener usuario por email (uso interno entre microservicios)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/email/:email", getUserByEmailController);

/**
 * @swagger
 * /usuarios/username/{username}:
 *   get:
 *     summary: Obtener usuario por username (uso interno entre microservicios)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/username/:username", getUserByUsernameController);

/**
 * Ruta interna (sin JWT): ms-personas sincroniza documento/email en el usuario vinculado.
 */
router.patch("/internal/sync-persona", syncPersonaController);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
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
 *             $ref: '#/components/schemas/UserRequest'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put("/:id", authMiddleware, roleMiddleware("admin", "supervisor", "agente", "ciudadano"), updateUserController);

/**
 * @swagger
 * /usuarios/{id}/estado:
 *   patch:
 *     summary: Cambiar estado del usuario
 *     tags: [Usuarios]
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
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo]
 *                 default: activo
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch("/:id/estado", authMiddleware, roleMiddleware("admin", "supervisor"), changeUserStatusController);

export default router;