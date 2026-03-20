import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ms-personas API",
      version: "1.0.0",
      description: "Microservicio de gestión de personas y licencias de conducción del sistema SIMCOMP",
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
        Persona: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            tipo_documento: { type: "string", enum: ["CC", "CE", "TI", "PASAPORTE"] },
            numero_documento: { type: "string" },
            nombres: { type: "string" },
            apellidos: { type: "string" },
            fecha_nacimiento: { type: "string", format: "date" },
            genero: { type: "string", enum: ["M", "F", "O"] },
            direccion: { type: "string" },
            telefono: { type: "string" },
            email: { type: "string", format: "email" },
            estado: { type: "string", enum: ["activo", "inactivo"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        Licencia: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            persona_id: { type: "string", format: "uuid" },
            numero_licencia: { type: "string" },
            categoria: { type: "string", enum: ["A1", "A2", "B1", "B2", "B3", "C1", "C2", "C3"] },
            fecha_expedicion: { type: "string", format: "date" },
            fecha_vencimiento: { type: "string", format: "date" },
            estado: { type: "string", enum: ["vigente", "suspendida", "vencida", "cancelada"] },
            observaciones: { type: "string" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
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