import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";
import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";

export function buildAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email,
      rol: user.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    }
  );
}

export async function validateUserCredentials(identifier, password) {
  const user = await User.findOne({
    where: {
      [Op.or]: [{ username: identifier }, { email: identifier }],
    },
  });

  if (!user) {
    throw new Error("Credenciales inválidas");
  }

  if (user.estado !== "activo") {
    throw new Error("Usuario inactivo");
  }

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new Error("Credenciales inválidas");
  }

  return user;
}

export async function createRefreshToken(usuarioId) {
  const token = crypto.randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() + Number(process.env.JWT_REFRESH_EXPIRES_DAYS || 7)
  );

  return RefreshToken.create({
    usuario_id: usuarioId,
    token,
    expires_at: expiresAt,
    revocado: false,
  });
}

export async function refreshAccessToken(refreshTokenValue) {
  const savedToken = await RefreshToken.findOne({
    where: { token: refreshTokenValue },
  });

  if (!savedToken || savedToken.revocado) {
    throw new Error("Refresh token inválido");
  }

  if (new Date(savedToken.expires_at) < new Date()) {
    throw new Error("Refresh token expirado");
  }

  const user = await User.findByPk(savedToken.usuario_id);

  if (!user || user.estado !== "activo") {
    throw new Error("Usuario inválido o inactivo");
  }

  const accessToken = buildAccessToken(user);
  return { accessToken, user };
}

export async function revokeRefreshToken(refreshTokenValue) {
  const savedToken = await RefreshToken.findOne({
    where: { token: refreshTokenValue },
  });

  if (!savedToken) return;

  savedToken.revocado = true;
  savedToken.updated_at = new Date();
  await savedToken.save();
}