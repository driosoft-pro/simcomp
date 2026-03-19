import { Router } from "express";
import {
  listUsers,
  getUser,
  createUserController,
  updateUserController,
  changeUserStatusController,
} from "../controllers/users.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * /api/usuarios:
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
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por id
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario encontrado
 */
router.get("/:id", authMiddleware, roleMiddleware("admin", "supervisor", "agente", "ciudadano"), getUser);
// ... existing Swagger ...
router.put("/:id", authMiddleware, roleMiddleware("admin", "agente", "ciudadano"), updateUserController);

/**
 * @swagger
 * /api/usuarios/{id}/estado:
 *   patch:
 *     summary: Cambiar estado del usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch("/:id/estado", authMiddleware, roleMiddleware("admin"), changeUserStatusController);

export default router;