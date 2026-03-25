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

export async function listInfracciones(req, res) {
  try {
    const infracciones = await getAllInfracciones();

    return res.status(200).json({
      success: true,
      data: infracciones,
    });
  } catch (error) {
    console.error("Error in listInfracciones:", error);
    return res.status(500).json({
      success: false,
      message: "Error listando infracciones",
    });
  }
}

export async function getInfraccion(req, res) {
  try {
    const infraccion = await getInfraccionById(req.params.id);

    if (!infraccion) {
      return res.status(404).json({
        success: false,
        message: "Infracción no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: infraccion,
    });
  } catch (error) {
    console.error("Error in getInfraccion:", error);
    return res.status(500).json({
      success: false,
      message: "Error consultando infracción",
    });
  }
}

export async function getInfraccionByCodigoController(req, res) {
  try {
    const infraccion = await getInfraccionByCodigo(req.params.codigo);

    if (!infraccion) {
      return res.status(404).json({
        success: false,
        message: "Infracción no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: infraccion,
    });
  } catch (error) {
    console.error("Error in getInfraccionByCodigo:", error);
    return res.status(500).json({
      success: false,
      message: "Error consultando infracción por código",
    });
  }
}

export async function createInfraccionController(req, res) {
  try {
    const infraccion = await createInfraccion(req.body);

    return res.status(201).json({
      success: true,
      data: infraccion,
    });
  } catch (error) {
    const status = error.message.includes("existe") ? 409 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateInfraccionController(req, res) {
  try {
    const infraccion = await updateInfraccion(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: infraccion,
    });
  } catch (error) {
    const status = error.message === "Infracción no encontrada" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteInfraccionController(req, res) {
  try {
    await deleteInfraccion(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Infracción desactivada correctamente",
    });
  } catch (error) {
    const status = error.message === "Infracción no encontrada" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

export async function activateInfraccionController(req, res) {
  try {
    const infraccion = await activateInfraccion(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Infracción activada correctamente",
      data: infraccion,
    });
  } catch (error) {
    const status = error.message === "Infracción no encontrada" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

export async function changeInfraccionStatusController(req, res) {
  try {
    const infraccion = await changeInfraccionStatus(
      req.params.id,
      req.body.vigente
    );

    return res.status(200).json({
      success: true,
      data: {
        id: infraccion.id,
        vigente: infraccion.vigente,
      },
    });
  } catch (error) {
    const status = error.message === "Infracción no encontrada" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
}

