import bcrypt from "bcrypt";
import User from "../models/user.model.js";

export async function getAllUsers() {
  return await User.findAll({
    attributes: { exclude: ["password_hash"] },
  });
}

export async function getUserById(id) {
  return await User.findByPk(id, {
    attributes: { exclude: ["password_hash"] },
  });
}

export async function getUserByEmail(email) {
  return await User.findOne({
    where: { email },
    attributes: { exclude: ["password_hash"] },
  });
}

export async function getUserByUsername(username) {
  return await User.findOne({
    where: { username },
    attributes: { exclude: ["password_hash"] },
  });
}

export async function createUser(data) {
  const existingByEmail = await User.findOne({
    where: { email: data.email },
  });

  if (existingByEmail) {
    throw new Error("El email ya está registrado");
  }

  const existingByUsername = await User.findOne({
    where: { username: data.username },
  });

  if (existingByUsername) {
    throw new Error("El nombre de usuario ya existe");
  }

  const password_hash = await bcrypt.hash(data.password, 10);

  const user = await User.create({
    username: data.username,
    email: data.email,
    password_hash,
    rol: data.rol,
    estado: data.estado || "activo",
    persona_id: data.persona_id || null,
    numero_documento: data.numero_documento || null,
  });

  return user;
}

export async function updateUser(id, data) {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const oldEmail = user.email;
  const oldUsername = user.username;
  const oldNumeroDocumento = user.numero_documento; // Capturar ANTES de mutar el objeto

  if (data.username !== undefined) user.username = data.username;
  if (data.email !== undefined) user.email = data.email;
  if (data.rol !== undefined) user.rol = data.rol;
  if (data.estado !== undefined) user.estado = data.estado;
  if (data.persona_id !== undefined) user.persona_id = data.persona_id;
  if (data.numero_documento !== undefined) user.numero_documento = data.numero_documento;

  if (data.password) {
    user.password_hash = await bcrypt.hash(data.password, 10);
  }

  await user.save();

  // Cascading update to ms-personas
  const emailChanged = data.email && data.email !== oldEmail;
  // IMPORTANTE: usar oldNumeroDocumento (capturado antes del update) para comparar
  const docChanged = data.numero_documento !== undefined && data.numero_documento !== oldNumeroDocumento;

  if (emailChanged || docChanged) {
    try {
      const personasServiceUrl = process.env.PERSONAS_SERVICE_URL || "http://localhost:8002/api";
      let personaId = user.persona_id;

      // Si no hay persona_id vinculado, buscar por documento
      if (!personaId) {
        // BUG FIX: buscar por el documento ANTERIOR (oldNumeroDocumento),
        // porque la persona en BD aún tiene ese valor antes de esta sincronización
        const docToSearch = docChanged ? oldNumeroDocumento : (oldNumeroDocumento || oldUsername);
        console.log(`[auth→personas] Buscando persona por documento: ${docToSearch}`);
        const findResponse = await fetch(`${personasServiceUrl}/personas/documento/${encodeURIComponent(docToSearch)}`);
        if (findResponse.ok) {
          const personaResult = await findResponse.json();
          personaId = personaResult.data?.id || personaResult.data?.persona_id || personaResult.id;
          console.log(`[auth→personas] Persona encontrada: ID ${personaId}`);
        } else {
          console.warn(`[auth→personas] Persona no encontrada para documento ${docToSearch} (Status: ${findResponse.status})`);
        }
      }

      if (personaId) {
        const updatePayload = {};
        if (emailChanged) updatePayload.email = data.email;
        if (docChanged) updatePayload.numero_documento = data.numero_documento;

        if (Object.keys(updatePayload).length > 0) {
          console.log(`Sincronizando cambios con ms-personas para persona ${personaId}:`, updatePayload);
          // x-internal-sync: true evita que ms-personas intente re-sincronizar de vuelta con ms-auth
          // (previene bucle circular auth → personas → auth)
          // x-user-role: admin permite pasar el authMiddleware y roleMiddleware de ms-personas
          await fetch(`${personasServiceUrl}/personas/${personaId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-internal-sync": "true",
              "x-user-role": "admin",
              "x-user-id": "internal-sync"
            },
            body: JSON.stringify(updatePayload),
          });
        }
      }
    } catch (error) {
      console.error("Error synchronizing with ms-personas:", error.message);
    }
  }

  return user;
}

export async function changeUserStatus(id, estado) {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (!["activo", "inactivo"].includes(estado)) {
    throw new Error("Estado inválido");
  }

  user.estado = estado;
  await user.save();

  return user;
}