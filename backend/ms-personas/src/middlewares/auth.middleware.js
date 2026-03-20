import jwt from "jsonwebtoken";

/**
 * Middleware para asegurar que los headers de usuario estén presentes.
 * Si no vienen del gateway (X-User-*), intenta extraerlos del token JWT (Authorization: Bearer ...).
 */
export const authMiddleware = (req, res, next) => {
  // 1. Si ya tenemos el rol (inyectado por NGINX/Gateway), simplemente continuamos
  if (req.headers["x-user-role"]) {
    return next();
  }

  // 2. Si no, buscamos el header Authorization
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token requerido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Inyectamos los headers esperados por los controladores
    req.headers["x-user-id"] = decoded.sub;
    req.headers["x-user-role"] = decoded.rol;
    req.headers["x-user-username"] = decoded.username || "";
    req.headers["x-user-email"] = decoded.email || "";

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

export default authMiddleware;
