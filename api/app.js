const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger/swagger');
const copilotRoutes = require('./routes/copilotRoutes');

// Middleware para Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rutas de la API
app.use('/', copilotRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
