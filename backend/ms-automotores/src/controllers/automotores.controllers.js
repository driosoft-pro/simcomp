import {
  getAllAutomotores,
  getAutomotorById,
  getAutomotorByPlaca,
  inmovilizarAutomotorPorPlaca,
  createAutomotor,
  updateAutomotor,
  deleteAutomotor,
  changeAutomotorStatus,
  actualizarDatosPropietarioMasivo
} from "../services/automotores.service.js";

export async function getAutomotores(req, res) {
  try {
    const automotores = await getAllAutomotores();

    return res.status(200).json({
      success: true,
      data: automotores
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error listando automotores"
    });

  }
}

export async function getAutomotorByIdController(req, res) {
  try {

    const automotor = await getAutomotorById(req.params.id);

    if (!automotor) {
      return res.status(404).json({
        success: false,
        message: "Automotor no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: automotor
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error consultando automotor"
    });

  }
}

export async function createAutomotorController(req, res) {
  try {

    const automotor = await createAutomotor(req.body);

    return res.status(201).json({
      success: true,
      data: automotor
    });

  } catch (error) {

    const status = error.message.includes("existe") ? 409 : 400;

    return res.status(status).json({
      success: false,
      message: error.message
    });

  }
}

export async function updateAutomotorController(req, res) {
  try {

    const automotor = await updateAutomotor(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: automotor
    });

  } catch (error) {

    const status = error.message === "Automotor no encontrado" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message
    });

  }
}

export async function deleteAutomotorController(req, res) {
  try {

    await deleteAutomotor(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Automotor eliminado correctamente"
    });

  } catch (error) {

    const status = error.message === "Automotor no encontrado" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message
    });

  }
}

export async function getAutomotorByPlacaController(req, res) {
  try {

    const automotor = await getAutomotorByPlaca(req.params.placa);

    if (!automotor) {
      return res.status(404).json({
        success: false,
        message: "Automotor no encontrado"
      });
    }

    return res.status(200).json({
      success: true,
      data: automotor
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Error consultando automotor por placa"
    });

  }
}

export async function changeAutomotorStatusController(req, res) {
  try {

    const { estado } = req.body;

    const automotor = await changeAutomotorStatus(req.params.id, estado);

    return res.status(200).json({
      success: true,
      data: automotor
    });

  } catch (error) {

    const status =
      error.message === "Automotor no encontrado" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message
    });

  }
}

export async function inmovilizarPorPlacaController(req, res) {
  try {
    const automotor = await inmovilizarAutomotorPorPlaca(req.params.placa);

    return res.status(200).json({
      success: true,
      message: "Vehículo inmovilizado correctamente",
      data: automotor
    });
  } catch (error) {
    const status = error.message.includes("no encontrado") ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message
    });
  }
}

export async function syncPropietarioController(req, res) {
  try {
    const { oldDocumento, newDocumento, newNombre } = req.body;

    if (!oldDocumento) {
      return res.status(400).json({
        success: false,
        message: "El campo oldDocumento es requerido"
      });
    }

    const affectedRows = await actualizarDatosPropietarioMasivo(oldDocumento, newDocumento, newNombre);

    return res.status(200).json({
      success: true,
      message: `Sincronización completada. ${affectedRows} vehículos actualizados.`,
      affectedRows
    });
  } catch (error) {
    console.error("Error sincronizando propietario:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error al sincronizar datos del propietario masivamente"
    });
  }
}