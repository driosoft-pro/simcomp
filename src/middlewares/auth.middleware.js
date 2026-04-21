import jwt from "jsonwebtoken";
import { getEnv } from "../utils/env.js";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, getEnv("JWT_SECRET", "secret123"));
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
}