/**
 * ==============================================================================
 * Transaction Controller: Payment Transactions & Reconciliation Ledger (MongoDB Atlas)
 * Powers: ReconciliationEngine.jsx
 * ==============================================================================
 */

const { jsonResponse } = require('../config/db');
const { Transaction } = require('../models');

/**
 * Format transaction document into camelCase JSON for React frontend.
 */
function formatTxnRow(row) {
  return {
    id: row._id.toString(),
    txnId: row.txn_id,
    invoiceNumber: row.invoice_number,
    clientName: row.client_name,
    assetName: row.asset_name,
    amount: Number(row.amount || 0),
    gateway: row.gateway,
    timestamp: row.timestamp,
    status: row.status,
    reconciled: Boolean(row.reconciled),
    reconciliationNote: row.reconciliation_note || ''
  };
}

/**
 * Fetch All Transactions
 * GET /api/transactions or GET /transactions.php
 */
exports.getTransactions = async (req, res) => {
  try {
    const rows = await Transaction.find().sort({ timestamp: -1 }).limit(100);
    return jsonResponse(res, true, rows.map(formatTxnRow));
  } catch (err) {
    return jsonResponse(res, false, null, `Error querying transactions: ${err.message}`, 500);
  }
};

/**
 * Record New Payment Transaction
 * POST /api/transactions or POST /transactions.php
 */
exports.createTransaction = async (req, res) => {
  const body = req.body;
  const txnId = body.txnId || body.txn_id || `TXN-RZP-${Math.floor(100000 + Math.random() * 900000)}`;
  const invNum = (body.invoiceNumber || body.invoice_number || '').trim();
  const clientName = (body.clientName || body.client_name || '').trim();
  const assetName = (body.assetName || body.asset_name || '').trim();
  const amount = Number(body.amount || 0);
  const gateway = body.gateway || 'Razorpay (UPI / NetBanking)';
  const status = body.status || 'Success';
  const reconciled = body.reconciled !== undefined ? Boolean(body.reconciled) : true;
  const note = body.reconciliationNote || body.reconciliation_note || 'Manual ledger reconciliation.';

  if (!invNum || !clientName) {
    return jsonResponse(res, false, null, 'Invoice number and client name are required.', 400);
  }

  try {
    await Transaction.create({
      txn_id: txnId,
      invoice_number: invNum,
      client_name: clientName,
      asset_name: assetName,
      amount,
      gateway,
      status,
      reconciled,
      reconciliation_note: note
    });

    return jsonResponse(res, true, { txnId }, 'Transaction recorded successfully.', 201);
  } catch (err) {
    return jsonResponse(res, false, null, `Error recording transaction: ${err.message}`, 500);
  }
};
