import bcrypt from "bcrypt";
import { Op } from "sequelize";
import User from "../models/user.model.js";
import { getEnv } from "../utils/env.js";

// Atributos base: nunca exponer password_hash ni deleted_at
const PUBLIC_ATTRS = { exclude: ["password_hash", "deleted_at"] };

/**
 * Lista usuarios con filtros opcionales empujados a la DB.
 * Evita traer todos los registros a memoria para filtrar en JS.
 * Soporta paginación con limit/offset.
 *
 * @param {object} opts
 * @param {string[]} [opts.roles]        - Filtrar solo estos roles (WHERE rol IN (...))
 * @param {string[]} [opts.excludeRoles] - Excluir estos roles
 * @param {number}   [opts.limit]        - Máximo de resultados
 * @param {number}   [opts.offset]       - Desplazamiento para paginación
 */
export async function getAllUsers({ roles, excludeRoles, limit, offset } = {}) {
  const where = {};

  if (roles && roles.length) {
    where.rol = { [Op.in]: roles };
  } else if (excludeRoles && excludeRoles.length) {
    where.rol = { [Op.notIn]: excludeRoles };
  }

  const queryOpts = {
    attributes: PUBLIC_ATTRS,
    where,
    order: [["created_at", "DESC"]],
  };

  if (limit) queryOpts.limit = limit;
  if (offset) queryOpts.offset = offset;

  return await User.findAll(queryOpts);
}

export async function getUserById(id) {
  return await User.findByPk(id, {
    attributes: PUBLIC_ATTRS,
  });
}

export async function getUserByEmail(email) {
  return await User.findOne({
    where: { email },
    attributes: PUBLIC_ATTRS,
  });
}

export async function getUserByUsername(username) {
  return await User.findOne({
    where: { username },
    attributes: PUBLIC_ATTRS,
  });
}

export async function getUserByDocumento(numeroDocumento) {
  return await User.findOne({
    where: { numero_documento: numeroDocumento },
    attributes: PUBLIC_ATTRS,
  });
}

/**
 * Crea un usuario. NO hace queries previas de unicidad: confiamos en los
 * UNIQUE constraints de Postgres (más eficiente y libre de race conditions).
 * El controller captura SequelizeUniqueConstraintError y devuelve 409.
 */
export async function createUser(data) {
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

export async function updateUser(id, data, options = {}) {
  const { skipPersonaSync = false } = options;
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

  if (!skipPersonaSync && (emailChanged || docChanged)) {
    try {
      const personasBaseUrl = getEnv("PERSONAS_SERVICE_URL") || "http://ms-personas:8002";
      const personasApiUrl = personasBaseUrl.endsWith("/api") ? personasBaseUrl : `${personasBaseUrl}/api`;
      let personaId = user.persona_id;

      // Si no hay persona_id vinculado, buscar por documento
      if (!personaId) {
        // BUG FIX: buscar por el documento ANTERIOR (oldNumeroDocumento),
        // porque la persona en BD aún tiene ese valor antes de esta sincronización
        const docToSearch = docChanged ? oldNumeroDocumento : (oldNumeroDocumento || oldUsername);
        console.log(`[auth→personas] Buscando persona por documento: ${docToSearch}`);
        const findResponse = await fetch(`${personasApiUrl}/personas/documento/${encodeURIComponent(docToSearch)}`);
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
          // x-internal-sync: true evita que ms-personas intente re-sincronizar de vuelta
          // (previene bucle circular auth → personas → auth)
          await fetch(`${personasApiUrl}/personas/${personaId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-internal-sync": "true",
              "x-user-role": "admin",
              "x-user-id": "internal-sync",
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