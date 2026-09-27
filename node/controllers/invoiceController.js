/**
 * ==============================================================================
 * Invoices Controller: GST Billing & Payment Settlement Hub (MongoDB Atlas)
 * Powers: AdminInvoices.jsx, InvoiceModal.jsx, ReconciliationEngine.jsx
 * ==============================================================================
 */

const { jsonResponse } = require('../config/db');
const { Invoice, Asset, Transaction } = require('../models');

/**
 * Format invoice document into camelCase JSON for React frontend.
 */
function formatInvoiceRow(inv) {
  return {
    id: inv._id.toString(),
    invoiceNumber: inv.invoice_number,
    date: inv.date,
    dueDate: inv.due_date,
    assetId: inv.asset_id,
    clientName: inv.client_name,
    clientEmail: inv.client_email,
    clientGstin: inv.client_gstin || '',
    clientAddress: inv.client_address || '',
    items: Array.isArray(inv.items) ? inv.items : [],
    subtotal: Number(inv.subtotal || 0),
    cgst: Number(inv.cgst || 0),
    sgst: Number(inv.sgst || 0),
    total: Number(inv.total || 0),
    status: inv.status,
    paymentMethod: inv.payment_method,
    paidAt: inv.paid_at,
    automatedNoticeSent: Boolean(inv.automated_notice_sent),
    paymentLinkExpired: Boolean(inv.payment_link_expired || inv.status === 'Paid')
  };
}

/**
 * Fetch All Invoices or Single Invoice by Number
 * GET /api/invoices or GET /invoices.php
 */
exports.getInvoices = async (req, res) => {
  const invNum = req.query.invoice_number || req.query.invoiceNumber;
  const status = req.query.status || '';

  try {
    if (invNum) {
      const inv = await Invoice.findOne({ invoice_number: invNum });
      if (!inv) {
        return jsonResponse(res, false, null, 'Invoice not found.', 404);
      }
      return jsonResponse(res, true, formatInvoiceRow(inv));
    }

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const rows = await Invoice.find(query).sort({ due_date: 1, _id: -1 });
    return jsonResponse(res, true, rows.map(formatInvoiceRow));
  } catch (err) {
    return jsonResponse(res, false, null, `Error querying invoices: ${err.message}`, 500);
  }
};

/**
 * Create New Official GST Tax Invoice
 * POST /api/invoices or POST /invoices.php
 */
exports.createInvoice = async (req, res) => {
  const body = req.body;
  const currentYear = new Date().getFullYear();
  const nextYearYY = String(currentYear + 1).slice(-2);
  const defaultInvNum = `PIPL/${currentYear}-${nextYearYY}/INV-${Math.floor(850 + Math.random() * 150)}`;

  const invNumber = (body.invoiceNumber || body.invoice_number || defaultInvNum).trim();
  const date = body.date || new Date().toISOString().slice(0, 10);
  
  // Default due date: +15 days from today
  const defaultDueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const dueDate = body.dueDate || body.due_date || defaultDueDate;

  const assetId = body.assetId || body.asset_id || null;
  const clientName = (body.clientName || body.client_name || '').trim();
  const clientEmail = (body.clientEmail || body.client_email || '').trim();
  const clientGstin = (body.clientGstin || body.client_gstin || '').trim();
  const clientAddress = (body.clientAddress || body.client_address || '').trim();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!clientName || !clientEmail) {
    return jsonResponse(res, false, null, 'Client name and email are required.', 400);
  }

  // Calculate Subtotal & 18% GST (9% CGST + 9% SGST)
  let subtotal = 0;
  for (const item of items) {
    const rate = Number(item.rate || 0);
    const qty = Number(item.qty || 1);
    const amount = item.amount !== undefined ? Number(item.amount) : rate * qty;
    subtotal += amount;
  }

  if (subtotal <= 0 && body.subtotal !== undefined) {
    subtotal = Number(body.subtotal);
  }

  const cgst = Math.round(subtotal * 0.09 * 100) / 100;
  const sgst = Math.round(subtotal * 0.09 * 100) / 100;
  const total = Math.round((subtotal + cgst + sgst) * 100) / 100;
  const status = body.status || 'Due';

  try {
    await Invoice.create({
      invoice_number: invNumber,
      date,
      due_date: dueDate,
      asset_id: assetId,
      client_name: clientName,
      client_email: clientEmail,
      client_gstin: clientGstin,
      client_address: clientAddress,
      items,
      subtotal,
      cgst,
      sgst,
      total,
      status,
      automated_notice_sent: true
    });

    return jsonResponse(res, true, { invoiceNumber: invNumber }, 'Invoice generated successfully.', 201);
  } catch (err) {
    return jsonResponse(res, false, null, `Error generating invoice: ${err.message}`, 500);
  }
};

/**
 * Settle Invoice (Mark Paid, Auto-Extend Asset Validity +365 Days, Record Transaction)
 * PUT or PATCH /api/invoices or /invoices.php
 */
exports.settleInvoice = async (req, res) => {
  const body = req.body;
  const invNumber = req.query.invoice_number || body.invoiceNumber || body.invoice_number;

  if (!invNumber) {
    return jsonResponse(res, false, null, 'Invoice number is required.', 400);
  }

  const newStatus = body.status || 'Paid';
  const paymentMethod = body.paymentMethod || body.payment_method || 'Razorpay Webhook (payment.captured)';

  try {
    const inv = await Invoice.findOne({ invoice_number: invNumber });
    if (!inv) {
      return jsonResponse(res, false, null, 'Invoice not found.', 404);
    }

    if (inv.status === 'Paid' || inv.payment_link_expired) {
      return jsonResponse(res, false, {
        invoiceNumber: invNumber,
        status: 'Paid',
        linkExpired: true
      }, `Payment link has expired. Invoice ${invNumber} has already been paid and settled.`, 400);
    }

    inv.status = newStatus;
    inv.payment_method = paymentMethod;
    if (newStatus === 'Paid') {
      inv.paid_at = new Date();
      inv.payment_link_expired = true;
    }
    await inv.save();

    // If settled as Paid and linked with an asset, extend asset validity by selected plan duration
    let assetExtended = false;
    if (newStatus === 'Paid' && inv.asset_id) {
      const asset = await Asset.findOne({ id: inv.asset_id });
      if (asset) {
        const currentExp = asset.expiry_date ? new Date(asset.expiry_date) : new Date();
        const duration = Number(asset.plan_duration || inv.plan_duration || 1);
        const unit = (asset.plan_unit || inv.plan_unit || (asset.plan && asset.plan.includes('month') ? 'months' : (asset.plan && asset.plan.includes('year') ? 'months' : 'days'))).toLowerCase();

        if (unit === 'days' || unit === 'day') {
          currentExp.setDate(currentExp.getDate() + duration);
        } else {
          currentExp.setMonth(currentExp.getMonth() + duration);
        }
        asset.expiry_date = currentExp.toISOString().slice(0, 10);
        asset.status = 'Active';
        asset.updated_at = new Date();
        await asset.save();
        assetExtended = true;
      }

      // Record transaction in payment reconciliation ledger
      const txnId = `TXN-RZP-${Math.floor(100000 + Math.random() * 900000)}`;
      const durationLabel = `${asset?.plan_duration || 1} ${asset?.plan_unit || 'days'}`;
      await Transaction.create({
        txn_id: txnId,
        invoice_number: invNumber,
        client_name: inv.client_name,
        asset_name: inv.asset_id,
        amount: inv.total,
        gateway: paymentMethod,
        status: 'Success',
        reconciled: true,
        reconciliation_note: `Automated settlement: Invoice marked PAID -> Asset validity extended +${durationLabel}.`
      });
    }

    return jsonResponse(res, true, {
      invoiceNumber: invNumber,
      status: newStatus,
      assetExtended
    }, `Invoice ${invNumber} updated to ${newStatus}.`);
  } catch (err) {
    return jsonResponse(res, false, null, `Error settling invoice: ${err.message}`, 500);
  }
};
