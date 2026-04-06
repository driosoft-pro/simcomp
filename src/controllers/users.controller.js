import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  getUserByDocumento,
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

export async function getUserByEmailController(req, res) {
  try {
    const { email } = req.params;
    const user = await getUserByEmail(decodeURIComponent(email));

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
      message: "Error consultando usuario por email",
    });
  }
}

export async function getUserByUsernameController(req, res) {
  try {
    const { username } = req.params;
    const user = await getUserByUsername(decodeURIComponent(username));

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
      message: "Error consultando usuario por username",
    });
  }
}

export async function createUserController(req, res) {
  try {
    const requesterRole = req.user.rol || req.headers["x-user-role"];
    
    // Si es supervisor, solo puede crear agentes
    if (requesterRole === "supervisor") {
      req.body.rol = "agente";
    }

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
    const requesterRole = req.user.rol;
    const requesterId = String(req.user.sub);
    const targetId = req.params.id;
    const isOwnProfile = requesterId === String(targetId);

    const targetUser = await getUserById(targetId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Permission check
    let canUpdate = false;
    let allowedFields = [];

    if (requesterRole === "admin") {
      canUpdate = true;
      // numero_documento incluido para que el admin pueda actualizar y propague a ms-personas
      allowedFields = ["username", "email", "password", "rol", "estado", "numero_documento"];
    } else if (isOwnProfile) {
      canUpdate = true;
      // All roles can update their own username, email, and password
      allowedFields = ["username", "email", "password"];
    } else if (requesterRole === "supervisor" && targetUser.rol === "agente") {
      canUpdate = true;
      allowedFields = ["estado"];
    }

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para actualizar este perfil",
      });
    }

    // Filter body based on allowed fields
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay campos válidos para actualizar",
      });
    }

    const user = await updateUser(targetId, updateData);

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
    return res.status(400).json({
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

/**
 * Endpoint interno: sincronizar datos de ms-personas → ms-auth-service.
 * No requiere JWT. Busca el usuario por oldDocumento y actualiza
 * numero_documento, username y/o email.
 */
export async function syncPersonaController(req, res) {
  try {
    const { oldDocumento, newDocumento, newEmail } = req.body;

    if (!oldDocumento) {
      return res.status(400).json({
        success: false,
        message: "El campo oldDocumento es requerido",
      });
    }

    // Buscar usuario por documento anterior
    let user = await getUserByDocumento(oldDocumento);

    // Fallback: buscar por username (que suele ser igual al número de documento)
    if (!user) {
      user = await getUserByUsername(oldDocumento);
    }

    if (!user) {
      console.warn(`[auth-sync] No se encontró usuario con documento/username: ${oldDocumento}`);
      return res.status(200).json({
        success: true,
        message: "No se encontró usuario vinculado, sin cambios",
      });
    }

    const updateData = {};
    if (newDocumento && newDocumento !== oldDocumento) {
      updateData.numero_documento = newDocumento;
      // Actualizar username solo si actualmente coincide con el documento anterior
      if (user.username === oldDocumento) {
        updateData.username = newDocumento;
      }
    }
    if (newEmail && newEmail !== user.email) {
      updateData.email = newEmail;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({
        success: true,
        message: "Sin cambios que aplicar al usuario",
      });
    }

    console.log(`[auth-sync] Actualizando usuario ${user.id}:`, updateData);
    // skipAuthSync = true para evitar bucle circular
    const updated = await updateUser(user.id, updateData, { skipPersonaSync: true });

    return res.status(200).json({
      success: true,
      message: "Usuario sincronizado correctamente",
      data: { id: updated.id, username: updated.username, email: updated.email, numero_documento: updated.numero_documento },
    });
  } catch (error) {
    console.error("[auth-sync] Error en sincronización interna:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error en sincronización interna",
    });
  }
}