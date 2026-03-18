import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Infracciones Service API",
      version: "1.0.0",
      description:
        "Microservicio encargado de la gestión de infracciones de tránsito.",
    },

    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || "http://localhost:8004",
        description: "Servidor de API",
      },
    ],

    tags: [
      {
        name: "Infracciones",
        description: "Gestión de infracciones de tránsito",
      },
    ],

    components: {
      schemas: {
        Infraccion: {
          type: "object",
          properties: {
            infraccion_id: {
              type: "string",
              format: "uuid",
              example: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3",
            },

            codigo: {
              type: "string",
              example: "C001",
            },

            descripcion: {
              type: "string",
              example: "Estacionar un vehículo en sitios prohibidos",
            },

            articulo_codigo: {
              type: "string",
              example: "Ley 769/2002 Art. 131 C.1",
            },

            tipo_sancion: {
              type: "string",
              enum: [
                "MONETARIA",
                "SUSPENSION_LICENCIA",
                "INMOVILIZACION",
                "MIXTA",
              ],
              example: "MONETARIA",
            },

            valor_multa: {
              type: "number",
              format: "decimal",
              example: 650000,
            },

            dias_suspension: {
              type: "integer",
              nullable: true,
              example: 30,
            },

            aplica_descuento: {
              type: "boolean",
              example: true,
            },

            vigente: {
              type: "boolean",
              example: true,
            },

            created_at: {
              type: "string",
              format: "date-time",
              example: "2025-01-10T10:20:30.000Z",
            },

            updated_at: {
              type: "string",
              format: "date-time",
              example: "2025-01-10T10:20:30.000Z",
            },

            deletet_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },

        CreateInfraccion: {
          type: "object",

          required: [
            "codigo",
            "descripcion",
            "articulo_codigo",
            "tipo_sancion",
            "valor_multa",
          ],

          properties: {
            codigo: {
              type: "string",
              example: "C001",
            },

            descripcion: {
              type: "string",
              example: "Estacionar un vehículo en sitios prohibidos",
            },

            articulo_codigo: {
              type: "string",
              example: "Ley 769/2002 Art. 131 C.1",
            },

            tipo_sancion: {
              type: "string",
              enum: [
                "MONETARIA",
                "SUSPENSION_LICENCIA",
                "INMOVILIZACION",
                "MIXTA",
              ],
              example: "MONETARIA",
            },

            valor_multa: {
              type: "number",
              example: 650000,
            },

            dias_suspension: {
              type: "integer",
              example: 30,
            },

            aplica_descuento: {
              type: "boolean",
              example: true,
            },

            vigente: {
              type: "boolean",
              example: true,
            },
          },
        },

        UpdateInfraccion: {
          type: "object",

          properties: {
            codigo: {
              type: "string",
              example: "C002",
            },

            descripcion: {
              type: "string",
            },

            articulo_codigo: {
              type: "string",
            },

            tipo_sancion: {
              type: "string",
              enum: [
                "MONETARIA",
                "SUSPENSION_LICENCIA",
                "INMOVILIZACION",
                "MIXTA",
              ],
            },

            valor_multa: {
              type: "number",
            },

            dias_suspension: {
              type: "integer",
            },

            aplica_descuento: {
              type: "boolean",
            },

            vigente: {
              type: "boolean",
            },
          },
        },

        ChangeVigencia: {
          type: "object",

          required: ["vigente"],

          properties: {
            vigente: {
              type: "boolean",
              example: false,
            },
          },
        },

        ApiResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            data: {
              $ref: "#/components/schemas/Infraccion",
            },
          },
        },

        ApiResponseList: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Infraccion",
              },
            },
          },
        },

        ApiResponseMessage: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: true,
            },

            message: {
              type: "string",
              example: "Operación realizada correctamente",
            },
          },
        },

        ErrorResponse: {
          type: "object",

          properties: {
            success: {
              type: "boolean",
              example: false,
            },

            message: {
              type: "string",
              example: "Error en la operación",
            },
          },
        },
      },
    },
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };