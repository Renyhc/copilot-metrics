const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GitHub Copilot Metrics API',
      version: '1.0.0',
      description: 'API para obtener métricas de uso de GitHub Copilot',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      BearerAuth: [],
    }],
  },
  apis: ['./api/routes/*.js'], // Rutas donde están los comentarios de Swagger
};

const specs = swaggerJsdoc(options);

module.exports = specs;
