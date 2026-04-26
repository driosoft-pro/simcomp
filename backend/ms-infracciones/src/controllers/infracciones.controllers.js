import {
  getAllInfracciones,
  getInfraccionById,
  getInfraccionByCodigo,
  createInfraccion,
  updateInfraccion,
  deleteInfraccion,
  activateInfraccion,
  changeInfraccionStatus,
} from "../services/infracciones.service.js";

export async function getInfraccionesController(req, res) {
  try {
    const { limit, page, estado, vigente, tipo_sancion } = req.query;
    const infracciones = await getAllInfracciones({ limit, page, estado, vigente, tipo_sancion });
    return res.status(200).json({ success: true, data: infracciones });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al listar infracciones" });
  }
}

export async function getInfraccionByIdController(req, res) {
  try {
    const infraccion = await getInfraccionById(req.params.id);
    if (!infraccion) {
      return res.status(404).json({ success: false, message: "Infracción no encontrada" });
    }
    return res.status(200).json({ success: true, data: infraccion });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al consultar infracción" });
  }
}

export async function getInfraccionByCodigoController(req, res) {
  try {
    const infraccion = await getInfraccionByCodigo(req.params.codigo);
    if (!infraccion) {
      return res.status(404).json({ success: false, message: "Infracción no encontrada" });
    }
    return res.status(200).json({ success: true, data: infraccion });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al consultar infracción por código" });
  }
}

export async function createInfraccionController(req, res) {
  try {
    const infraccion = await createInfraccion(req.body);
    return res.status(201).json({ success: true, data: infraccion });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      const details = error.errors.map(e => `${e.path}: ${e.value}`).join(", ");
      return res.status(409).json({
        success: false,
        message: `Ya existe una infracción con estos datos (${details})`,
      });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function updateInfraccionController(req, res) {
  try {
    const infraccion = await updateInfraccion(req.params.id, req.body);
    return res.status(200).json({ success: true, data: infraccion });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "El nuevo código ya está en uso" });
    }
    const status = error.message === "Infracción no encontrada" ? 404 : 400;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function deleteInfraccionController(req, res) {
  try {
    await deleteInfraccion(req.params.id);
    return res.status(200).json({ success: true, message: "Infracción eliminada (soft-delete) correctamente" });
  } catch (error) {
    const status = error.message === "Infracción no encontrada" ? 404 : 400;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function activateInfraccionController(req, res) {
  try {
    const infraccion = await activateInfraccion(req.params.id);
    return res.status(200).json({ success: true, data: infraccion });
  } catch (error) {
    const status = error.message === "Infracción no encontrada" ? 404 : 400;
    return res.status(status).json({ success: false, message: error.message });
  }
}

export async function changeInfraccionStatusController(req, res) {
  try {
    const { vigente } = req.body;
    const infraccion = await changeInfraccionStatus(req.params.id, vigente);
    return res.status(200).json({ success: true, data: infraccion });
  } catch (error) {
    const status = error.message === "Infracción no encontrada" ? 404 : 400;
    return res.status(status).json({ success: false, message: error.message });
  }
}
