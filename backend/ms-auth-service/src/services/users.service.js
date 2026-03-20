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
  });

  return user;
}

export async function updateUser(id, data) {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (data.username !== undefined) user.username = data.username;
  if (data.email !== undefined) user.email = data.email;
  if (data.rol !== undefined) user.rol = data.rol;
  if (data.estado !== undefined) user.estado = data.estado;

  if (data.password) {
    user.password_hash = await bcrypt.hash(data.password, 10);
  }

  await user.save();
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