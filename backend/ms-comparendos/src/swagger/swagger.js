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
        url: "http://localhost:8005/api",
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;