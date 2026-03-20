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
        url: "/api",
        description: "Servidor de API",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Automotor: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              example: "7c3f0d9e-6f27-4c4e-b88a-9e0b41c5d8c3",
            },
            placa: {
              type: "string",
              example: "ABC123",
            },
            vin: {
              type: "string",
              example: "9BWZZZ377VT004321",
            },
            numero_motor: {
              type: "string",
              example: "MTR2142020",
            },
            numero_chasis: {
              type: "string",
              example: "CHS2142020",
            },
            marca: {
              type: "string",
              example: "Toyota",
            },
            linea: {
              type: "string",
              example: "Corolla",
            },
            modelo: {
              type: "integer",
              example: 2022,
            },
            color: {
              type: "string",
              example: "Rojo",
            },
            clase: {
              type: "string",
              enum: ["AUTOMOVIL", "MOTOCICLETA", "CAMIONETA", "CAMPERO", "BUS", "CAMION"],
              example: "AUTOMOVIL",
            },
            servicio: {
              type: "string",
              enum: ["PARTICULAR", "PUBLICO", "OFICIAL"],
              example: "PARTICULAR",
            },
            propietario_documento: {
              type: "string",
              example: "1010001001",
            },
            propietario_nombre: {
              type: "string",
              example: "Juan Perez",
            },
            condicion: {
              type: "string",
              enum: ["LEGAL", "REPORTADO_ROBO", "RECUPERADO", "EMBARGADO"],
              example: "LEGAL",
            },
            estado: {
              type: "string",
              enum: ["activo", "inactivo", "inmovilizado"],
              example: "activo",
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
          },
        },
        CreateAutomotor: {
          type: "object",
          required: [
            "placa",
            "vin",
            "numero_motor",
            "numero_chasis",
            "marca",
            "linea",
            "modelo",
            "color",
            "clase",
            "propietario_documento",
            "propietario_nombre",
          ],
          properties: {
            placa: { type: "string", example: "KLS908" },
            vin: { type: "string", example: "9BWZZZ377VT001234" },
            numero_motor: { type: "string", example: "MTR123456" },
            numero_chasis: { type: "string", example: "CHS123456" },
            marca: { type: "string", example: "Mazda" },
            linea: { type: "string", example: "CX-5" },
            modelo: { type: "integer", example: 2024 },
            color: { type: "string", example: "Gris" },
            clase: { type: "string", enum: ["AUTOMOVIL", "MOTOCICLETA", "CAMIONETA", "CAMPERO", "BUS", "CAMION"], example: "CAMIONETA" },
            servicio: { type: "string", enum: ["PARTICULAR", "PUBLICO", "OFICIAL"], example: "PARTICULAR" },
            propietario_documento: { type: "string", example: "1010001001" },
            propietario_nombre: { type: "string", example: "Juan Perez" },
            condicion: { type: "string", enum: ["LEGAL", "REPORTADO_ROBO", "RECUPERADO", "EMBARGADO"], example: "LEGAL" },
          },
        },

        UpdateAutomotor: {
          type: "object",
          properties: {
            placa: { type: "string", example: "KLS908" },
            vin: { type: "string", example: "9BWZZZ377VT001234" },
            numero_motor: { type: "string", example: "MTR123456" },
            numero_chasis: { type: "string", example: "CHS123456" },
            marca: { type: "string", example: "Mazda" },
            linea: { type: "string", example: "CX-5" },
            modelo: { type: "integer", example: 2024 },
            color: { type: "string", example: "Blanco" },
            clase: { type: "string", enum: ["AUTOMOVIL", "MOTOCICLETA", "CAMIONETA", "CAMPERO", "BUS", "CAMION"], example: "CAMIONETA" },
            servicio: { type: "string", enum: ["PARTICULAR", "PUBLICO", "OFICIAL"], example: "PARTICULAR" },
            propietario_documento: { type: "string", example: "1010001001" },
            propietario_nombre: { type: "string", example: "Juan Perez" },
            condicion: { type: "string", enum: ["LEGAL", "REPORTADO_ROBO", "RECUPERADO", "EMBARGADO"], example: "LEGAL" },
            estado: { type: "string", enum: ["activo", "inactivo", "inmovilizado"], example: "activo" },
          },
        },
        ChangeEstado: {
          type: "object",
          required: ["condicion"],
          properties: {
            condicion: {
              type: "string",
              enum: ["LEGAL", "REPORTADO_ROBO", "RECUPERADO", "EMBARGADO"],
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };