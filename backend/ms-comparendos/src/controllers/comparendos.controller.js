import { validationResult } from "express-validator";
import {
  crearComparendo,
  listarComparendos,
  obtenerComparendoPorId,
  obtenerComparendoPorNumero,
  obtenerHistorialComparendo,
  pagarComparendo,
  anularComparendo,
  revertirAPendiente,
  listarComparendosPorDocumento,
  listarComparendosPorPlaca,
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

    const comparendo = await crearComparendo(req.body);

    return res.status(201).json({
      message: "Comparendo creado correctamente",
      data: comparendo,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

export async function listarComparendosController(req, res) {
  try {
    const data = await listarComparendos();
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
    const data = await pagarComparendo(req.params.id);
    return res.json({
      message: "Comparendo pagado correctamente",
      data,
    });
  } catch (error) {
    return res.status(400).json({
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

export async function listarComparendosPorDocumentoController(req, res) {
  try {
    const { documento } = req.params;
    const comparendos = await listarComparendosPorDocumento(documento);
    return res.json({ ok: true, data: comparendos });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}

export async function listarComparendosPorPlacaController(req, res) {
  try {
    const { placa } = req.params;
    const comparendos = await listarComparendosPorPlaca(placa);
    return res.json({ ok: true, data: comparendos });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}
