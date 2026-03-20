import { validationResult } from "express-validator";
import {
  crearComparendo,
  listarComparendos,
  obtenerComparendoPorId,
  obtenerComparendoPorNumero,
  obtenerComparendosPorPlaca,
  obtenerHistorialComparendo,
  pagarComparendo,
  anularComparendo,
  revertirAPendiente,
  actualizarComparendo,
  obtenerSiguienteNumero,
} from "../services/comparendos.service.js";

export async function healthCheck(req, res) {
  return res.json({
    ok: true,
    service: process.env.SERVICE_NAME,
    timestamp: new Date().toISOString(),
  });
}

export async function crearComparendoController(req, res) {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Errores de validación",
        errors: errors.array(),
      });
    }

    const userRole = req.headers["x-user-role"];
    const comparendo = await crearComparendo(req.body, { userRole });

    return res.status(201).json({
      message: Array.isArray(comparendo) 
        ? "Comparendos creados correctamente" 
        : "Comparendo creado correctamente",
      data: comparendo,
    });
  } catch (error) {
    const status = error.message.includes("permiso") ? 403 : 400;
    return res.status(status).json({
      message: error.message,
    });
  }
}

export async function listarComparendosController(req, res) {
  try {
    console.log("Headers recibidos en ms-comparendos (RAW):", req.headers);
    const userRole = req.headers["x-user-role"];
    const username = req.headers["x-user-username"];
    const email = req.headers["x-user-email"];

    console.log("Headers extraídos:", { userRole, username, email });

    const data = await listarComparendos({ userRole, username, email });
    return res.json({ data });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function obtenerComparendoPorIdController(req, res) {
  try {
    const data = await obtenerComparendoPorId(req.params.id);
    return res.json({ data });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

export async function obtenerComparendoPorNumeroController(req, res) {
  try {
    const data = await obtenerComparendoPorNumero(req.params.numero);
    return res.json({ data });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

export async function obtenerComparendosPorPlacaController(req, res) {
  try {
    const data = await obtenerComparendosPorPlaca(req.params.placa);
    return res.json({ data });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

export async function obtenerHistorialComparendoController(req, res) {
  try {
    const data = await obtenerHistorialComparendo(req.params.id);
    return res.json({ data });
  } catch (error) {
    return res.status(404).json({
      message: error.message,
    });
  }
}

export async function pagarComparendoController(req, res) {
  try {
    const userRole = req.headers["x-user-role"];
    const username = req.headers["x-user-username"];

    const data = await pagarComparendo(req.params.id, { userRole, username });
    return res.json({
      message: "Comparendo pagado correctamente",
      data,
    });
  } catch (error) {
    const status = error.message.includes("permiso") ? 403 : 400;
    return res.status(status).json({
      message: error.message,
    });
  }
}

export async function anularComparendoController(req, res) {
  try {
    const data = await anularComparendo(req.params.id);
    return res.json({
      message: "Comparendo anulado correctamente",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

export async function revertirAPendienteController(req, res) {
  try {
    const data = await revertirAPendiente(req.params.id);
    return res.json({
      message: "Comparendo regresado a estado PENDIENTE",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

export async function actualizarComparendoController(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Errores de validación",
        errors: errors.array(),
      });
    }

    const userRole = req.headers["x-user-role"];
    const data = await actualizarComparendo(req.params.id, req.body, { userRole });

    return res.json({
      message: "Comparendo actualizado correctamente",
      data,
    });
  } catch (error) {
    const status = error.message.includes("permiso") ? 403 : 400;
    return res.status(status).json({
      message: error.message,
    });
  }
}

export async function obtenerSiguienteNumeroController(req, res) {
  try {
    const siguienteNumero = await obtenerSiguienteNumero();
    return res.status(200).json({
      data: siguienteNumero,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}