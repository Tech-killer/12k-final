/**
 * ==============================================================================
 * Invoice Routes: GST Invoicing & Payment Settlement Hub
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

const assetController = require('../controllers/assetController');

router.get('/', invoiceController.getInvoices);
router.post('/send-payment-link', assetController.sendPaymentLink);
router.post('/', invoiceController.createInvoice);
router.put('/', invoiceController.settleInvoice);
router.patch('/', invoiceController.settleInvoice);

module.exports = router;
