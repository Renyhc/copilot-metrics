const express = require('express');
const copilotRoutes = require('./routes/copilotRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/copilot', copilotRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger/swagger');
const copilotRoutes = require('./routes/copilotRoutes');

const app = express();

// Middleware para Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rutas de la API
app.use('/', copilotRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
