/**
 * ==============================================================================
 * Cron Log Model (Automated 15-Day Sweep Engine Logs)
 * Powers: NotificationEngine.jsx
 * ==============================================================================
 */

const mongoose = require('mongoose');

const cronLogSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  event: {
    type: String,
    required: true,
    default: 'CRON Engine Daily 15-Day Expiry Sweep'
  },
  status: {
    type: String,
    default: 'Success'
  },
  assets_evaluated: {
    type: Number,
    default: 0
  },
  expiring_detected: {
    type: Number,
    default: 0
  },
  emails_dispatched: {
    type: Number,
    default: 0
  },
  invoices_generated: {
    type: Number,
    default: 0
  },
  details: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('CronLog', cronLogSchema);
