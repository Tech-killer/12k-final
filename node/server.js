/**
 * ==============================================================================
 * PANDHARKARS INFOTECH PRIVATE LIMITED (PIPL)
 * Enterprise Node.js Modular Backend Server
 * ==============================================================================
 * Architecture:
 * - config/      -> MySQL2 Connection Pool & Helpers
 * - controllers/ -> Business Logic & Database Operations
 * - routes/      -> Express Modular Routers & Endpoint Definitions
 * ==============================================================================
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Hostinger Authenticated SMTP Active: noreply@transporter.solutions (smtp.hostinger.com:465)
dotenv.config({ path: path.join(__dirname, '.env') });

const masterRouter = require('./routes');
const { connectDB, testDbConnection, jsonResponse } = require('./config/db');
const { seedInitialData } = require('./models');

const app = express();
const PORT = process.env.PORT || 8000;

// 1. Cross-Origin Resource Sharing (CORS) - matching PHP backend headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

// 2. Request Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Transparent PHP-to-Node Compatibility Layer
// Automatically maps requests like /assets.php -> /assets, /test_db.php -> /test_db
// This ensures that React frontend apiService.js works out of the box with zero modifications!
app.use((req, res, next) => {
  const urlParts = req.url.split('?');
  const pathname = urlParts[0];
  const query = urlParts[1] ? `?${urlParts[1]}` : '';

  if (pathname.endsWith('.php')) {
    const cleanedPath = pathname.slice(0, -4);
    req.url = (cleanedPath || '/') + query;
  }
  next();
});

// 4. Mount API Routers (Supports both root level and /api prefix)
app.use('/api', masterRouter);
app.use('/', masterRouter);

// 5. Root Welcome & Telemetry Probe
app.get('/', async (req, res) => {
  // If the masterRouter handled the route, this will not be reached
  return jsonResponse(res, true, {
    service: 'PIPL Enterprise Modular Node.js API Service',
    status: 'ONLINE',
    version: '1.0.0',
    documentation: {
      routes: [
        '/api/auth (or /login.php)',
        '/api/assets (or /assets.php)',
        '/api/invoices (or /invoices.php)',
        '/api/dashboard (or /dashboard.php)',
        '/api/company (or /company.php)',
        '/api/cron (or /cron.php)',
        '/api/transactions (or /transactions.php)',
        '/api/reconciliation (or /reconciliation.php)',
        '/api/webhook (or /webhook.php)',
        '/api/test_db (or /test_db.php)'
      ]
    }
  }, 'PIPL Node.js API Service is operational.');
});

// 6. 404 Route Handler
app.use((req, res) => {
  return jsonResponse(res, false, null, `Route ${req.method} ${req.originalUrl} not found.`, 404);
});

// 7. Global Exception / Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  return jsonResponse(res, false, null, `Internal server error: ${err.message}`, 500);
});

// 8. Start HTTP Server & Diagnostic Check
const server = app.listen(PORT, async () => {
  console.log(`==============================================================================`);
  console.log(`🚀 PIPL Enterprise Node.js API Server (MongoDB Atlas Edition)`);
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`⚡ Dual Routing: Standard REST (/api/...) and Legacy Compatible (/*.php)`);
  console.log(`☁️ Cloud Database: MongoDB Atlas (Cluster: 12kmajor.6vm1ma2.mongodb.net)`);
  console.log(`==============================================================================`);

  try {
    await connectDB();
    await seedInitialData();
    const dbStatus = await testDbConnection();
    if (dbStatus.connected) {
      console.log(`✅ Connected to MongoDB Atlas Cloud Cluster [${dbStatus.database}] successfully!`);
      console.log(`📊 Core Collections Loaded:`, dbStatus.tableCounts);
    }
  } catch (dbErr) {
    console.warn(`⚠️ MongoDB Atlas Notice: ${dbErr.message}`);
    console.warn(`💡 Check credentials in c:\\Users\\harsh\\Desktop\\12k\\node\\.env`);
  }
});

module.exports = app;
