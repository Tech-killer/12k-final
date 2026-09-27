/**
 * ==============================================================================
 * CRON Routes: 15-Day Autonomous Expiration Sweep Engine
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const cronController = require('../controllers/cronController');

router.get('/', cronController.getCronLogs);
router.post('/', cronController.triggerCronSweep);
router.get('/status', cronController.getCronStatus);
router.post('/toggle-pause', cronController.toggleCronPause);
router.post('/send-single', cronController.dispatchSingleRenewalEmail);

module.exports = router;
