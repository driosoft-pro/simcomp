import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  changeUserStatus,
} from "../services/users.service.js";

export async function listUsers(req, res) {
  try {
    const users = await getAllUsers();
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