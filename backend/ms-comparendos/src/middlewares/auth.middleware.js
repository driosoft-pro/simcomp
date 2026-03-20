import jwt from "jsonwebtoken";

/**
 * Middleware para asegurar que los headers de usuario estén presentes.
 * Si no vienen del gateway (X-User-*), intenta extraerlos del token JWT (Authorization: Bearer ...).
 */
export const verifyToken = (req, res, next) => {
  // 1. Si ya tenemos el rol (inyectado por NGINX), simplemente continuamos
  if (req.headers["x-user-role"]) {
    return next();
  }

  // 2. Si no, buscamos el header Authorization
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Si no hay token, no podemos inyectar headers, el controlador fallará con 403 si necesita permisos
    return next();
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
    // Si el token es inválido, podríamo retornar 401 directamente, 
    // pero para mantener coherencia con la arquitectura actual, dejamos que pase 
    // y el controlador manejará la falta de headers con un 403.
    console.error("Error verificando JWT en ms-comparendos:", error.message);
    next();
  }
};
