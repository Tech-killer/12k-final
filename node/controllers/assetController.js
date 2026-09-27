/**
 * ==============================================================================
 * Asset Controller: Digital Asset Management & Expiration Radar (MongoDB Atlas)
 * Powers: AssetTracker.jsx, AdminDashboard.jsx, AIBrainChat.jsx
 * ==============================================================================
 */

const { jsonResponse } = require('../config/db');
const { Asset, Invoice } = require('../models');
const { sendInvoicePaymentEmail } = require('../config/mailer');

/**
 * Safely parses any date string (YYYY-MM-DD, DD-MM-YYYY, ISO) into a local Date.
 */
function parseDateSafe(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;

  const str = String(dateStr).trim();

  // Match DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    return new Date(year, month, day);
  }

  // Match YYYY-MM-DD or YYYY/MM/DD
  const yyyymmdd = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (yyyymmdd) {
    const year = parseInt(yyyymmdd[1], 10);
    const month = parseInt(yyyymmdd[2], 10) - 1;
    const day = parseInt(yyyymmdd[3], 10);
    return new Date(year, month, day);
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Format asset document into camelCase JSON for React frontend.
 */
function formatAssetRow(asset) {
  let daysRemaining = null;
  if (asset.expiry_date) {
    const expiry = parseDateSafe(asset.expiry_date);
    if (expiry) {
      const now = new Date();
      const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()).getTime();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      daysRemaining = Math.round((expiryMidnight - todayMidnight) / (1000 * 60 * 60 * 24));
    }
  }

  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    category: asset.category,
    provider: asset.provider,
    clientName: asset.client_name,
    clientEmail: asset.client_email,
    expiryDate: asset.expiry_date,
    renewalCost: Number(asset.renewal_cost || 0),
    taxRate: Number(asset.tax_rate !== undefined ? asset.tax_rate : 18.0),
    status: asset.status,
    autoRenew: Boolean(asset.auto_renew),
    hsnCode: asset.hsn_code || '998313',
    description: asset.description || '',
    plan: asset.plan || '1-day',
    planDuration: Number(asset.plan_duration || 1),
    planUnit: asset.plan_unit || 'days',
    daysRemaining
  };
}

/**
 * List Assets or Fetch Single Asset
 * GET /api/assets or GET /assets.php
 */
exports.getAssets = async (req, res) => {
  const assetId = req.params.id || req.query.id;
  const filter = req.query.filter || '';
  const category = req.query.category || '';
  const search = req.query.search || '';

  try {
    if (assetId) {
      const asset = await Asset.findOne({ id: assetId });
      if (!asset) {
        return jsonResponse(res, false, null, 'Asset not found.', 404);
      }
      return jsonResponse(res, true, formatAssetRow(asset));
    }

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { client_name: regex },
        { provider: regex }
      ];
    }

    let assets = await Asset.find(query).sort({ expiry_date: 1 });

    // Format rows and compute daysRemaining
    let formattedList = assets.map(formatAssetRow);

    // Apply 15-day expiry radar filter if requested
    if (filter === 'expiring' || filter === 'radar') {
      formattedList = formattedList.filter((a) => a.daysRemaining !== null && a.daysRemaining <= 15);
    }

    return jsonResponse(res, true, formattedList);
  } catch (err) {
    return jsonResponse(res, false, null, `Error querying assets: ${err.message}`, 500);
  }
};

/**
 * Create New Digital Asset
 * POST /api/assets or POST /assets.php
 */
exports.createAsset = async (req, res) => {
  const body = req.body;
  const id = (body.id || `AST-${Math.floor(100 + Math.random() * 900)}`).trim();
  const name = (body.name || '').trim();
  const type = (body.type || 'Domain Registration').trim();
  const category = (body.category || 'Domain').trim();
  const provider = (body.provider || 'Pandharkars Infotech Registrar').trim();
  const clientName = (body.clientName || body.client_name || '').trim();
  const clientEmail = (body.clientEmail || body.client_email || '').trim();
  const expiryDate = (body.expiryDate || body.expiry_date || '').trim();
  const renewalCost = Number(body.renewalCost || body.renewal_cost || 0);
  const taxRate = Number(body.taxRate !== undefined ? body.taxRate : (body.tax_rate !== undefined ? body.tax_rate : 18.0));
  const status = (body.status || 'Due').trim();
  const autoRenew = body.autoRenew || body.auto_renew ? true : false;
  const hsnCode = (body.hsnCode || body.hsn_code || '998313').trim();
  const description = (body.description || '').trim();
  const plan = (body.plan || '1-day').trim();
  let planDuration = Number(body.planDuration || body.plan_duration || 0);
  let planUnit = (body.planUnit || body.plan_unit || '').trim();
  if (!planDuration || !planUnit) {
    if (plan === '1-day') { planDuration = 1; planUnit = 'days'; }
    else if (plan === '3-days') { planDuration = 3; planUnit = 'days'; }
    else if (plan === '6-days') { planDuration = 6; planUnit = 'days'; }
    else if (plan === '15-days') { planDuration = 15; planUnit = 'days'; }
    else if (plan === '3-months') { planDuration = 3; planUnit = 'months'; }
    else if (plan === '6-months') { planDuration = 6; planUnit = 'months'; }
    else if (plan === '12-months') { planDuration = 12; planUnit = 'months'; }
    else if (plan === '3-years') { planDuration = 36; planUnit = 'months'; }
    else { planDuration = 1; planUnit = 'days'; }
  }

  if (!name || !clientName || !expiryDate) {
    return jsonResponse(res, false, null, 'Asset name, client name, and expiry date are required.', 400);
  }

  try {
    const newAsset = await Asset.create({
      id,
      name,
      type,
      category,
      provider,
      client_name: clientName,
      client_email: clientEmail,
      expiry_date: expiryDate,
      renewal_cost: renewalCost,
      tax_rate: taxRate,
      status,
      auto_renew: autoRenew,
      hsn_code: hsnCode,
      plan,
      plan_duration: planDuration,
      plan_unit: planUnit,
      description
    });

    // Auto-generate corresponding proforma invoice for payment settlement
    const currentYear = new Date().getFullYear();
    const nextYearYY = String(currentYear + 1).slice(-2);
    const invNumber = `PIPL/${currentYear}-${nextYearYY}/INV-${Math.floor(850 + Math.random() * 150)}`;
    const subtotal = renewalCost;
    const tax = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    try {
      await Invoice.create({
        invoice_number: invNumber,
        date: new Date().toISOString().slice(0, 10),
        due_date: expiryDate,
        asset_id: id,
        client_name: clientName,
        client_email: clientEmail,
        plan,
        plan_duration: planDuration,
        plan_unit: planUnit,
        items: [{
          description: `${name} - ${type} (${plan}) Subscription Plan`,
          hsn: hsnCode,
          qty: 1,
          rate: subtotal,
          amount: subtotal
        }],
        subtotal,
        cgst: Math.round((tax / 2) * 100) / 100,
        sgst: Math.round((tax / 2) * 100) / 100,
        total,
        status: 'Due'
      });
    } catch (invErr) {
      console.warn('Auto-invoice creation notice:', invErr.message);
    }

    // Determine payment URL: extract origin safely
    let appOrigin = 'http://localhost:5173';
    try {
      const raw = req.headers.origin || req.headers.referer || process.env.APP_URL;
      if (raw) {
        const parsed = new URL(raw);
        appOrigin = parsed.origin;
      }
    } catch {}
    const cleanOrigin = appOrigin.replace(/\/+$/, '');
    const paymentLink = `${cleanOrigin}/?pay_invoice=${encodeURIComponent(invNumber)}&pay_asset=${encodeURIComponent(id)}`;

    let emailResult = null;
    if (clientEmail && clientEmail.includes('@')) {
      try {
        emailResult = await sendInvoicePaymentEmail({
          toEmail: clientEmail,
          clientName: clientName || 'Valued Client',
          assetName: name,
          assetType: type,
          invoiceNumber: invNumber,
          subtotal,
          tax,
          total,
          expiryDate,
          paymentLink
        });
      } catch (mailErr) {
        console.warn('Invoice payment email notice:', mailErr.message);
      }
    }

    return jsonResponse(res, true, {
      id,
      invoiceNumber: invNumber,
      total,
      paymentLink,
      emailDispatched: emailResult ? emailResult.success : false,
      messageId: emailResult ? emailResult.id : null
    }, `Asset registered successfully! Tax invoice & payment link emailed to ${clientEmail || 'client'}.`, 201);
  } catch (err) {
    return jsonResponse(res, false, null, `Error creating asset: ${err.message}`, 500);
  }
};

/**
 * Update Digital Asset
 * PUT /api/assets/:id or PUT /assets.php
 */
exports.updateAsset = async (req, res) => {
  const body = req.body;
  const id = req.params.id || req.query.id || body.id;

  if (!id) {
    return jsonResponse(res, false, null, 'Asset ID is required for update.', 400);
  }

  try {
    const updateFields = {};
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.type !== undefined) updateFields.type = body.type;
    if (body.category !== undefined) updateFields.category = body.category;
    if (body.provider !== undefined) updateFields.provider = body.provider;
    if (body.clientName !== undefined || body.client_name !== undefined) {
      updateFields.client_name = body.clientName || body.client_name;
    }
    if (body.clientEmail !== undefined || body.client_email !== undefined) {
      updateFields.client_email = body.clientEmail || body.client_email;
    }
    if (body.expiryDate !== undefined || body.expiry_date !== undefined) {
      updateFields.expiry_date = body.expiryDate || body.expiry_date;
    }
    if (body.renewalCost !== undefined || body.renewal_cost !== undefined) {
      updateFields.renewal_cost = Number(body.renewalCost || body.renewal_cost);
    }
    if (body.taxRate !== undefined || body.tax_rate !== undefined) {
      updateFields.tax_rate = Number(body.taxRate !== undefined ? body.taxRate : body.tax_rate);
    }
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.autoRenew !== undefined || body.auto_renew !== undefined) {
      updateFields.auto_renew = Boolean(body.autoRenew !== undefined ? body.autoRenew : body.auto_renew);
    }
    if (body.hsnCode !== undefined || body.hsn_code !== undefined) {
      updateFields.hsn_code = body.hsnCode || body.hsn_code;
    }
    if (body.description !== undefined) updateFields.description = body.description;
    updateFields.updated_at = new Date();

    const updated = await Asset.findOneAndUpdate({ id }, { $set: updateFields }, { new: true });

    if (!updated) {
      return jsonResponse(res, false, null, 'Asset not found for update.', 404);
    }

    return jsonResponse(res, true, { id }, 'Asset updated successfully.');
  } catch (err) {
    return jsonResponse(res, false, null, `Error updating asset: ${err.message}`, 500);
  }
};

/**
 * Remove Digital Asset
 * DELETE /api/assets/:id or DELETE /assets.php
 */
exports.deleteAsset = async (req, res) => {
  const id = req.params.id || req.query.id || req.body.id;

  if (!id) {
    return jsonResponse(res, false, null, 'Asset ID is required for deletion.', 400);
  }

  try {
    const result = await Asset.deleteOne({ id });
    if (result.deletedCount === 0) {
      return jsonResponse(res, false, null, 'Asset not found.', 404);
    }
    return jsonResponse(res, true, null, 'Asset removed from inventory.');
  } catch (err) {
    return jsonResponse(res, false, null, `Error deleting asset: ${err.message}`, 500);
  }
};

/**
 * Manually trigger or re-send payment link email to client
 * POST /api/assets/send-payment-link or POST /api/assets/send-link
 */
exports.sendPaymentLink = async (req, res) => {
  const body = req.body;
  const assetId = body.assetId || body.id;
  const invNumber = body.invoiceNumber || body.invoice_number;
  const targetEmail = (body.clientEmail || body.email || '').trim();

  try {
    let asset = null;
    if (assetId) asset = await Asset.findOne({ id: assetId });

    let invoice = null;
    if (invNumber) invoice = await Invoice.findOne({ invoice_number: invNumber });
    else if (assetId) invoice = await Invoice.findOne({ asset_id: assetId }).sort({ _id: -1 });

    if (invoice && (invoice.status === 'Paid' || invoice.payment_link_expired)) {
      return jsonResponse(res, false, {
        invoiceNumber: invoice.invoice_number,
        status: 'Paid',
        linkExpired: true
      }, `Cannot dispatch link: Invoice ${invoice.invoice_number} has already been paid and settled. This payment link has auto-expired.`, 400);
    }

    const recipient = targetEmail || invoice?.client_email || asset?.client_email;
    if (!recipient || !recipient.includes('@')) {
      return jsonResponse(res, false, null, 'A valid recipient client email address is required.', 400);
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
    const assetIdVal = asset?.id || invoice?.asset_id || assetId || 'AST-001';
    const invNumberVal = invoice?.invoice_number || invNumber || `PIPL/2026-27/INV-${Math.floor(850 + Math.random() * 150)}`;
    const paymentLink = `${cleanOrigin}/?pay_invoice=${encodeURIComponent(invNumberVal)}&pay_asset=${encodeURIComponent(assetIdVal)}`;

    const subtotal = Number(invoice?.subtotal || asset?.renewal_cost || 199);
    const tax = invoice ? Number(invoice.cgst + invoice.sgst) : Math.round(subtotal * 0.18 * 100) / 100;
    const total = Number(invoice?.total || Math.round((subtotal + tax) * 100) / 100);

    const emailResult = await sendInvoicePaymentEmail({
      toEmail: recipient,
      clientName: invoice?.client_name || asset?.client_name || 'Valued Client',
      assetName: asset?.name || 'Digital Asset Service',
      assetType: asset?.type || 'IT Cloud Service',
      invoiceNumber: invNumberVal,
      subtotal,
      tax,
      total,
      expiryDate: asset?.expiry_date || invoice?.due_date || 'Due on Receipt',
      paymentLink
    });

    if (!emailResult.success) {
      return jsonResponse(res, false, { paymentLink, recipient, invoiceNumber: invNumberVal }, emailResult.error || 'Failed to dispatch email.', 502);
    }

    return jsonResponse(res, true, {
      messageId: emailResult.id,
      recipient,
      paymentLink
    }, `Payment link & tax invoice successfully dispatched to ${recipient}!`);
  } catch (err) {
    return jsonResponse(res, false, null, `Error dispatching payment link: ${err.message}`, 500);
  }
};
