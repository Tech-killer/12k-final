/**
 * ==============================================================================
 * Dashboard Controller: Central Admin Dashboard Telemetry & KPI Analytics (MongoDB Atlas)
 * Powers: AdminDashboard.jsx
 * ==============================================================================
 */

const { jsonResponse } = require('../config/db');
const { Asset, Invoice, CronLog, Transaction } = require('../models');

/**
 * Fetch Central Dashboard Telemetry & KPIs
 * GET /api/dashboard or GET /dashboard.php
 */
exports.getDashboardKpis = async (req, res) => {
  try {
    // 1. Assets telemetry
    const allAssets = await Asset.find();
    const nowTime = new Date().setHours(0, 0, 0, 0);

    let expiringIn15d = 0;
    let criticalIn5d = 0;
    let active = 0;

    for (const a of allAssets) {
      if (a.status === 'Active') active++;
      if (a.expiry_date) {
        const expTime = new Date(a.expiry_date).getTime();
        const days = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));
        if (days <= 15) expiringIn15d++;
        if (days <= 5) criticalIn5d++;
      }
    }

    // 2. Financial & Invoicing telemetry
    const allInvoices = await Invoice.find();
    let dueInvoices = 0;
    let paidInvoices = 0;
    let totalDueAmount = 0;
    let totalPaidAmount = 0;
    let grossVolume = 0;

    for (const inv of allInvoices) {
      const tot = Number(inv.total || 0);
      grossVolume += tot;
      if (inv.status === 'Due') {
        dueInvoices++;
        totalDueAmount += tot;
      } else if (inv.status === 'Paid') {
        paidInvoices++;
        totalPaidAmount += tot;
      }
    }

    // 3. Latest CRON Sweep status
    const latestCronDoc = await CronLog.findOne().sort({ timestamp: -1 });
    let latestCron = null;
    if (latestCronDoc) {
      latestCron = {
        id: latestCronDoc.id,
        timestamp: latestCronDoc.timestamp,
        event: latestCronDoc.event,
        status: latestCronDoc.status,
        assets_evaluated: latestCronDoc.assets_evaluated,
        expiring_detected: latestCronDoc.expiring_detected,
        emails_dispatched: latestCronDoc.emails_dispatched
      };
    }

    // 4. Latest Payment Webhook Transaction
    const latestTxnDoc = await Transaction.findOne().sort({ timestamp: -1 });
    let latestTxn = null;
    if (latestTxnDoc) {
      latestTxn = {
        txn_id: latestTxnDoc.txn_id,
        invoice_number: latestTxnDoc.invoice_number,
        client_name: latestTxnDoc.client_name,
        amount: Number(latestTxnDoc.amount || 0),
        status: latestTxnDoc.status,
        timestamp: latestTxnDoc.timestamp
      };
    }

    const dashboardData = {
      assets: {
        total: allAssets.length,
        expiringIn15d,
        criticalIn5d,
        active
      },
      financials: {
        totalInvoices: allInvoices.length,
        dueInvoices,
        paidInvoices,
        totalDueAmount: Math.round(totalDueAmount * 100) / 100,
        totalPaidAmount: Math.round(totalPaidAmount * 100) / 100,
        grossVolume: Math.round(grossVolume * 100) / 100
      },
      cronEngine: {
        active: true,
        schedule: 'Daily at 00:00:00 UTC',
        latestRun: latestCron
      },
      latestTransaction: latestTxn
    };

    return jsonResponse(res, true, dashboardData, 'Dashboard KPIs computed successfully.');
  } catch (err) {
    return jsonResponse(res, false, null, `Error computing dashboard metrics: ${err.message}`, 500);
  }
};
