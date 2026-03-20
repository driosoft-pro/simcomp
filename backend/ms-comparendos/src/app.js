import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import comparendosRoutes from "./routes/comparendos.routes.js";
import swaggerSpec from "./swagger/swagger.js";

import { verifyToken } from "./middlewares/auth.middleware.js";

const app = express();

app.use(helmet({
  hsts: false,
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(verifyToken);

app.use("/api", comparendosRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;