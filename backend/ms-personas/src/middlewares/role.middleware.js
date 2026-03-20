/**
 * Middleware para restringir el acceso según el rol del usuario.
 * @param  {...string} roles - Roles permitidos
 */
export const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    const userRole = req.headers["x-user-role"];

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para realizar esta acción",
      });
    }

    next();
  };
};

export default roleMiddleware;
