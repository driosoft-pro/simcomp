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
        url: process.env.SWAGGER_SERVER_URL ? `${process.env.SWAGGER_SERVER_URL}/api` : "http://localhost:8002/api",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;