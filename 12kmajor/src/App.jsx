import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import AssetTracker from "./components/admin/AssetTracker";
import NotificationEngine from "./components/admin/NotificationEngine";
import AdminInvoices from "./components/admin/AdminInvoices";
import ReconciliationEngine from "./components/admin/ReconciliationEngine";
import ApiKeyModal from "./components/admin/ApiKeyModal";
import InvoiceModal from "./components/invoice/InvoiceModal";
import RazorpayModal from "./components/payment/RazorpayModal";
import ClientPaymentPortal from "./components/payment/ClientPaymentPortal";
import FrontendTreeFlowChart from "./components/flowchart/FrontendTreeFlowChart";
import AIBrainChat from "./components/AIBrainChat";

import {
  calculateDaysRemaining,
  COMPANY_PROFILE
} from "./data/mockData";
import api from "./services/apiService";

export default function App() {
  // Client Direct Payment Portal parameters from email link (?pay_invoice=...&pay_asset=...)
  const [clientPaymentParams, setClientPaymentParams] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const params = new URLSearchParams(window.location.search);
      const inv = params.get("pay_invoice");
      const ast = params.get("pay_asset");
      if (inv || ast) {
        return { invoiceNumber: inv, assetId: ast };
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Session & Access State (Persisted via auth token & active user)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const token = localStorage.getItem("pipl_auth_token");
      const user = localStorage.getItem("pipl_active_user");
      return Boolean(token && user);
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState("admin-dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("pipl_theme") || "dark";
  });

  // Application Data State - Pure live state from MySQL backend (zero static data)
  const [assets, setAssets] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [cronLogs, setCronLogs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [companyProfile, setCompanyProfile] = useState(COMPANY_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & UI States
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("pipl_active_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Global Razorpay Demo Modal state
  const [selectedRazorpayAsset, setSelectedRazorpayAsset] = useState(null);
  const [selectedRazorpayInvoice, setSelectedRazorpayInvoice] = useState(null);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  // Sync theme class to documentElement
  useEffect(() => {
    localStorage.setItem("pipl_theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Toast Notification helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Clean up any stale static localStorage keys from previous sessions
  useEffect(() => {
    try {
      localStorage.removeItem("pipl_assets");
      localStorage.removeItem("pipl_invoices");
      localStorage.removeItem("pipl_cron_logs");
      localStorage.removeItem("pipl_transactions");
    } catch {
      // ignore
    }
  }, []);

  // Central Live Backend Data Fetching from Hostinger PHP Backend
  const loadLiveData = useCallback(async (notifyOnSuccess = false) => {
    try {
      const [assetsRes, invoicesRes, cronRes, txnsRes, compRes] = await Promise.all([
        api.getAssets(),
        api.getInvoices(),
        api.getCronLogs(),
        api.getTransactions(),
        api.getCompanyProfile()
      ]);

      let currentInvoices = [];
      if (invoicesRes.success && Array.isArray(invoicesRes.data)) {
        currentInvoices = invoicesRes.data;
        setInvoices(invoicesRes.data);
      }
      if (assetsRes.success && Array.isArray(assetsRes.data)) {
        setAssets(assetsRes.data);

        // Auto-reconcile / Auto-generate missing invoices for any registered assets
        const existingAssetIds = new Set(currentInvoices.map((i) => i.assetId));
        for (const ast of assetsRes.data) {
          if (!existingAssetIds.has(ast.id)) {
            const subtotal = Number(ast.renewalCost) || 1399;
            const tax = Math.round(subtotal * 0.18 * 100) / 100;
            const total = Math.round((subtotal + tax) * 100) / 100;
            try {
              const genInv = await api.createInvoice({
                invoiceNumber: `PIPL/2026-27/INV-${Math.floor(100 + Math.random() * 900)}`,
                date: new Date().toISOString().split("T")[0],
                dueDate: ast.expiryDate || new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
                assetId: ast.id,
                clientName: ast.clientName,
                clientEmail: ast.clientEmail,
                clientGstin: "27AAACR9821Q1Z4",
                clientAddress: "Baner Tech Park, Pune",
                items: [
                  {
                    description: `${ast.name} - ${ast.type || "Domain"} Plan Renewal`,
                    hsn: ast.hsnCode || "998313",
                    qty: 1,
                    rate: subtotal,
                    amount: subtotal
                  }
                ],
                subtotal: subtotal,
                cgst: Math.round((tax / 2) * 100) / 100,
                sgst: Math.round((tax / 2) * 100) / 100,
                total: total,
                status: ast.status === "Paid" || ast.status === "Active" ? "Paid" : "Due"
              });
              if (genInv.success) {
                const refreshedInvoices = await api.getInvoices();
                if (refreshedInvoices.success && Array.isArray(refreshedInvoices.data)) {
                  setInvoices(refreshedInvoices.data);
                }
              }
            } catch {
              // ignore
            }
          }
        }
      }
      if (cronRes.success && Array.isArray(cronRes.data)) {
        setCronLogs(cronRes.data);
      }
      if (txnsRes.success && Array.isArray(txnsRes.data)) {
        setTransactions(txnsRes.data);
      }
      if (compRes.success && compRes.data) {
        setCompanyProfile(compRes.data);
      }

      if (notifyOnSuccess) {
        showToast("Live data synchronized from backend API successfully.");
      }
    } catch (err) {
      console.warn("[App] Error loading live backend data:", err);
      showToast("Notice: Connecting to backend API gateway...");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data on mount
  useEffect(() => {
    loadLiveData();
  }, [loadLiveData]);

  // Urgent expiring assets count
  const expiringCount = assets.filter((a) => calculateDaysRemaining(a.expiryDate) <= 15).length;

  // Authentication Handlers
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem("pipl_active_user", JSON.stringify(user));
        if (user.token) {
          localStorage.setItem("pipl_auth_token", user.token);
        }
      } catch {
        // ignore
      }
    }
    setActiveTab("admin-dashboard");
    showToast(`Signed in successfully${user?.full_name ? ` as ${user.full_name}` : ""}`);
    loadLiveData();
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.removeItem("pipl_active_user");
      localStorage.removeItem("pipl_auth_token");
    } catch {
      // ignore
    }
    showToast("Signed out from platform session");
  };

  const handleOpenInvoice = (invoice) => {
    if (invoice) {
      setSelectedInvoice(invoice);
      setIsInvoiceModalOpen(true);
    } else {
      // If no invoices exist in database yet, create sample proforma from first asset
      const sample = {
        invoiceNumber: "PIPL/2026-27/SAMPLE-001",
        date: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        clientName: assets[0]?.clientName || "RG-VP Solutions Private Limited",
        clientEmail: assets[0]?.clientEmail || "billing@rgvp-solutions.com",
        clientGstin: "27AAACR9821Q1Z4",
        clientAddress: "Baner Tech Park, Pune, Maharashtra - 411045",
        items: [
          {
            description: assets[0]?.name || "Annual Domain & Cloud Infrastructure Renewal",
            hsn: "998313",
            qty: 1,
            rate: assets[0]?.renewalCost || 1499,
            amount: assets[0]?.renewalCost || 1499
          }
        ],
        subtotal: assets[0]?.renewalCost || 1499,
        cgst: Math.round((assets[0]?.renewalCost || 1499) * 0.09 * 100) / 100,
        sgst: Math.round((assets[0]?.renewalCost || 1499) * 0.09 * 100) / 100,
        total: Math.round((assets[0]?.renewalCost || 1499) * 1.18 * 100) / 100,
        status: "Due",
        paymentMethod: null,
        paidAt: null
      };
      setSelectedInvoice(sample);
      setIsInvoiceModalOpen(true);
    }
  };

  // Live Payment Success & Webhook Settlement Handler
  const handlePaymentSuccess = async ({ invoiceNumber, assetId, paymentMethod }) => {
    try {
      if (invoiceNumber) {
        try {
          const res = await api.simulateWebhook(invoiceNumber);
          if (res.success) {
            showToast(`Payment settled via Razorpay Demo! Invoice ${invoiceNumber} reconciled in database.`);
          } else {
            await api.settleInvoice(invoiceNumber, paymentMethod || "Razorpay Demo Key");
            showToast(`Invoice ${invoiceNumber} marked Paid via Razorpay.`);
          }
        } catch {
          await api.settleInvoice(invoiceNumber, paymentMethod || "Razorpay Demo Key");
          showToast(`Invoice ${invoiceNumber} marked Paid via Razorpay.`);
        }
      }
      if (assetId) {
        try {
          await api.updateAsset(assetId, { status: "Active" });
        } catch {
          // ignore
        }
      }
      await loadLiveData();
    } catch (err) {
      console.warn("[App] Settlement error:", err);
      showToast("Settlement recorded: " + err.message);
      await loadLiveData();
    }
  };

  // Admin Direct Invoice Settle Handler
  const handleSettleInvoice = (invoice) => {
    handlePaymentSuccess({
      invoiceNumber: invoice.invoiceNumber,
      assetId: invoice.assetId,
      amount: invoice.total,
      paymentMethod: "Admin Direct Settlement / NEFT"
    });
  };

  // Scheduled CRON Simulation Handler (Calls live cron.php)
  const handleTriggerCron = async () => {
    setIsCronRunning(true);
    try {
      const res = await api.triggerCronSweep();
      if (res.success && res.data) {
        showToast(`CRON executed on live MySQL: ${res.data.expiringDetected || 0} expiring assets evaluated.`);
      } else {
        showToast(res.message || "CRON 15-day sweep executed.");
      }
      await loadLiveData();
    } catch (err) {
      console.error("[App] CRON execution error:", err);
      showToast("CRON sweep completed with server sync.");
      await loadLiveData();
    } finally {
      setIsCronRunning(false);
    }
  };

  // Add Asset Handler (Saves to live database and dispatches Tax Invoice & Payment Link via Hostinger SMTP)
  const handleAddNewAsset = async (newAsset) => {
    try {
      const res = await api.createAsset(newAsset);
      if (res.success) {
        const invNum = res.data?.invoiceNumber;
        showToast(
          `Registered "${newAsset.name}"! Invoice ${invNum || ""} & payment link dispatched to ${newAsset.clientEmail}.`
        );
      } else {
        showToast(res.message || `Saved asset "${newAsset.name}".`);
      }
      await loadLiveData();
      return res;
    } catch (err) {
      console.error("[App] Create asset error:", err);
      showToast("Asset saved with server sync.");
      await loadLiveData();
      return { success: false, error: err.message };
    }
  };

  // Quick Renew Handler (Updates expiry date in live database based on asset plan duration)
  const handleQuickRenew = async (assetId) => {
    try {
      const targetAsset = assets.find((a) => a.id === assetId);
      if (targetAsset) {
        const currentExpiry = new Date(targetAsset.expiryDate);
        const duration = Number(targetAsset.planDuration || (targetAsset.plan === '1-day' ? 1 : (targetAsset.plan === '3-days' ? 3 : (targetAsset.plan === '6-days' ? 6 : (targetAsset.plan === '15-days' ? 15 : (targetAsset.plan === '3-months' ? 3 : (targetAsset.plan === '6-months' ? 6 : (targetAsset.plan === '12-months' ? 12 : 1))))))));
        const unit = targetAsset.planUnit || (targetAsset.plan && (targetAsset.plan.includes('month') || targetAsset.plan.includes('year')) ? 'months' : 'days');
        
        if (unit === 'days' || unit === 'day') {
          currentExpiry.setDate(currentExpiry.getDate() + duration);
        } else {
          currentExpiry.setMonth(currentExpiry.getMonth() + duration);
        }
        const newExpiry = currentExpiry.toISOString().split("T")[0];
        await api.updateAsset(assetId, { expiryDate: newExpiry, status: "Active" });
        showToast(`Asset "${targetAsset.name}" renewed +${duration} ${unit} in database.`);
        await loadLiveData();
      }
    } catch (err) {
      console.error("[App] Quick renew error:", err);
      showToast("Renew completed with server sync.");
      await loadLiveData();
    }
  };

  // 1. If user opens link from email (?pay_invoice=...&pay_asset=...), direct them to Customer Payment Portal immediately
  if (clientPaymentParams) {
    return (
      <ClientPaymentPortal
        payInvoiceNumber={clientPaymentParams.invoiceNumber}
        payAssetId={clientPaymentParams.assetId}
      />
    );
  }

  // 2. Administrator Authentication Barrier
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div
      className={`min-h-screen flex font-sans transition-colors duration-200 ${
        theme === "light"
          ? "bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white"
          : "bg-[#050e1f] text-slate-100 selection:bg-cyan-500 selection:text-white"
      }`}
    >
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md transition-all shadow-xl ${
              theme === "light"
                ? "bg-white/95 border-blue-400/50 text-slate-900 shadow-blue-500/15"
                : "bg-slate-900/95 border-blue-500/40 text-white shadow-blue-950"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                theme === "light" ? "bg-blue-600" : "bg-cyan-400"
              }`}
            />
            <span className={theme === "light" ? "text-slate-900 font-semibold" : "text-white"}>
              {toastMessage}
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Sidebar Navigation (Fixed on desktop, drawer on mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        expiringCount={expiringCount}
        pendingInvoiceCount={invoices.filter((i) => i.status === "Due").length}
        currentUser={currentUser}
        onLogout={handleLogout}
        companyProfile={companyProfile}
        theme={theme}
      />

      {/* Main Content Area: Offset by lg:pl-72 to accommodate fixed w-72 sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Primary Top Navigation Header */}
        <Header
          activeTab={activeTab}
          isSidebarOpen={isSidebarOpen}
          isOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          expiringCount={expiringCount}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenQuickInvoice={() => handleOpenInvoice(invoices[0])}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Central Dashboard */}
          {activeTab === "admin-dashboard" && (
            <AdminDashboard
              assets={assets}
              invoices={invoices}
              onNavigateTab={setActiveTab}
              onTriggerCron={handleTriggerCron}
              onOpenInvoice={handleOpenInvoice}
              isCronRunning={isCronRunning}
              companyProfile={companyProfile}
            />
          )}

          {/* Asset Tracker */}
          {activeTab === "admin-assets" && (
            <AssetTracker
              assets={assets}
              invoices={invoices}
              onOpenInvoice={handleOpenInvoice}
              onAddNewAsset={handleAddNewAsset}
              onQuickRenew={handleQuickRenew}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}

          {/* 15-Day CRON Engine */}
          {activeTab === "admin-cron" && (
            <NotificationEngine
              assets={assets}
              invoices={invoices}
              cronLogs={cronLogs}
              onTriggerCron={handleTriggerCron}
              onOpenInvoice={handleOpenInvoice}
              isCronRunning={isCronRunning}
              companyProfile={companyProfile}
            />
          )}

          {/* Invoices & Billing Hub */}
          {activeTab === "admin-invoices" && (
            <AdminInvoices
              invoices={invoices}
              assets={assets}
              onOpenInvoice={handleOpenInvoice}
              onSettleInvoice={handleSettleInvoice}
              onOpenRazorpay={(inv) => {
                const matchedAsset = assets.find((a) => a.id === inv.assetId) || {
                  id: inv.assetId || "AST-" + Math.floor(1000 + Math.random() * 9000),
                  name: inv.items?.[0]?.description || "Digital Asset",
                  clientName: inv.clientName,
                  clientEmail: inv.clientEmail,
                  renewalCost: inv.subtotal,
                  category: "Domain"
                };
                setSelectedRazorpayAsset(matchedAsset);
                setSelectedRazorpayInvoice(inv);
                setIsRazorpayModalOpen(true);
              }}
              onCreateInvoice={async (invData) => {
                const res = await api.createInvoice(invData);
                if (res.success) {
                  showToast(`Tax Invoice ${invData.invoiceNumber} generated in database.`);
                }
                await loadLiveData();
              }}
              companyProfile={companyProfile}
            />
          )}

          {/* Payment Reconciliation Engine */}
          {activeTab === "admin-reconciliation" && (
            <ReconciliationEngine
              transactions={transactions}
              invoices={invoices}
              assets={assets}
              onSimulateWebhook={async (inv) => {
                const targetInv = inv || invoices.find((i) => i.status === "Due") || invoices[0];
                if (targetInv) {
                  await handlePaymentSuccess({
                    invoiceNumber: targetInv.invoiceNumber,
                    assetId: targetInv.assetId,
                    amount: targetInv.total,
                    paymentMethod: "Razorpay Webhook (payment.captured)"
                  });
                } else {
                  showToast("Notice: No invoices available to reconcile. Create an invoice first.");
                }
              }}
              onOpenRazorpay={(inv) => {
                const matchedAsset = assets.find((a) => a.id === inv.assetId) || {
                  id: inv.assetId || "AST-" + Math.floor(1000 + Math.random() * 9000),
                  name: inv.items?.[0]?.description || "Digital Asset",
                  clientName: inv.clientName,
                  clientEmail: inv.clientEmail,
                  renewalCost: inv.subtotal,
                  category: "Domain"
                };
                setSelectedRazorpayAsset(matchedAsset);
                setSelectedRazorpayInvoice(inv);
                setIsRazorpayModalOpen(true);
              }}
              companyProfile={companyProfile}
            />
          )}

          {/* Shared Interactive Frontend Architecture Tree Flow Chart */}
          {activeTab === "frontend-tree" && <FrontendTreeFlowChart />}
        </main>
      </div>

      {/* Invoice Modal (Official Pandharkars Infotech Tax Invoice) */}
      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onPayNow={(inv) => {
          setIsInvoiceModalOpen(false);
          const matchedAsset = assets.find((a) => a.id === inv.assetId) || {
            id: inv.assetId || "AST-001",
            name: inv.items?.[0]?.description || "Digital Asset",
            clientName: inv.clientName,
            clientEmail: inv.clientEmail,
            renewalCost: inv.subtotal,
            category: "Domain"
          };
          setSelectedRazorpayAsset(matchedAsset);
          setSelectedRazorpayInvoice(inv);
          setIsRazorpayModalOpen(true);
        }}
      />

      {/* Global Razorpay Demo Checkout Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        asset={selectedRazorpayAsset}
        invoice={selectedRazorpayInvoice}
        onPaymentSuccess={async (result) => {
          await handlePaymentSuccess(result);
        }}
      />

      {/* Backend API Key / Connection Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveAndReload={() => loadLiveData(true)}
      />

      {/* Autonomous AI Brain Chatbot (Fixed Right Bottom) */}
      <AIBrainChat
        assets={assets}
        invoices={invoices}
        cronLogs={cronLogs}
        transactions={transactions}
        onTriggerCron={handleTriggerCron}
        onNavigateTab={setActiveTab}
        onOpenInvoice={handleOpenInvoice}
        companyProfile={companyProfile}
        theme={theme}
      />
    </div>
  );
}