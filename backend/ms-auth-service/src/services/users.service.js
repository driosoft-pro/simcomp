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
  if (data.email && data.email !== oldEmail) {
    try {
      const personasServiceUrl = process.env.PERSONAS_SERVICE_URL || "http://ms-personas:8002/api";
      // Find persona by old email or username
      const response = await fetch(`${personasServiceUrl}/Personas/documento/${oldUsername}`);
      if (response.ok) {
        const personaData = await response.json();
        const personaId = personaData.id || personaData.data?.id;
        if (personaId) {
          await fetch(`${personasServiceUrl}/Personas/${personaId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: data.email }),
          });
        }
      }
    } catch (error) {
      console.error("Error synchronizing email with ms-personas:", error.message);
      // We don't throw here to avoid blocking the user update if the other service is down
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