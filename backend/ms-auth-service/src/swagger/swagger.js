import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ms-auth-service API",
      version: "1.0.0",
      description: "Microservicio de autenticación y gestión de usuarios",
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
        LoginRequest: {
          type: "object",
          required: ["identifier", "password"],
          properties: {
            identifier: { type: "string", example: "admin@simcomp.gov.co" },
            password: { type: "string", example: "Admin123*" },
          },
        },
        UserRequest: {
          type: "object",
          required: ["username", "email", "password", "rol"],
          properties: {
            username: { type: "string", example: "jdoe" },
            email: { type: "string", example: "jdoe@example.com" },
            password: { type: "string", example: "User123*" },
            rol: { type: "string", enum: ["admin", "agente", "supervisor", "ciudadano"], example: "ciudadano" },
            estado: { type: "string", enum: ["activo", "inactivo"], example: "activo" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            username: { type: "string" },
            email: { type: "string" },
            rol: { type: "string", enum: ["admin", "agente", "supervisor", "ciudadano"] },
            estado: { type: "string", enum: ["activo", "inactivo"] },
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

export { swaggerUi, swaggerSpec };