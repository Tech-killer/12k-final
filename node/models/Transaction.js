/**
 * ==============================================================================
 * Transaction Model (Payment Transactions & Reconciliation Ledger)
 * Powers: ReconciliationEngine.jsx
 * ==============================================================================
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  txn_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  invoice_number: {
    type: String,
    required: true,
    index: true
  },
  client_name: {
    type: String,
    required: true
  },
  asset_name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  gateway: {
    type: String,
    default: 'Razorpay (UPI / NetBanking)'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    default: 'Success'
  },
  reconciled: {
    type: Boolean,
    default: true
  },
  reconciliation_note: {
    type: String,
    default: 'Automated ledger reconciliation.'
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
