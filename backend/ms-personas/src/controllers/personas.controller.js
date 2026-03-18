import { validationResult } from "express-validator";
import {
  crearPersona,
  listarPersonas,
  obtenerPersonaPorDocumento,
  obtenerPersonaPorId,
  validarExistenciaPersona,
} from "../services/personas.service.js";

export async function crearPersonaController(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
      });
    }

    const persona = await crearPersona(req.body);

    return res.status(201).json({
      ok: true,
      message: "Persona creada correctamente",
      data: persona,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function listarPersonasController(req, res) {
  try {
    const personas = await listarPersonas();

    return res.json({
      ok: true,
      data: personas,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function obtenerPersonaPorIdController(req, res) {
  try {
    const { persona_id } = req.params;
    const persona = await obtenerPersonaPorId(persona_id);

    if (!persona) {
      return res.status(404).json({
        ok: false,
        message: "Persona no encontrada",
      });
    }

    return res.json({
      ok: true,
      data: persona,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function obtenerPersonaPorDocumentoController(req, res) {
  try {
    const { numero } = req.params;
    const persona = await obtenerPersonaPorDocumento(numero);

    if (!persona) {
      return res.status(404).json({
        ok: false,
        message: "Persona no encontrada",
      });
    }

    return res.json({
      ok: true,
      data: persona,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function validarExistenciaPersonaController(req, res) {
  try {
    const { numero } = req.params;
    const result = await validarExistenciaPersona(numero);

    return res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}