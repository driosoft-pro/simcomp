import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "SIMCOMP - ms-reportes API",
    version: "1.0.0",
    description:
      "Microservicio de reportes para importacion/exportacion CSV, Excel, PDF, dataset completo y estadisticas del sistema SIMCOMP."
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: "Servidor local"
    }
  ],
  tags: [
    { name: "Health", description: "Estado del microservicio" },
    { name: "Importacion", description: "Carga de archivos CSV por modulo" },
    { name: "Exportacion", description: "Exportacion CSV, Excel, PDF y dataset global" },
    { name: "Estadisticas", description: "Consultas y reportes estadisticos" }
  ],
  components: {
    schemas: {
      HealthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          service: { type: "string", example: "ms-reportes" },
          message: { type: "string", example: "OK" }
        }
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error interno del servidor" }
        }
      },
      ImportResult: {
        type: "object",
        properties: {
          total: { type: "integer", example: 100 },
          inserted: { type: "integer", example: 97 },
          failed: { type: "integer", example: 3 },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                row: { type: "integer", example: 15 },
                error: { oneOf: [{ type: "string" }, { type: "object" }] }
              }
            }
          }
        }
      },
      StatisticsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              resumen: {
                type: "object",
                properties: {
                  totalUsuarios: { type: "integer", example: 120 },
                  totalPersonas: { type: "integer", example: 2000 },
                  totalAutomotores: { type: "integer", example: 1800 },
                  totalInfracciones: { type: "integer", example: 55 },
                  totalComparendos: { type: "integer", example: 650 }
                }
              },
              usuariosPorRol: {
                type: "object",
                additionalProperties: { type: "integer" },
                example: {
                  admin: 1,
                  supervisor: 4,
                  agente: 20,
                  ciudadano: 95
                }
              },
              comparendosPorEstado: {
                type: "object",
                additionalProperties: { type: "integer" },
                example: {
                  PENDIENTE: 420,
                  PAGADO: 180,
                  ANULADO: 50
                }
              }
            }
          }
        }
      }
    },
    parameters: {
      ModuloParam: {
        name: "modulo",
        in: "path",
        required: true,
        schema: {
          type: "string",
          enum: ["usuarios", "personas", "automotores", "infracciones", "comparendos"]
        },
        description: "Modulo a importar o exportar"
      }
    }
  }
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.js"]
};

export const swaggerSpec = swaggerJsdoc(options);
