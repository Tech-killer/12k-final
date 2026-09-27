/**
 * ==============================================================================
 * Master Modular Router Aggregator
 * ==============================================================================
 * Combines all modular routers:
 * - Auth
 * - Assets
 * - Invoices
 * - Dashboard
 * - Company
 * - Cron
 * - Transactions
 * - Reconciliation
 * - Webhook
 * - Database Health & Diagnostics
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const { testDbConnection, jsonResponse } = require('../config/db');

const authRoutes = require('./authRoutes');
const assetRoutes = require('./assetRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const companyRoutes = require('./companyRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const cronRoutes = require('./cronRoutes');
const transactionRoutes = require('./transactionRoutes');
const reconciliationRoutes = require('./reconciliationRoutes');
const webhookRoutes = require('./webhookRoutes');

// 1. Mount Modular Sub-Routers
router.use('/auth', authRoutes);
router.use('/login', authRoutes);
router.use('/assets', assetRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/company', companyRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/cron', cronRoutes);
router.use('/transactions', transactionRoutes);
router.use('/reconciliation', reconciliationRoutes);
router.use('/webhook', webhookRoutes);

// Direct Asset & Renewal Mail Dispatcher Endpoints (PHP-to-Node bridge)
const assetController = require('../controllers/assetController');
const cronController = require('../controllers/cronController');
router.all('/send_asset_mail', assetController.sendPaymentLink);
router.all('/send_asset_mail.php', assetController.sendPaymentLink);
router.all('/send_renewal_mail', cronController.dispatchSingleRenewalEmail);
router.all('/send_renewal_mail.php', cronController.dispatchSingleRenewalEmail);
router.all('/cron_toggle', cronController.toggleCronPause);
router.all('/cron_toggle.php', cronController.toggleCronPause);
router.all('/cron_status', cronController.getCronStatus);
router.all('/cron_status.php', cronController.getCronStatus);

// 2. Database Health & Diagnostic Check (Matching test_db.php)
const handleHealthCheck = async (req, res) => {
  const result = await testDbConnection();
  const wantsJson = req.query.format === 'json' || req.headers.accept?.includes('application/json');

  if (wantsJson || !req.headers.accept?.includes('text/html')) {
    if (result.connected) {
      return jsonResponse(res, true, result, 'MongoDB Atlas connection verified successfully.');
    } else {
      return jsonResponse(res, false, result, `Connection failed: ${result.error}`, 500);
    }
  }

  // HTML Diagnostic view for browser preview
  const countsHtml = result.tableCounts
    ? Object.entries(result.tableCounts)
        .map(([tbl, cnt]) => `<tr><td><code>${tbl}</code></td><td style="text-align:right;font-weight:bold;color:#38bdf8">${cnt}</td></tr>`)
        .join('')
    : '<tr><td colspan="2">No collection data available</td></tr>';

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>PIPL Node.js Backend Diagnostic (MongoDB Atlas)</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #050e1f; color: #e2e8f0; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
        .card { background: #08152e; border: 1px solid #1e3a68; border-radius: 16px; max-width: 600px; width: 100%; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .badge-success { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #059669; }
        .badge-error { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #dc2626; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
        th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #162a4d; }
        th { color: #94a3b8; font-weight: 600; text-transform: uppercase; font-size: 11px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
          <h2 style="margin:0; font-size: 20px; color:#fff;">Pandharkars Infotech (MongoDB Atlas)</h2>
          <span class="badge ${result.connected ? 'badge-success' : 'badge-error'}">${result.connected ? '&#10003; Connected' : '&#10007; Connection Failed'}</span>
        </div>
        <p style="color:#94a3b8; font-size: 13px;">Cloud Cluster: <code style="color:#38bdf8">${result.cluster || '12kmajor.6vm1ma2.mongodb.net'}</code></p>
        <p style="color:#94a3b8; font-size: 13px;">Database: <code style="color:#38bdf8">${result.database}</code></p>
        ${result.connected ? `
          <table>
            <thead><tr><th>Core Table (6-Table Architecture)</th><th style="text-align:right;">Records Count</th></tr></thead>
            <tbody>${countsHtml}</tbody>
          </table>
          <div style="margin-top:20px; font-size:12px; color:#94a3b8;">
            Version: ${result.version}<br>
            Runtime: Node.js ${process.version} (Modular Express Router)
          </div>
        ` : `
          <div style="margin-top:20px; padding:15px; background:rgba(239,68,68,0.1); border:1px solid #ef4444; border-radius:10px; color:#fca5a5;">
            <strong>Error:</strong> ${result.error}
          </div>
        `}
      </div>
    </body>
    </html>
  `);
};

router.get('/health', handleHealthCheck);
router.get('/test_db', handleHealthCheck);
router.get('/test_db.php', handleHealthCheck);

router.get('/', (req, res) => {
  return jsonResponse(res, true, {
    service: 'PIPL Enterprise Modular Node.js API Service',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: {
      routes: [
        '/api/auth (or /login.php)',
        '/api/assets (or /assets.php)',
        '/api/invoices (or /invoices.php)',
        '/api/dashboard (or /dashboard.php)',
        '/api/company (or /company.php)',
        '/api/cron (or /cron.php)',
        '/api/transactions (or /transactions.php)',
        '/api/reconciliation (or /reconciliation.php)',
        '/api/webhook (or /webhook.php)',
        '/api/test_db (or /test_db.php)'
      ]
    }
  }, 'PIPL Node.js API Service is operational.');
});

module.exports = router;
