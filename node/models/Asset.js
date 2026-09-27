/**
 * ==============================================================================
 * Asset Model (Digital Asset Inventory & 15-Day Expiration Radar)
 * Powers: AssetTracker.jsx, AdminDashboard.jsx
 * ==============================================================================
 */

const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    default: 'Domain Registration'
  },
  category: {
    type: String,
    required: true,
    default: 'Domain'
  },
  provider: {
    type: String,
    default: 'Pandharkars Infotech Registrar'
  },
  client_name: {
    type: String,
    required: true,
    trim: true
  },
  client_email: {
    type: String,
    required: true,
    trim: true
  },
  expiry_date: {
    type: String, // Stored as YYYY-MM-DD
    required: true,
    index: true
  },
  renewal_cost: {
    type: Number,
    required: true,
    default: 1399
  },
  tax_rate: {
    type: Number,
    default: 18.00
  },
  status: {
    type: String,
    default: 'Active',
    index: true
  },
  auto_renew: {
    type: Boolean,
    default: false
  },
  hsn_code: {
    type: String,
    default: '998313'
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
  },
  description: {
    type: String,
    default: ''
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Asset', assetSchema);
