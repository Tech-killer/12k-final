# PIPL Enterprise Node.js Modular Backend (MongoDB Atlas Edition)

High-performance, modular Node.js/Express backend powered by **MongoDB Atlas Cloud Database** for **Pandharkars Infotech Private Limited (PIPL)**.

---

## 📁 Modular Directory Architecture

```
node/
├── config/
│   └── db.js                 # Mongoose connection to MongoDB Atlas Cloud Cluster
├── models/                   # Mongoose Data Schemas & Models
│   ├── User.js               # Administrator authentication & roles
│   ├── CompanyProfile.js     # Statutory entity master profile & bank details
│   ├── Asset.js              # Digital asset inventory & 15-day expiry radar
│   ├── Invoice.js            # GST tax invoices & line items
│   ├── CronLog.js            # 15-day sweep engine audit trail
│   ├── Transaction.js        # Payment gateway transactions & ledger
│   └── index.js              # Model aggregator & automated initial database seeder
├── controllers/
│   ├── authController.js     # Admin login, registration, password hashing & sessions
│   ├── assetController.js    # Assets CRUD, 15-day expiry radar & auto-invoice creation
│   ├── dashboardController.js# Central KPI analytics & telemetry (assets, financial, cron)
│   ├── companyController.js  # Statutory entity profile & bank details master
│   ├── invoiceController.js  # GST tax invoices, line items, and settlement logic
│   ├── cronController.js     # Autonomous 15-day expiry sweep engine & notification logs
│   ├── transactionController.js # Ledger records & payment transaction history
│   ├── reconciliationController.js # Webhook simulation & pending reconciliation state
│   └── webhookController.js  # Live payment gateway webhook listener (Razorpay/UPI)
├── routes/ (and router/)
│   ├── authRoutes.js         # /api/auth, /login.php
│   ├── assetRoutes.js        # /api/assets, /assets.php
│   ├── dashboardRoutes.js    # /api/dashboard, /dashboard.php
│   ├── companyRoutes.js      # /api/company, /company.php
│   ├── invoiceRoutes.js      # /api/invoices, /invoices.php
│   ├── cronRoutes.js         # /api/cron, /cron.php
│   ├── transactionRoutes.js  # /api/transactions, /transactions.php
│   ├── reconciliationRoutes.js # /api/reconciliation, /reconciliation.php
│   ├── webhookRoutes.js      # /api/webhook, /webhook.php
│   └── index.js              # Master router aggregator & database diagnostics (/test_db)
├── .env                      # Active environment variables & MongoDB Atlas URI
├── atlas-credentials.env     # MongoDB Atlas credential reference
├── .env.example              # Template environment file
├── package.json              # NPM dependencies (express, mongoose, bcryptjs, cors, dotenv)
└── server.js                 # Express server bootstrap, CORS & PHP route compatibility
```

---

## ⚙️ Quick Start

### 1. Install Dependencies
```powershell
cd c:\Users\harsh\Desktop\12k\node
npm.cmd install
```

### 2. Environment Setup
The `.env` file is preconfigured with your MongoDB Atlas Cloud Cluster:
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/12k?retryWrites=true&w=majority
MONGODB_DB_NAME=12k
```

### 3. Run Server
- **Development Mode (with auto-reload):**
  ```powershell
  npm.cmd run dev
  ```
- **Standard Mode:**
  ```powershell
  npm.cmd start
  ```

---

## ⚡ Zero-Friction Frontend Parity

The server includes a compatibility layer that automatically supports **both** clean REST endpoints and legacy PHP endpoint paths without modifying the React frontend:

| Frontend / Legacy Endpoint | Modern REST Endpoint | Controller Method |
|---|---|---|
| `POST /login.php` | `POST /api/auth/login` | `authController.loginOrRegister` |
| `GET /dashboard.php` | `GET /api/dashboard` | `dashboardController.getDashboardKpis` |
| `GET /assets.php` | `GET /api/assets` | `assetController.getAssets` |
| `POST /assets.php` | `POST /api/assets` | `assetController.createAsset` |
| `PUT /assets.php?id=AST-101` | `PUT /api/assets/:id` | `assetController.updateAsset` |
| `DELETE /assets.php?id=AST-101`| `DELETE /api/assets/:id` | `assetController.deleteAsset` |
| `GET /invoices.php` | `GET /api/invoices` | `invoiceController.getInvoices` |
| `POST /invoices.php` | `POST /api/invoices` | `invoiceController.createInvoice` |
| `PUT /invoices.php` | `PUT /api/invoices` | `invoiceController.settleInvoice` |
| `GET /company.php` | `GET /api/company` | `companyController.getCompanyProfile` |
| `PUT /company.php` | `PUT /api/company` | `companyController.updateCompanyProfile` |
| `GET /cron.php` | `GET /api/cron` | `cronController.getCronLogs` |
| `POST /cron.php` | `POST /api/cron` | `cronController.triggerCronSweep` |
| `GET /transactions.php` | `GET /api/transactions` | `transactionController.getTransactions` |
| `POST /transactions.php` | `POST /api/transactions` | `transactionController.createTransaction` |
| `GET /reconciliation.php` | `GET /api/reconciliation` | `reconciliationController.getReconciliationState`|
| `POST /reconciliation.php` | `POST /api/reconciliation` | `reconciliationController.simulateWebhook` |
| `POST /webhook.php` | `POST /api/webhook` | `webhookController.handlePaymentWebhook` |
| `GET /test_db.php?format=json` | `GET /api/test_db` | `routes/index.js (handleHealthCheck)` |
