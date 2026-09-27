/**
 * ==============================================================================
 * Webhook Routes: Automated Payment Gateway Webhook Listener
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

router.post('/', webhookController.handlePaymentWebhook);

module.exports = router;
