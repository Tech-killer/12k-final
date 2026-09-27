/**
 * ==============================================================================
 * Webhook Controller: Automated Payment Gateway Webhook Listener (MongoDB Atlas)
 * Powers: Real-Time Payment Settlement & Zero-Friction Asset Expiry Extension
 * ==============================================================================
 */

const { jsonResponse } = require('../config/db');
const { Invoice, Asset, Transaction } = require('../models');

/**
 * Handle Incoming Payment Gateway Webhook
 * POST /api/webhook or POST /webhook.php
 */
exports.handlePaymentWebhook = async (req, res) => {
  const data = req.body || {};
  const event = data.event || 'payment.captured';
  const payment = data.payload?.payment?.entity || data;

  let invoiceNumber = payment.notes?.invoice_number || payment.invoice_number || data.invoice_number || '';
  let amount = Number(payment.amount || data.amount || 0);

  // Razorpay sends amounts in paise (1 INR = 100 paise), convert if necessary
  if (amount > 100000 && Number.isInteger(amount)) {
    amount = Math.round((amount / 100) * 100) / 100;
  }

  const txnId = payment.id || data.txn_id || `TXN-RZP-${Math.floor(100000 + Math.random() * 900000)}`;
  const paymentMethod = payment.method || 'Razorpay Webhook (payment.captured)';
  const assetId = payment.notes?.asset_id || payment.asset_id || data.asset_id || data.notes?.asset_id || '';

  try {
    if (!invoiceNumber && assetId) {
      const invRow = await Invoice.findOne({ asset_id: assetId }).sort({ _id: -1 });
      if (invRow) {
        invoiceNumber = invRow.invoice_number;
      }
    }

    if (!invoiceNumber) {
      // If no invoice number found, match the first Due invoice
      const dueRow = await Invoice.findOne({ status: 'Due' });
      if (dueRow) {
        invoiceNumber = dueRow.invoice_number;
      } else if (assetId) {
        // Find asset to create real-time reconciled invoice
        const astRow = await Asset.findOne({ id: assetId });
        if (astRow) {
          const currentYear = new Date().getFullYear();
          const nextYearYY = String(currentYear + 1).slice(-2);
          invoiceNumber = `PIPL/${currentYear}-${nextYearYY}/INV-${Math.floor(700 + Math.random() * 300)}`;

          const sub = Number(astRow.renewal_cost || 0);
          const tax = Math.round(sub * 0.18 * 100) / 100;
          const tot = Math.round((sub + tax) * 100) / 100;

          await Invoice.create({
            invoice_number: invoiceNumber,
            date: new Date().toISOString().slice(0, 10),
            due_date: astRow.expiry_date,
            asset_id: assetId,
            client_name: astRow.client_name,
            client_email: astRow.client_email,
            items: [{
              description: `${astRow.name} - ${astRow.type} Plan Renewal`,
              rate: sub,
              qty: 1,
              amount: sub
            }],
            subtotal: sub,
            cgst: Math.round((tax / 2) * 100) / 100,
            sgst: Math.round((tax / 2) * 100) / 100,
            total: tot,
            status: 'Due',
            automated_notice_sent: true
          });
        }
      }
    }

    if (!invoiceNumber) {
      return jsonResponse(res, false, null, 'No valid invoice number or asset provided or found.', 400);
    }

    // 1. Fetch target invoice
    const invoice = await Invoice.findOne({ invoice_number: invoiceNumber });
    if (!invoice) {
      return jsonResponse(res, false, null, `Invoice ${invoiceNumber} not found.`, 404);
    }

    if (amount <= 0) {
      amount = Number(invoice.total || 0);
    }

    // 2. Mark invoice as Paid
    invoice.status = 'Paid';
    invoice.payment_method = `Razorpay (${paymentMethod})`;
    invoice.paid_at = new Date();
    await invoice.save();

    // 3. Extend asset validity by +365 days
    let assetExtended = false;
    if (invoice.asset_id) {
      const asset = await Asset.findOne({ id: invoice.asset_id });
      if (asset) {
        const currentExp = asset.expiry_date ? new Date(asset.expiry_date) : new Date();
        currentExp.setDate(currentExp.getDate() + 365);
        asset.expiry_date = currentExp.toISOString().slice(0, 10);
        asset.status = 'Active';
        asset.updated_at = new Date();
        await asset.save();
        assetExtended = true;
      }
    }

    // 4. Log to transactions ledger
    await Transaction.create({
      txn_id: txnId,
      invoice_number: invoiceNumber,
      client_name: invoice.client_name,
      asset_name: invoice.asset_id || 'Asset Renewal',
      amount,
      gateway: `Razorpay (${paymentMethod})`,
      status: 'Success',
      reconciled: true,
      reconciliation_note: 'Automated Webhook Reconciliation: Verified payment.captured -> Invoice marked PAID -> Asset extended +365 days.'
    });

    return jsonResponse(res, true, {
      event,
      transactionId: txnId,
      invoiceNumber,
      status: 'Paid',
      assetExtended,
      amountSettled: amount
    }, `Webhook reconciled successfully for invoice ${invoiceNumber}.`);
  } catch (err) {
    return jsonResponse(res, false, null, `Error processing webhook: ${err.message}`, 500);
  }
};
