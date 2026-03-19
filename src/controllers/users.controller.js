import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserStatus,
} from "../services/users.service.js";

export async function listUsers(req, res) {
  try {
    let users = await getAllUsers();

    // Si es ciudadano, solo puede ver su propio perfil en la lista
    if (req.user.rol === "ciudadano") {
      console.log("Filtrando lista de usuarios para ciudadano. Sub:", req.user.sub);
      users = users.filter((u) => String(u.id) === String(req.user.sub));
      console.log("Usuarios encontrados tras filtro:", users.length);
    }

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error listando usuarios",
    });
  }
}

export async function getUser(req, res) {
  try {
    // Verificar si el usuario tiene permiso para ver este perfil
    if (req.user.rol !== "admin" && req.user.rol !== "supervisor" && String(req.user.sub) !== String(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para ver este perfil",
      });
    }

    const user = await getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error consultando usuario",
    });
  }
}

export async function createUserController(req, res) {
  try {
    const user = await createUser(req.body);

    return res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        rol: user.rol,
        estado: user.estado,
      },
    });
  } catch (error) {
    const status = error.message.includes("existe") ? 409 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateUserController(req, res) {
  try {
    // Solo el admin o el propio usuario pueden actualizar
    if (req.user.rol !== "admin" && String(req.user.sub) !== String(req.params.id)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar este perfil",
      });
    }

    const user = await updateUser(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        rol: user.rol,
        estado: user.estado,
      },
    });
  } catch (error) {
    const status = error.message === "Usuario no encontrado" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

export async function changeUserStatusController(req, res) {
  try {
    const user = await changeUserStatus(req.params.id, req.body.estado);

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        estado: user.estado,
      },
    });
  } catch (error) {
    const status = error.message === "Usuario no encontrado" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}