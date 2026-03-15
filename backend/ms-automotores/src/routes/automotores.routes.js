import express from "express";

import {
  createAutomotorController,
  getAutomotores,
  getAutomotorByIdController,
  getAutomotorByPlacaController,
  updateAutomotorController,
  deleteAutomotorController,
  changeAutomotorStatusController
} from "../controllers/automotores.controllers.js";

const router = express.Router();

router.post("/", createAutomotorController);
router.get("/", getAutomotores);
router.get("/placa/:placa", getAutomotorByPlacaController);
router.get("/:id", getAutomotorByIdController);
router.put("/:id", updateAutomotorController);
router.delete("/:id", deleteAutomotorController);
router.patch("/:id/estado", changeAutomotorStatusController);

export default router;
