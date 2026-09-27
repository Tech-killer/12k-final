/**
 * ==============================================================================
 * Invoice Model (GST Invoicing & Payment Settlement Hub)
 * Powers: AdminInvoices.jsx, InvoiceModal.jsx
 * ==============================================================================
 */

const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  hsn: { type: String, default: '998313' },
  qty: { type: Number, default: 1 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoice_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  due_date: {
    type: String, // YYYY-MM-DD
    required: true,
    index: true
  },
  asset_id: {
    type: String,
    default: null,
    index: true
  },
  client_name: {
    type: String,
    required: true
  },
  client_email: {
    type: String,
    required: true
  },
  client_gstin: {
    type: String,
    default: ''
  },
  client_address: {
    type: String,
    default: ''
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  cgst: {
    type: Number,
    required: true
  },
  sgst: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: 'Due',
    enum: ['Due', 'Paid', 'Overdue'],
    index: true
  },
  payment_method: {
    type: String,
    default: null
  },
  paid_at: {
    type: Date,
    default: null
  },
  automated_notice_sent: {
    type: Boolean,
    default: true
  },
  payment_link_expired: {
    type: Boolean,
    default: false
  },
  plan: {
    type: String,
    default: '1-day'
  },
  plan_duration: {
    type: Number,
    default: 1
  },
  plan_unit: {
    type: String,
    default: 'days'
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
