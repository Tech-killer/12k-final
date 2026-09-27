/**
 * ==============================================================================
 * Dashboard Routes: Central KPI Telemetry & Analytics
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/', dashboardController.getDashboardKpis);

module.exports = router;
