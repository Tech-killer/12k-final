/**
 * ==============================================================================
 * Master Models Index & Automated Database Seeder
 * ==============================================================================
 */

const User = require('./User');
const CompanyProfile = require('./CompanyProfile');
const Asset = require('./Asset');
const Invoice = require('./Invoice');
const CronLog = require('./CronLog');
const Transaction = require('./Transaction');

const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().slice(0, 10);
};

const subDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - Number(days));
  return d.toISOString().slice(0, 10);
};

/**
 * Automatically seeds initial master records if MongoDB Atlas database is empty.
 * Matches exact seed data from db/schema.sql.
 */
async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Populating administrator user...');
      // 1. Super Admin
      await User.create({
        email: 'admin@pandharkarsinfotech.com',
        // Hash for '12kYashr' / 'admin123'
        password_hash: '$2a$12$e8Y6gZ11e8gTqE3kR9wNpeK4R1vG3pL9uQ7zX0mB2nV8aC5sD4fG6',
        full_name: 'Executive Administrator',
        role: 'super_admin'
      });
    }

    const compCount = await CompanyProfile.countDocuments();
    if (compCount === 0) {
      console.log('🌱 Populating company profile...');
      // 2. Company Profile
      await CompanyProfile.create({
        name: 'PANDHARKARS INFOTECH PRIVATE LIMITED',
        short_name: 'Pandharkars Infotech',
        tagline: 'We Manage, Control & Grow Your Business!',
        cin: 'U72900MH2021PTC366004',
        gstin: '27AAMCP2248L1ZY',
        email: 'sales@pandharkarsinfotech.com',
        phone: '+91 98220 12345 / +91 (020) 2456-7890',
        address: 'Level 4, Infotech Tower, Baner Tech Park, Pune, Maharashtra - 411045, India',
        bank_name: 'HDFC Bank Ltd',
        bank_account_number: '50200087462910',
        bank_ifsc: 'HDFC0001234',
        upi_id: 'pandharkarsinfotech@hdfcbank'
      });
    }

    const assetCount = await Asset.countDocuments();
    if (assetCount === 0) {
      console.log('🌱 Populating initial digital assets...');
      // 3. Monitored Digital Assets
      await Asset.insertMany([
        {
          id: 'AST-101',
          name: 'rgvp-solutions.com',
          type: 'Domain Registration',
          category: 'Domain',
          provider: 'Pandharkars Infotech Registrar',
          client_name: 'RG-VP Solutions Private Limited',
          client_email: 'billing@rgvp-solutions.com',
          expiry_date: addDays(6),
          renewal_cost: 1499.00,
          tax_rate: 18.00,
          status: 'Expiring Soon',
          auto_renew: false,
          hsn_code: '998313',
          description: 'Primary Corporate Domain Renewal (.com) - 1 Year'
        },
        {
          id: 'AST-102',
          name: 'Dedicated Cloud VPS (16 vCPU, 32GB RAM, Mumbai Node)',
          type: 'Cloud VPS Server',
          category: 'Server Hosting',
          provider: 'Pandharkars Managed Cloud Infrastructure',
          client_name: 'RG-VP Solutions Private Limited',
          client_email: 'billing@rgvp-solutions.com',
          expiry_date: addDays(11),
          renewal_cost: 38500.00,
          tax_rate: 18.00,
          status: 'Expiring Soon',
          auto_renew: false,
          hsn_code: '998315',
          description: 'High Performance Cloud Hosting Mumbai Cluster (Enterprise Tier)'
        },
        {
          id: 'AST-103',
          name: 'Wildcard SSL Certificate (*.rgvp-solutions.com)',
          type: 'SSL Security',
          category: 'Security',
          provider: 'Sectigo via Pandharkars Infotech',
          client_name: 'RG-VP Solutions Private Limited',
          client_email: 'billing@rgvp-solutions.com',
          expiry_date: addDays(29),
          renewal_cost: 7999.00,
          tax_rate: 18.00,
          status: 'Active',
          auto_renew: true,
          hsn_code: '998319',
          description: '256-bit Multi-Subdomain SSL Security Certificate'
        },
        {
          id: 'AST-104',
          name: 'Annual IT Infrastructure AMC & Managed DevOps',
          type: 'IT AMC & Support',
          category: 'Support AMC',
          provider: 'Pandharkars Infotech Enterprise Support',
          client_name: 'RG-VP Solutions Private Limited',
          client_email: 'billing@rgvp-solutions.com',
          expiry_date: addDays(4),
          renewal_cost: 65000.00,
          tax_rate: 18.00,
          status: 'Expiring Soon',
          auto_renew: false,
          hsn_code: '998313',
          description: '24x7 Dedicated Systems Engineering & Server Monitoring Support'
        },
        {
          id: 'AST-105',
          name: 'rgvp-portal.in',
          type: 'Domain Registration',
          category: 'Domain',
          provider: 'Pandharkars Infotech Registrar',
          client_name: 'RG-VP Solutions Private Limited',
          client_email: 'billing@rgvp-solutions.com',
          expiry_date: addDays(74),
          renewal_cost: 899.00,
          tax_rate: 18.00,
          status: 'Active',
          auto_renew: true,
          hsn_code: '998313',
          description: 'Secondary Web Portal (.in) 1-Year Extension'
        },
        {
          id: 'AST-106',
          name: 'apex-cloudhub.com & Enterprise cPanel Hosting',
          type: 'Managed Hosting',
          category: 'Server Hosting',
          provider: 'Pandharkars Infotech Cloud',
          client_name: 'Apex Digital Systems Ltd',
          client_email: 'accounts@apexdigital.in',
          expiry_date: addDays(3),
          renewal_cost: 18500.00,
          tax_rate: 18.00,
          status: 'Expiring Soon',
          auto_renew: false,
          hsn_code: '998315',
          description: 'cPanel Pro Hosting 500GB NVMe SSD with Litespeed Web Server'
        },
        {
          id: 'AST-107',
          name: 'Kubernetes Cluster 3-Node Worker Pool',
          type: 'Cloud Infrastructure',
          category: 'Server Hosting',
          provider: 'Pandharkars DevOps Cloud',
          client_name: 'Nexus Cloud Logistics Corp',
          client_email: 'it@nexuslogistics.com',
          expiry_date: addDays(92),
          renewal_cost: 45000.00,
          tax_rate: 18.00,
          status: 'Active',
          auto_renew: true,
          hsn_code: '998315',
          description: 'Managed Kubernetes Dedicated Nodes for Fleet Logistics API'
        }
      ]);
    }

    const invCount = await Invoice.countDocuments();
    if (invCount === 0) {
      console.log('🌱 Populating initial invoices...');
      // 4. Invoices
      await Invoice.insertMany([
        {
          invoice_number: 'PIPL/2026-27/INV-0841',
          date: subDays(5),
          due_date: addDays(6),
          asset_id: 'AST-101',
          client_name: 'RG-VP Solutions Private Limited',
          client_email: 'billing@rgvp-solutions.com',
          client_gstin: '27AAACR9821Q1Z4',
          client_address: 'Plot 42, Hinjawadi Phase 2, Pune, Maharashtra - 411057',
          items: [{ description: 'rgvp-solutions.com - 1 Year Domain Renewal Extension', hsn: '998313', qty: 1, rate: 1499, amount: 1499 }],
          subtotal: 1499.00,
          cgst: 134.91,
          sgst: 134.91,
          total: 1768.82,
          status: 'Due',
          automated_notice_sent: true
        },
        {
          invoice_number: 'PIPL/2026-27/INV-0842',
          date: subDays(3),
          due_date: addDays(11),
          asset_id: 'AST-102',
          client_name: 'RG-VP Solutions Private Limited',
          client_email: 'billing@rgvp-solutions.com',
          client_gstin: '27AAACR9821Q1Z4',
          client_address: 'Plot 42, Hinjawadi Phase 2, Pune, Maharashtra - 411057',
          items: [{ description: 'Dedicated Cloud VPS (16 vCPU, 32GB RAM, Mumbai Node) - Annual Renewal', hsn: '998315', qty: 1, rate: 38500, amount: 38500 }],
          subtotal: 38500.00,
          cgst: 3465.00,
          sgst: 3465.00,
          total: 45430.00,
          status: 'Due',
          automated_notice_sent: true
        },
        {
          invoice_number: 'PIPL/2026-27/INV-0840',
          date: subDays(4),
          due_date: addDays(4),
          asset_id: 'AST-104',
          client_name: 'RG-VP Solutions Private Limited',
          client_email: 'billing@rgvp-solutions.com',
          client_gstin: '27AAACR9821Q1Z4',
          client_address: 'Plot 42, Hinjawadi Phase 2, Pune, Maharashtra - 411057',
          items: [{ description: 'Annual IT Infrastructure AMC & Managed DevOps Support (Annual 2026-27)', hsn: '998313', qty: 1, rate: 65000, amount: 65000 }],
          subtotal: 65000.00,
          cgst: 5850.00,
          sgst: 5850.00,
          total: 76700.00,
          status: 'Due',
          automated_notice_sent: true
        },
        {
          invoice_number: 'PIPL/2025-26/INV-0712',
          date: '2026-01-15',
          due_date: '2026-01-30',
          asset_id: 'AST-103',
          client_name: 'RG-VP Solutions Private Limited',
          client_email: 'billing@rgvp-solutions.com',
          client_gstin: '27AAACR9821Q1Z4',
          client_address: 'Plot 42, Hinjawadi Phase 2, Pune, Maharashtra - 411057',
          items: [{ description: 'Wildcard SSL Certificate (*.rgvp-solutions.com) - 1 Year', hsn: '998319', qty: 1, rate: 7999, amount: 7999 }],
          subtotal: 7999.00,
          cgst: 719.91,
          sgst: 719.91,
          total: 9438.82,
          status: 'Paid',
          payment_method: 'Razorpay / UPI (UTR: 329104829102)',
          paid_at: new Date('2026-01-20T14:32:10Z'),
          automated_notice_sent: true
        }
      ]);
    }

    const cronCount = await CronLog.countDocuments();
    if (cronCount === 0) {
      console.log('🌱 Populating initial cron logs...');
      // 5. Cron Logs
      await CronLog.insertMany([
        {
          id: 'CRON-902',
          timestamp: new Date(Date.now() - 4 * 3600 * 1000),
          event: 'CRON Engine Daily 15-Day Expiry Sweep',
          status: 'Success',
          assets_evaluated: 12,
          expiring_detected: 3,
          emails_dispatched: 3,
          invoices_generated: 3,
          details: 'Detected RG-VP Solutions (Domain, VPS, AMC) expiring within 15 days threshold. Dispatched branded notification emails with attached PDF invoices and Razorpay instant payment links.'
        },
        {
          id: 'CRON-901',
          timestamp: new Date(Date.now() - 24 * 3600 * 1000),
          event: 'CRON Engine Daily 15-Day Expiry Sweep',
          status: 'Success',
          assets_evaluated: 12,
          expiring_detected: 2,
          emails_dispatched: 2,
          invoices_generated: 0,
          details: 'Follow-up reminder sent for Apex Digital Systems and RG-VP Solutions. No service disruption reported.'
        }
      ]);
    }

    const txnCount = await Transaction.countDocuments();
    if (txnCount === 0) {
      console.log('🌱 Populating initial transaction...');
      // 6. Transactions
      await Transaction.create({
        txn_id: 'TXN-RZP-920194',
        invoice_number: 'PIPL/2025-26/INV-0712',
        client_name: 'RG-VP Solutions Private Limited',
        asset_name: 'Wildcard SSL Certificate',
        amount: 9438.82,
        gateway: 'Razorpay (UPI / NetBanking)',
        timestamp: new Date('2026-01-20T14:32:10Z'),
        status: 'Success',
        reconciled: true,
        reconciliation_note: 'Automated webhook triggered -> Invoice marked PAID -> Asset expiry extended +365 days.'
      });
    }

    console.log('✅ Initial database sync verified successfully!');
  } catch (err) {
    console.warn('Auto-seed notice:', err.message);
  }
}

module.exports = {
  User,
  CompanyProfile,
  Asset,
  Invoice,
  CronLog,
  Transaction,
  seedInitialData
};
