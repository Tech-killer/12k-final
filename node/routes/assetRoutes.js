/**
 * ==============================================================================
 * Asset Routes: Digital Asset Inventory & 15-Day Expiration Radar
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAssets);
router.post('/send-payment-link', assetController.sendPaymentLink);
router.post('/resend-payment-link', assetController.sendPaymentLink);
router.post('/resend-mail', assetController.sendPaymentLink);
router.post('/send-link', assetController.sendPaymentLink);
router.post('/', assetController.createAsset);
router.put('/', assetController.updateAsset);
router.put('/:id', assetController.updateAsset);
router.delete('/', assetController.deleteAsset);
router.delete('/:id', assetController.deleteAsset);

module.exports = router;
