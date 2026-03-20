import { Router } from "express";
import { login, refresh, logout, validate } from "../controllers/auth.controller.js";

const router = Router();

/**
 * @swagger
 * /Auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", login);

/**
 * @swagger
 * /Auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Token renovado
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /Auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
router.post("/logout", logout);
router.post("/validate", validate);

export default router;