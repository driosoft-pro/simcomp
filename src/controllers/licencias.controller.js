import { validationResult } from "express-validator";
import {
  crearLicencia,
  listarLicenciasPorPersona,
  obtenerLicenciaPorNumero,
  actualizarLicencia,
} from "../services/licencias.service.js";

export async function crearLicenciaController(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
      });
    }

    const licencia = await crearLicencia(req.body);

    return res.status(201).json({
      ok: true,
      message: "Licencia creada correctamente",
      data: licencia,
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 404 : 500;

    return res.status(status).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function listarLicenciasPorPersonaController(req, res) {
  try {
    const { persona_id } = req.params;
    const licencias = await listarLicenciasPorPersona(persona_id);

    return res.json({
      ok: true,
      data: licencias,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        ok: false,
        message: "Ya existe un registro con estos datos únicos (ej: número de licencia)",
      });
    }
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function obtenerLicenciaPorNumeroController(req, res) {
  try {
    const { numero } = req.params;
    const licencia = await obtenerLicenciaPorNumero(numero);

    if (!licencia) {
      return res.status(404).json({
        ok: false,
        message: "Licencia no encontrada",
      });
    }

    return res.json({
      ok: true,
      data: licencia,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}
export async function actualizarLicenciaController(req, res) {
  try {
    const { licencia_id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
      });
    }

    const licencia = await actualizarLicencia(licencia_id, req.body);

    return res.json({
      ok: true,
      message: "Licencia actualizada correctamente",
      data: licencia,
    });
  } catch (error) {
    const status = error.message.includes("no existe") ? 404 : 500;
    return res.status(status).json({
      ok: false,
      message: error.message,
    });
  }
}
