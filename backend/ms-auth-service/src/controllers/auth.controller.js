import {
  buildAccessToken,
  validateUserCredentials,
  createRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
  verifyAccessToken,
} from "../services/auth.service.js";

export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    const user = await validateUserCredentials(identifier, password);
    const accessToken = buildAccessToken(user);
    const refreshToken = await createRefreshToken(user.id);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: refreshToken.token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          rol: user.rol,
          estado: user.estado,
        },
      },
    });
  } catch (error) {
    const status = error.message === "Usuario inactivo" ? 403 : 401;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          rol: result.user.rol,
          estado: result.user.estado,
        },
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}

export async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    await revokeRefreshToken(refreshToken);

    return res.status(200).json({
      success: true,
      message: "Logout exitoso",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
}

export async function validate(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send();
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyAccessToken(token);

    res.setHeader("X-User-ID", decoded.sub);
    res.setHeader("X-User-Role", decoded.rol);

    return res.status(200).send();
  } catch (error) {
    return res.status(401).send();
  }
}