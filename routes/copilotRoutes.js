const express = require('express');
const router = express.Router();
const copilotService = require('../services/copilotService');

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
