/**
 * ==============================================================================
 * Company Profile Model (Statutory Master for Invoices & Dashboard)
 * ==============================================================================
 */

const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'PANDHARKARS INFOTECH PRIVATE LIMITED'
  },
  short_name: {
    type: String,
    required: true,
    default: 'Pandharkars Infotech'
  },
  tagline: {
    type: String,
    default: 'We Manage, Control & Grow Your Business!'
  },
  cin: {
    type: String,
    required: true,
    default: 'U72900MH2021PTC366004'
  },
  gstin: {
    type: String,
    required: true,
    default: '27AAMCP2248L1ZY'
  },
  email: {
    type: String,
    required: true,
    default: 'sales@pandharkarsinfotech.com'
  },
  phone: {
    type: String,
    default: '+91 98220 12345 / +91 (020) 2456-7890'
  },
  address: {
    type: String,
    required: true,
    default: 'Level 4, Infotech Tower, Baner Tech Park, Pune, Maharashtra - 411045, India'
  },
  bank_name: {
    type: String,
    default: 'HDFC Bank Ltd'
  },
  bank_account_number: {
    type: String,
    default: '50200087462910'
  },
  bank_ifsc: {
    type: String,
    default: 'HDFC0001234'
  },
  upi_id: {
    type: String,
    default: 'pandharkarsinfotech@hdfcbank'
  }
});

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
