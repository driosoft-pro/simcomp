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
    const userRole = req.user.rol || req.headers["x-user-role"];
    const userId = req.user.sub || req.headers["x-user-id"];

    if (userRole === "ciudadano") {
      console.log("Filtrando lista de usuarios para ciudadano. Sub:", userId);
      users = users.filter((u) => String(u.id) === String(userId));
      console.log("Usuarios encontrados tras filtro:", users.length);
    }

    // Si es supervisor, solo puede ver agentes y ciudadanos
    if (userRole === "supervisor") {
      console.log("Filtrando lista de usuarios para supervisor.");
      users = users.filter((u) => ["agente", "ciudadano"].includes(u.rol));
      console.log("Usuarios encontrados tras filtro:", users.length);
    }

    // Si es agente, solo puede ver ciudadanos y su propio usuario
    if (userRole === "agente") {
      console.log("Filtrando lista de usuarios para agente. Sub:", userId);
      users = users.filter((u) => u.rol === "ciudadano" || String(u.id) === String(userId));
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
    console.log(`Checking permissions for getUser. User ID: ${req.user.sub}, Role: ${req.user.rol}, Requested ID: ${req.params.id}`);
    
    const isAuthorizedRole = ["admin", "supervisor", "agente"].includes(req.user.rol);
    const isOwnProfile = String(req.user.sub) === String(req.params.id);

    if (!isAuthorizedRole && !isOwnProfile) {
      console.log("Permission denied for getUser");
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

    // Restricción adicional para agentes: solo pueden ver ciudadanos o a sí mismos
    if (req.user.rol === "agente") {
      const isTargetCitizen = user.rol === "ciudadano";
      if (!isTargetCitizen && !isOwnProfile) {
        console.log("Agente restricted from viewing non-citizen/non-self profile");
        return res.status(403).json({
          success: false,
          message: "No tienes permiso para ver este perfil",
        });
      }
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
    const isConflict = error.message.includes("existe") || error.message.includes("registrado");
    const status = isConflict ? 409 : 400;

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
    const userRole = req.user.rol || req.headers["x-user-role"];

    // Si es supervisor, solo puede inactivar agentes
    if (userRole === "supervisor") {
      const targetUser = await getUserById(req.params.id);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        });
      }

      if (targetUser.rol !== "agente") {
        return res.status(403).json({
          success: false,
          message: "Un supervisor solo puede cambiar el estado de usuarios con rol agente",
        });
      }
    }

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