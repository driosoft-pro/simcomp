import {
  buildAccessToken,
  validateUserCredentials,
  createRefreshToken,
  refreshAccessToken,
  revokeRefreshToken,
  verifyAccessToken,
} from "../services/auth.service.js";

/**
 * Cache en memoria para tokens JWT ya verificados.
 * Evita re-ejecutar jwt.verify() (CPU-bound) en cada petición al endpoint /validate,
 * que es llamado por HAProxy en CADA request del sistema.
 * TTL: 30 segundos. Tamaño máximo: 1000 entradas (evita memory leak).
 */
const TOKEN_CACHE = new Map();
const TOKEN_CACHE_TTL_MS = 30_000;
const TOKEN_CACHE_MAX = 1_000;

function getCachedToken(token) {
  const entry = TOKEN_CACHE.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    TOKEN_CACHE.delete(token);
    return null;
  }
  return entry.decoded;
}

function setCachedToken(token, decoded) {
  // Evitar memory leak: limpiar la entrada más antigua si superamos el límite
  if (TOKEN_CACHE.size >= TOKEN_CACHE_MAX) {
    const firstKey = TOKEN_CACHE.keys().next().value;
    TOKEN_CACHE.delete(firstKey);
  }
  TOKEN_CACHE.set(token, {
    decoded,
    // Cachear solo hasta que expire el propio JWT (o 30s, lo que sea menor)
    expiresAt: Math.min(
      Date.now() + TOKEN_CACHE_TTL_MS,
      decoded.exp ? decoded.exp * 1000 : Date.now() + TOKEN_CACHE_TTL_MS
    ),
  });
}

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
          persona_id: user.persona_id,
          numero_documento: user.numero_documento,
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
          persona_id: result.user.persona_id,
          numero_documento: result.user.numero_documento,
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

    // Limpiar del cache si existía (evitar que siga siendo válido post-logout)
    // No podemos limpiar por token de acceso aquí, pero el TTL de 30s es aceptable

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

    // Hot path: intentar cache primero — evita cpu-bound jwt.verify() en cada request
    let decoded = getCachedToken(token);
    if (!decoded) {
      decoded = await verifyAccessToken(token);
      setCachedToken(token, decoded);
    }

    // Central security check: Supervisor es read-only
    const originalMethod = req.headers["x-original-method"];
    if (
      decoded.rol === "supervisor" &&
      originalMethod &&
      !["GET", "HEAD", "OPTIONS", "TRACE"].includes(originalMethod.toUpperCase())
    ) {
      return res.status(403).send();
    }

    res.setHeader("X-User-ID", decoded.sub);
    res.setHeader("X-User-Role", decoded.rol);
    res.setHeader("X-User-Username", decoded.username || "");
    res.setHeader("X-User-Email", decoded.email || "");

    return res.status(200).send();
  } catch {
    return res.status(401).send();
  }
}