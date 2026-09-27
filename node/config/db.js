/**
 * ==============================================================================
 * PANDHARKARS INFOTECH PRIVATE LIMITED (PIPL)
 * MongoDB Atlas Connection & Standard Response Helper
 * ==============================================================================
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/12k';

/**
 * Standardized JSON response helper matching PHP jsonResponse() format.
 *
 * @param {object} res Express response object
 * @param {boolean} success Boolean indicator
 * @param {*} data Returned payload
 * @param {string} message Optional descriptive message
 * @param {number} statusCode HTTP status code (default: 200)
 */
function jsonResponse(res, success, data = null, message = '', statusCode = 200) {
  const payload = { success };
  if (message !== '') {
    payload.message = message;
    if (!success) {
      payload.error = message;
    }
  }
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
}

/**
 * Connect to MongoDB Atlas
 */
async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true
    });

    console.log(`✅ Connected to MongoDB Atlas Cloud Cluster [${conn.connection.name || '12k'}]`);
    return conn;
  } catch (err) {
    console.error(`❌ MongoDB Atlas Connection Error: ${err.message}`);
    throw err;
  }
}

/**
 * Diagnostic helper to test MongoDB Atlas connectivity and check collection document counts.
 */
async function testDbConnection() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    const { User, CompanyProfile, Asset, Invoice, CronLog, Transaction } = require('../models');

    const tableCounts = {
      users: await User.countDocuments(),
      company_profile: await CompanyProfile.countDocuments(),
      assets: await Asset.countDocuments(),
      invoices: await Invoice.countDocuments(),
      cron_logs: await CronLog.countDocuments(),
      transactions: await Transaction.countDocuments()
    };

    return {
      connected: true,
      database: mongoose.connection.name || '12k (MongoDB Atlas)',
      version: `MongoDB ${mongoose.version}`,
      cluster: '12kmajor.6vm1ma2.mongodb.net',
      tableCounts
    };
  } catch (err) {
    return {
      connected: false,
      database: '12k (MongoDB Atlas)',
      error: err.message || String(err)
    };
  }
}

module.exports = {
  connectDB,
  testDbConnection,
  jsonResponse,
  mongoose
};
