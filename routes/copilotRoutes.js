const express = require('express');
const router = express.Router();
const copilotService = require('../services/copilotService');

/**
 * @swagger
 * /metrics/refresh:
 *   get:
 *     summary: Obtener y exportar métricas actualizadas de GitHub Copilot
 *     tags: [Metrics]
 *     description: Obtiene las métricas más recientes de GitHub Copilot, genera gráficos y exporta los datos
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas actualizadas obtenidas y exportadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetricsResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/metrics/refresh', async (req, res) => {
    try {
        const metrics = await copilotService.getEnterpriseMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enterprise metrics
router.get('/enterprise/metrics', async (req, res) => {
    try {
        const metrics = await copilotService.getEnterpriseMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enterprise team metrics
router.get('/enterprise/team/metrics', async (req, res) => {
    try {
        const metrics = await copilotService.getEnterpriseTeamMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Organization metrics
router.get('/org/metrics', async (req, res) => {
    try {
        const metrics = await copilotService.getOrgMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Organization team metrics
router.get('/org/team/metrics', async (req, res) => {
    try {
        const metrics = await copilotService.getOrgTeamMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
/**
 * @swagger
 * /enterprise/metrics:
 *   get:
 *     summary: Obtiene métricas de Copilot a nivel empresa
 *     tags: [Enterprise]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 raw:
 *                   type: object
 *                   description: Datos crudos de la API de GitHub
 *                 chartData:
 *                   type: object
 *                   description: Datos formateados para gráficos
 *                 summary:
 *                   type: object
 *                   properties:
 *                     overall:
 *                       type: object
 *                     weeklyAverages:
 *                       type: object
 *                     trends:
 *                       type: object
 *                     lastUpdate:
 *                       type: string
 *                 chart:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     filePath:
 *                       type: string
 *                     fileName:
 *                       type: string
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 * 
 * /enterprise/team/metrics:
 *   get:
 *     summary: Obtiene métricas de Copilot para un equipo de la empresa
 *     tags: [Enterprise]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetricsResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 * 
 * /org/metrics:
 *   get:
 *     summary: Obtiene métricas de Copilot a nivel organización
 *     tags: [Organization]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetricsResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 * 
 * /org/team/metrics:
 *   get:
 *     summary: Obtiene métricas de Copilot para un equipo de la organización
 *     tags: [Organization]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetricsResponse'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 * 
 * components:
 *   schemas:
 *     MetricsResponse:
 *       type: object
 *       properties:
 *         raw:
 *           type: object
 *           description: Datos crudos de la API de GitHub
 *         chartData:
 *           type: object
 *           description: Datos formateados para gráficos
 *         summary:
 *           type: object
 *           properties:
 *             overall:
 *               type: object
 *             weeklyAverages:
 *               type: object
 *             trends:
 *               type: object
 *             lastUpdate:
 *               type: string
 *         chart:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *             filePath:
 *               type: string
 *             fileName:
 *               type: string
 */
