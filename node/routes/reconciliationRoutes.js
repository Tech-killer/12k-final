/**
 * ==============================================================================
 * Reconciliation Routes: Ledger Reconciliation & Webhook Simulation
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const reconciliationController = require('../controllers/reconciliationController');

router.get('/', reconciliationController.getReconciliationState);
router.post('/', reconciliationController.simulateWebhook);

module.exports = router;
