/**
 * ==============================================================================
 * CRON Controller: Autonomous 15-Day CRON Sweep & Email Notification Engine (MongoDB Atlas)
 * Powers: NotificationEngine.jsx & Background Expiry Sweep
 * ==============================================================================
 */

const { jsonResponse } = require('../config/db');
const { CronLog, Asset, Invoice } = require('../models');
const { sendRenewalReminderEmail } = require('../config/mailer');

// Autonomous CRON Scheduling State (In-Memory + Database Logged)
let cronState = {
  isPaused: false,
  autoSweepEnabled: true,
  intervalMinutes: 60,
  lastRun: new Date(),
  nextScheduledRun: new Date(Date.now() + 60 * 60 * 1000)
};

/**
 * Format cron log document into camelCase JSON for React frontend.
 */
function formatCronLogRow(row) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    event: row.event,
    status: row.status,
    assetsEvaluated: Number(row.assets_evaluated || 0),
    expiringDetected: Number(row.expiring_detected || 0),
    emailsDispatched: Number(row.emails_dispatched || 0),
    invoicesGenerated: Number(row.invoices_generated || 0),
    details: row.details
  };
}

/**
 * Fetch Current CRON Status (Active vs. Paused)
 * GET /api/cron/status or GET /cron_status.php
 */
exports.getCronStatus = async (req, res) => {
  return jsonResponse(res, true, {
    ...cronState,
    currentTime: new Date()
  }, `CRON auto-scheduler is currently ${cronState.isPaused ? 'PAUSED' : 'ACTIVE'}.`);
};

/**
 * Toggle CRON Auto-Scheduler Pause / Resume
 * POST /api/cron/toggle-pause or POST /cron_toggle.php
 */
exports.toggleCronPause = async (req, res) => {
  try {
    const shouldPause = req.body.isPaused !== undefined ? Boolean(req.body.isPaused) : !cronState.isPaused;
    cronState.isPaused = shouldPause;
    cronState.lastRun = new Date();
    cronState.nextScheduledRun = new Date(Date.now() + cronState.intervalMinutes * 60 * 1000);

    const eventName = shouldPause ? 'CRON Auto-Scheduler Paused' : 'CRON Auto-Scheduler Resumed';
    const statusTag = shouldPause ? 'Paused' : 'Active';
    const details = shouldPause
      ? 'Administrator paused autonomous 15-day background email dispatch. Automated emails will not be sent until resumed.'
      : 'Administrator resumed autonomous 15-day background email dispatch. Automated sweeps are now active on schedule.';

    const logId = `CRON-STATE-${Math.floor(100 + Math.random() * 900)}`;

    await CronLog.create({
      id: logId,
      timestamp: new Date(),
      event: eventName,
      status: statusTag,
      assets_evaluated: 0,
      expiring_detected: 0,
      emails_dispatched: 0,
      invoices_generated: 0,
      details
    });

    return jsonResponse(res, true, {
      ...cronState,
      logId,
      message: `CRON auto-scheduler has been ${shouldPause ? 'PAUSED' : 'RESUMED'}.`
    });
  } catch (err) {
    return jsonResponse(res, false, null, `Error toggling CRON state: ${err.message}`, 500);
  }
};

/**
 * Fetch Recent CRON Logs
 * GET /api/cron or GET /cron.php
 */
exports.getCronLogs = async (req, res) => {
  try {
    const rows = await CronLog.find().sort({ timestamp: -1 }).limit(50);
    return jsonResponse(res, true, rows.map(formatCronLogRow));
  } catch (err) {
    return jsonResponse(res, false, null, `Error querying cron logs: ${err.message}`, 500);
  }
};

/**
 * Internal Worker to execute the 15-day sweep and email dispatch
 */
async function executeSweepLogic(origin = 'http://localhost:5173') {
  const totalAssets = await Asset.countDocuments();
  const allAssets = await Asset.find();
  const nowTime = new Date().setHours(0, 0, 0, 0);

  const expiringAssets = [];
  for (const asset of allAssets) {
    if (asset.expiry_date) {
      const expTime = new Date(asset.expiry_date).getTime();
      const days = Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24));
      if (days <= 15) {
        expiringAssets.push({ asset, daysLeft: days });
      }
    }
  }

  const expiringCount = expiringAssets.length;
  let invoicesCreated = 0;
  let emailsDispatched = 0;
  const detailsList = [];

  const currentYear = new Date().getFullYear();
  const nextYearYY = String(currentYear + 1).slice(-2);

  for (const { asset, daysLeft } of expiringAssets) {
    let existingInv = await Invoice.findOne({
      asset_id: asset.id,
      status: 'Due'
    });

    let invNumber = existingInv ? existingInv.invoice_number : '';
    const subtotal = Number(asset.renewal_cost || 99);
    const cgst = Math.round(subtotal * 0.09 * 100) / 100;
    const sgst = Math.round(subtotal * 0.09 * 100) / 100;
    const total = Math.round((subtotal + cgst + sgst) * 100) / 100;

    if (!existingInv) {
      invNumber = `PIPL/${currentYear}-${nextYearYY}/INV-${Math.floor(850 + Math.random() * 150)}`;

      await Invoice.create({
        invoice_number: invNumber,
        date: new Date().toISOString().slice(0, 10),
        due_date: asset.expiry_date,
        asset_id: asset.id,
        client_name: asset.client_name,
        client_email: asset.client_email,
        plan: asset.plan || '1-day',
        plan_duration: asset.plan_duration || 1,
        plan_unit: asset.plan_unit || 'days',
        items: [{
          description: `${asset.name} - ${asset.type || 'Service'} Renewal Extension`,
          hsn: asset.hsn_code || '998313',
          qty: 1,
          rate: subtotal,
          amount: subtotal
        }],
        subtotal,
        cgst,
        sgst,
        total,
        status: 'Due',
        automated_notice_sent: true
      });

      invoicesCreated++;
    }

    const cleanOrigin = origin.replace(/\/+$/, '');
    const paymentLink = `${cleanOrigin}/?pay_invoice=${encodeURIComponent(invNumber)}&pay_asset=${encodeURIComponent(asset.id)}`;

    // Dispatch branded renewal email to client
    if (asset.client_email && asset.client_email.includes('@')) {
      try {
        const mailRes = await sendRenewalReminderEmail({
          toEmail: asset.client_email,
          clientName: asset.client_name || 'Valued Client',
          assetName: asset.name,
          assetType: asset.type || 'Cloud & Domain Service',
          invoiceNumber: invNumber,
          subtotal,
          tax: cgst + sgst,
          total,
          expiryDate: asset.expiry_date,
          daysLeft,
          planDuration: asset.plan_duration || 1,
          planUnit: asset.plan_unit || 'days',
          paymentLink
        });
        if (mailRes.success) {
          emailsDispatched++;
        }
      } catch (mailErr) {
        console.warn(`[CRON Mail] Notice dispatching to ${asset.client_email}:`, mailErr.message);
      }
    }

    detailsList.push(`${asset.name} (${asset.client_name}) expiring in ${daysLeft} days`);
  }

  const logId = `CRON-${Math.floor(910 + Math.random() * 90)}`;
  const detailsText = expiringCount > 0
    ? `Evaluated ${totalAssets} assets. Detected ${expiringCount} within 15-day radar: ${detailsList.slice(0, 3).join(', ')}. Dispatched branded renewal emails with payment links.`
    : `Evaluated ${totalAssets} assets. All customer assets are currently healthy and outside the 15-day critical window.`;

  await CronLog.create({
    id: logId,
    timestamp: new Date(),
    event: 'CRON Engine Daily 15-Day Expiry Sweep',
    status: 'Success',
    assets_evaluated: totalAssets,
    expiring_detected: expiringCount,
    emails_dispatched: emailsDispatched,
    invoices_generated: invoicesCreated,
    details: detailsText
  });

  cronState.lastRun = new Date();
  cronState.nextScheduledRun = new Date(Date.now() + cronState.intervalMinutes * 60 * 1000);

  return {
    cronLogId: logId,
    assetsEvaluated: totalAssets,
    expiringDetected: expiringCount,
    emailsDispatched,
    invoicesGenerated: invoicesCreated,
    details: detailsText
  };
}

/**
 * Trigger Immediate 15-Day Database Sweep
 * POST /api/cron or POST /cron.php
 */
exports.triggerCronSweep = async (req, res) => {
  try {
    let appOrigin = 'http://localhost:5173';
    try {
      const raw = req.headers.origin || req.headers.referer || process.env.APP_URL;
      if (raw) {
        const parsed = new URL(raw);
        appOrigin = parsed.origin;
      }
    } catch {}

    const result = await executeSweepLogic(appOrigin);

    return jsonResponse(res, true, result, 'Automated 15-day CRON sweep completed successfully.');
  } catch (err) {
    return jsonResponse(res, false, null, `Error executing CRON sweep: ${err.message}`, 500);
  }
};

/**
 * Dispatch Renewal Notice Separately / Manually for a Single Asset
 * POST /api/cron/send-single or POST /send_renewal_mail.php
 */
exports.dispatchSingleRenewalEmail = async (req, res) => {
  try {
    const { assetId, id, clientEmail, email } = req.body;
    const targetId = assetId || id;
    const targetEmail = clientEmail || email;

    let asset = null;
    if (targetId) {
      asset = await Asset.findOne({ id: targetId });
    }
    if (!asset && targetEmail) {
      asset = await Asset.findOne({ client_email: targetEmail });
    }
    if (!asset) {
      // Pick first asset as fallback
      asset = await Asset.findOne();
    }

    if (!asset) {
      return jsonResponse(res, false, null, 'No matching asset found to dispatch renewal notice.', 404);
    }

    const currentYear = new Date().getFullYear();
    const nextYearYY = String(currentYear + 1).slice(-2);

    let existingInv = await Invoice.findOne({
      asset_id: asset.id,
      status: 'Due'
    });

    let invNumber = existingInv ? existingInv.invoice_number : `PIPL/${currentYear}-${nextYearYY}/INV-${Math.floor(850 + Math.random() * 150)}`;
    const subtotal = Number(asset.renewal_cost || 99);
    const cgst = Math.round(subtotal * 0.09 * 100) / 100;
    const sgst = Math.round(subtotal * 0.09 * 100) / 100;
    const total = Math.round((subtotal + cgst + sgst) * 100) / 100;

    if (!existingInv) {
      await Invoice.create({
        invoice_number: invNumber,
        date: new Date().toISOString().slice(0, 10),
        due_date: asset.expiry_date,
        asset_id: asset.id,
        client_name: asset.client_name,
        client_email: asset.client_email,
        plan: asset.plan || '1-day',
        plan_duration: asset.plan_duration || 1,
        plan_unit: asset.plan_unit || 'days',
        items: [{
          description: `${asset.name} - ${asset.type || 'Service'} Renewal Extension`,
          hsn: asset.hsn_code || '998313',
          qty: 1,
          rate: subtotal,
          amount: subtotal
        }],
        subtotal,
        cgst,
        sgst,
        total,
        status: 'Due',
        automated_notice_sent: true
      });
    }

    let appOrigin = 'http://localhost:5173';
    try {
      const raw = req.headers.origin || req.headers.referer || process.env.APP_URL;
      if (raw) {
        const parsed = new URL(raw);
        appOrigin = parsed.origin;
      }
    } catch {}

    const cleanOrigin = appOrigin.replace(/\/+$/, '');
    const paymentLink = `${cleanOrigin}/?pay_invoice=${encodeURIComponent(invNumber)}&pay_asset=${encodeURIComponent(asset.id)}`;

    // Calculate days remaining
    const nowTime = new Date().setHours(0, 0, 0, 0);
    const expTime = new Date(asset.expiry_date).getTime();
    const daysLeft = Math.max(1, Math.ceil((expTime - nowTime) / (1000 * 60 * 60 * 24)));

    const recipientEmail = targetEmail || asset.client_email;

    const mailRes = await sendRenewalReminderEmail({
      toEmail: recipientEmail,
      clientName: asset.client_name || 'Valued Client',
      assetName: asset.name,
      assetType: asset.type || 'Cloud & Domain Service',
      invoiceNumber: invNumber,
      subtotal,
      tax: cgst + sgst,
      total,
      expiryDate: asset.expiry_date,
      daysLeft,
      planDuration: asset.plan_duration || 1,
      planUnit: asset.plan_unit || 'days',
      paymentLink
    });

    // Log manual dispatch
    const logId = `CRON-MANUAL-${Math.floor(100 + Math.random() * 900)}`;
    await CronLog.create({
      id: logId,
      timestamp: new Date(),
      event: 'Manual Outbound Renewal Email Dispatched',
      status: mailRes.success ? 'Success' : 'Notice',
      assets_evaluated: 1,
      expiring_detected: 1,
      emails_dispatched: mailRes.success ? 1 : 0,
      invoices_generated: existingInv ? 0 : 1,
      details: `Administrator manually dispatched branded renewal notice with payment link for ${asset.name} to ${recipientEmail}.`
    });

    return jsonResponse(res, true, {
      logId,
      assetId: asset.id,
      assetName: asset.name,
      clientEmail: recipientEmail,
      invoiceNumber: invNumber,
      total,
      paymentLink,
      mailResult: mailRes
    }, `Renewal reminder email dispatched to ${recipientEmail} via Hostinger SMTP.`);
  } catch (err) {
    return jsonResponse(res, false, null, `Error dispatching renewal email: ${err.message}`, 500);
  }
};

// Background Interval Runner: Every 60 minutes
setInterval(async () => {
  if (cronState.isPaused) {
    return;
  }
  try {
    await executeSweepLogic();
  } catch (err) {
    console.warn('[Auto CRON Interval] Notice:', err.message);
  }
}, 60 * 60 * 1000);
