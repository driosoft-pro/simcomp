import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import infraccionesRoutes from "./routes/infracciones.routes.js";
import { swaggerUi, swaggerSpec } from "./swagger/swagger.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

/* Middlewares globales */
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* Health check */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    service: process.env.SERVICE_NAME,
    status: "OK",
  });
});

/* Routes */
app.use("/api/infracciones", infraccionesRoutes);

/* Swagger docs */
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* Error middleware */
app.use(errorHandler);

export default app;