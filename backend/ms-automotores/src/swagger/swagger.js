import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Automotores Service API",
      version: "1.0.0",
      description: "Microservicio para la gestión de automotores",
    },

    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || "http://localhost:8003",
        description: "Servidor de API",
      },
    ],

    components: {
      schemas: {

        Automotor: {
          type: "object",
          properties: {
            automotor_id: {
              type: "string",
              format: "uuid",
              example: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3",
            },
            placa: {
              type: "string",
              example: "ABC123",
            },
            tipo: {
              type: "string",
              enum: [
                "MOTO",
                "CARRO",
                "BUS",
                "BUSETA",
                "CAMION",
                "TRACTOMULA",
                "CUATRIMOTO",
              ],
              example: "CARRO",
            },
            marca: {
              type: "string",
              example: "Toyota",
            },
            modelo: {
              type: "string",
              example: "Corolla",
            },
            anio: {
              type: "integer",
              example: 2022,
            },
            color: {
              type: "string",
              example: "Rojo",
            },
            cilindraje: {
              type: "integer",
              example: 1800,
            },
            estado: {
              type: "string",
              enum: [
                "LEGAL",
                "REPORTADO_ROBO",
                "RECUPERADO",
                "EMBARGADO",
              ],
              example: "LEGAL",
            },
            propietario_id: {
              type: "string",
              format: "uuid",
              example: "d1c8c3c2-1f0c-4c11-8d5a-7f0b8c1e9f22",
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
            deleted_at: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
          },
        },

        CreateAutomotor: {
          type: "object",
          required: [
            "placa",
            "tipo",
            "marca",
            "modelo",
            "anio",
            "color",
            "cilindraje",
            "propietario_id",
          ],
          properties: {
            placa: {
              type: "string",
              example: "ABC123",
            },
            tipo: {
              type: "string",
              enum: [
                "MOTO",
                "CARRO",
                "BUS",
                "BUSETA",
                "CAMION",
                "TRACTOMULA",
                "CUATRIMOTO",
              ],
              example: "CARRO",
            },
            marca: {
              type: "string",
              example: "Toyota",
            },
            modelo: {
              type: "string",
              example: "Corolla",
            },
            anio: {
              type: "integer",
              example: 2022,
            },
            color: {
              type: "string",
              example: "Negro",
            },
            cilindraje: {
              type: "integer",
              example: 1800,
            },
            estado: {
              type: "string",
              enum: [
                "LEGAL",
                "REPORTADO_ROBO",
                "RECUPERADO",
                "EMBARGADO",
              ],
              example: "LEGAL",
            },
            propietario_id: {
              type: "string",
              format: "uuid",
              example: "d1c8c3c2-1f0c-4c11-8d5a-7f0b8c1e9f22",
            },
          },
        },

        UpdateAutomotor: {
          type: "object",
          properties: {
            placa: {
              type: "string",
              example: "ABC123",
            },
            tipo: {
              type: "string",
            },
            marca: {
              type: "string",
            },
            modelo: {
              type: "string",
            },
            anio: {
              type: "integer",
            },
            color: {
              type: "string",
            },
            cilindraje: {
              type: "integer",
            },
            estado: {
              type: "string",
            },
            propietario_id: {
              type: "string",
              format: "uuid",
            },
          },
        },

        ChangeEstado: {
          type: "object",
          required: ["estado"],
          properties: {
            estado: {
              type: "string",
              enum: [
                "LEGAL",
                "REPORTADO_ROBO",
                "RECUPERADO",
                "EMBARGADO",
              ],
              example: "REPORTADO_ROBO",
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
              type: "object",
            },
            message: {
              type: "string",
              example: "Operación realizada correctamente",
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