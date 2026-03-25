import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ms-comparendos API",
      version: "1.0.0",
      description: "Microservicio de comparendos del sistema SIMCOMP",
    },
    servers: [
      {
        url: "/api",
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
        Comparendo: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            numero_comparendo: { type: "string" },
            ciudadano_documento: { type: "string" },
            ciudadano_nombre: { type: "string" },
            agente_documento: { type: "string" },
            agente_nombre: { type: "string" },
            placa_vehiculo: { type: "string" },
            infraccion_codigo: { type: "string" },
            infraccion_descripcion: { type: "string" },
            valor_multa: { type: "number" },
            fecha_comparendo: { type: "string", format: "date-time" },
            lugar: { type: "string" },
            ciudad: { type: "string" },
            observaciones: { type: "string" },
            estado: { type: "string", enum: ["PENDIENTE", "PAGADO", "ANULADO"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
          },
        },
        ComparendoEstadoHistorial: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            comparendo_id: { type: "string", format: "uuid" },
            estado_anterior: { type: "string", enum: ["PENDIENTE", "PAGADO", "ANULADO"], nullable: true },
            estado_nuevo: { type: "string", enum: ["PENDIENTE", "PAGADO", "ANULADO"] },
            observacion: { type: "string" },
            fecha_evento: { type: "string", format: "date-time" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            deleted_at: { type: "string", format: "date-time", nullable: true },
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

export default swaggerSpec;