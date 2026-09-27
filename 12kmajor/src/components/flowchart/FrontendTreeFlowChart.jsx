import React, { useState } from "react";
import {
  GitFork,
  Layers,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Server,
  FileText,
  BellRing,
  RefreshCw,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  Code2,
  Sparkles,
  Info,
  Search,
  Maximize2
} from "lucide-react";
import { COMPANY_PROFILE } from "../../data/mockData";

export default function FrontendTreeFlowChart() {
  const [selectedNode, setSelectedNode] = useState("admin-dashboard");
  const [activeTab, setActiveTab] = useState("tree"); // "tree" | "sequence" | "components"
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState({
    root: true,
    auth: true,
    layout: true,
    admin: true,
    shared: true
  });

  const toggleExpand = (key) => {
    setExpandedNodes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const nodeDetails = {
    "root-app": {
      title: "App.jsx (Root Application Controller)",
      file: "src/App.jsx",
      role: "Global Core",
      type: "Root Component",
      description:
        "Central controller holding persistent state (assets, invoices, transactions, CRON logs) in localStorage. Handles authentication state, active view routing, modal triggers, and cross-module event dispatching.",
      state: [
        "isAuthenticated: boolean",
        "activeTab: string",
        "assetsList: Asset[] (15-day expiry calculations)",
        "invoicesList: Invoice[] (GST calculations)",
        "cronLogs: CronLog[] (Automated sweep logs)",
        "transactions: Transaction[] (Payment gateway logs)"
      ],
      actions: [
        "handlePaymentSuccess(event) -> Reconciles invoice & increments expiry +365d",
        "handleTriggerCron() -> Runs automated 15-day scan & generates reminder emails",
        "handleAddNewAsset(asset) -> Inserts new customer service to inventory"
      ]
    },
    "login-view": {
      title: "LoginPage.jsx (Branded Auth Portal)",
      file: "src/components/LoginPage.jsx",
      role: "Public / Entry",
      type: "Auth Guard Component",
      description:
        "Official entry gateway featuring PANDHARKARS INFOTECH PRIVATE LIMITED branding, CIN: U72900MH2021PTC366004, GSTIN: 27AAMCP2248L1ZY, and 1-click quick demo access for Administrator.",
      state: ["email", "password", "isSubmitting", "showPassword"],
      actions: ["onLogin('admin') -> Initializes authenticated session with Administrator privileges"]
    },
    "sidebar-nav": {
      title: "Sidebar.jsx (Enterprise Left Navigation)",
      file: "src/components/Sidebar.jsx",
      role: "Shell / Navigation",
      type: "Navigation Controller",
      description:
        "Persistent responsive left navigation bar with official monogram logo, badge count for urgent expiring assets (<= 15 days), and quick links.",
      state: ["isSidebarOpen"],
      actions: [
        "setActiveTab(tab) -> Seamless tab navigation between Admin modules",
        "onLogout() -> Destroys current session"
      ]
    },
    "admin-dashboard": {
      title: "AdminDashboard.jsx (Centralized Tracking Dashboard)",
      file: "src/components/admin/AdminDashboard.jsx",
      role: "Admin Master",
      type: "Analytics & Monitoring Panel",
      description:
        "High-level monitoring console aggregating monitored digital assets (domains, servers, hosting, IT AMC). Displays urgent 15-day countdown alerts, revenue at risk in INR, and quick automated CRON triggers.",
      state: ["filterUrgency", "selectedTimeframe"],
      actions: [
        "Quick CRON trigger",
        "View Urgent Invoices",
        "Inspect Revenue at Risk breakdown"
      ]
    },
    "admin-assets": {
      title: "AssetTracker.jsx (Asset & Expiry Radar)",
      file: "src/components/admin/AssetTracker.jsx",
      role: "Admin Master",
      type: "Inventory Management",
      description:
        "Granular table of all customer digital infrastructure with real-time expiry countdowns, health status indicators (Healthy > 30d, Caution 15-30d, Critical <= 15d), category filtering, and manual renewal tools.",
      state: ["filterType", "filterStatus", "searchQuery", "isAddAssetModalOpen"],
      actions: [
        "Register new customer domain / VPS",
        "Trigger individual reminder notice",
        "Generate Proforma Invoice"
      ]
    },
    "admin-cron": {
      title: "NotificationEngine.jsx (Automated 15-Day CRON Engine)",
      file: "src/components/admin/NotificationEngine.jsx",
      role: "Admin Master",
      type: "Automation Engine",
      description:
        "Implements the scheduled daily CRON job requirement: scans customer assets, flags any expiring in <= 15 days, auto-generates dynamic PDF invoices, and dispatches branded reminder emails with payment links.",
      state: ["isCronRunning", "selectedEmailPreview", "cronLogsList"],
      actions: [
        "Run CRON Simulation Sweep",
        "Preview outbound email with PDF attachment",
        "Inspect delivery status & gateway click-through rate"
      ]
    },
    "admin-invoices": {
      title: "AdminInvoices.jsx & InvoiceView.jsx (GST Invoicing Hub)",
      file: "src/components/invoice/InvoiceView.jsx",
      role: "Admin / Shared",
      type: "Billing & Compliance Engine",
      description:
        "Dynamic Indian GST Tax Invoice engine branded with PANDHARKARS INFOTECH PRIVATE LIMITED, CIN, GSTIN, HSN/SAC codes (998313), 9% CGST + 9% SGST, bank transfer info, UPI QR, and browser print-to-PDF formatting.",
      state: ["activeInvoice", "isInvoiceModalOpen"],
      actions: [
        "Print / Export to PDF (clean media print CSS)",
        "Dispatch via email",
        "Mark Paid / Reconcile"
      ]
    },
    "admin-reconciliation": {
      title: "ReconciliationEngine.jsx (Gateway & Auto-Reconciler)",
      file: "src/components/admin/ReconciliationEngine.jsx",
      role: "Admin Master",
      type: "Reconciliation Engine",
      description:
        "Simulates automated payment gateway webhooks (Razorpay/Stripe). Once customer completes payment, the engine automatically updates the database: marks invoice 'PAID', generates receipt, and updates expiry date.",
      state: ["reconciliationLogs", "webhookSimulationActive"],
      actions: [
        "Simulate Gateway Payment Webhook",
        "Manual Ledger Reconciliation",
        "Audit Log Verification"
      ]
    },
    "invoice-view": {
      title: "InvoiceView.jsx (Official GST Tax Invoice)",
      file: "src/components/invoice/InvoiceView.jsx",
      role: "Shared Core",
      type: "Compliance & PDF Document",
      description:
        "High-fidelity document featuring Pandharkars Infotech corporate headers, CIN U72900MH2021PTC366004, GSTIN 27AAMCP2248L1ZY, SAC/HSN codes, CGST/SGST tax breakdown, bank account details, and printable format.",
      state: ["invoiceData"],
      actions: ["window.print()", "Download PDF"]
    }
  };

  const selectedData = nodeDetails[selectedNode] || nodeDetails["root-app"];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="admin-hero-banner p-6 rounded-2xl bg-gradient-to-r from-[#0a2145] via-[#0d2b59] to-[#071731] border border-blue-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <GitFork className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Architecture Visualizer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Frontend System Architecture & Tree Flow Chart
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Comprehensive structural tree flow of the frontend application for{" "}
              <strong className="text-cyan-300">{COMPANY_PROFILE.name}</strong> (Module 2:
              Customer Renewal & Billing Automation).
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab("tree")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "tree"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Tree View</span>
            </button>

            <button
              onClick={() => setActiveTab("sequence")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "sequence"
                  ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>15-Day Data Flow</span>
            </button>

            <button
              onClick={() => setActiveTab("components")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "components"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Components Spec</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualizer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: The Flow Chart Visualizer */}
        <div className="lg:col-span-7 bg-[#08152e] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {activeTab === "tree"
                  ? "Frontend Hierarchy Tree (Click any node to inspect)"
                  : activeTab === "sequence"
                  ? "15-Day Expiry & Automated Reconciliation Flow"
                  : "Frontend Component Inventory"}
              </span>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono">React 19 + Tailwind v4</span>
          </div>

          {/* TAB 1: VISUAL HIERARCHY TREE */}
          {activeTab === "tree" && (
            <div className="space-y-4 font-mono text-xs">
              {/* ROOT NODE */}
              <div
                onClick={() => setSelectedNode("root-app")}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedNode === "root-app"
                    ? "bg-blue-600/30 border-blue-400 text-white shadow-lg shadow-blue-900/40"
                    : "bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold font-sans text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>App.jsx (Root State & Event Engine)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                    ROOT
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  Holds persistent state for Assets, Invoices, Gateway Logs & CRON Sweeps.
                </p>
              </div>

              {/* BRANCH 1: AUTH & ENTRY */}
              <div className="pl-6 border-l-2 border-slate-800 space-y-2 relative">
                <div className="absolute -left-[9px] top-4 w-4 h-0.5 bg-slate-800" />
                <div
                  onClick={() => setSelectedNode("login-view")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedNode === "login-view"
                      ? "bg-indigo-600/30 border-indigo-400 text-white"
                      : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-sans text-xs flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      LoginPage.jsx (Branded Auth Portal)
                    </span>
                    <span className="text-[10px] text-indigo-300">Entry / Admin Access</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Official Pandharkars Infotech branding, CIN, GSTIN & 1-Click Quick Demo Login.
                  </p>
                </div>
              </div>

              {/* BRANCH 2: LAYOUT SHELL */}
              <div className="pl-6 border-l-2 border-slate-800 space-y-2 relative">
                <div className="absolute -left-[9px] top-4 w-4 h-0.5 bg-slate-800" />
                <div
                  onClick={() => setSelectedNode("sidebar-nav")}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedNode === "sidebar-nav"
                      ? "bg-blue-600/30 border-blue-400 text-white"
                      : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-sans text-xs flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      Sidebar.jsx & Header.jsx (App Shell)
                    </span>
                    <span className="text-[10px] text-blue-300">Nav & Controls</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                    Left sidebar, administrative navigation, 15-day alert counters & CRON heartbeat.
                  </p>
                </div>
              </div>

              {/* BRANCH 3: ADMIN PANEL BRANCH */}
              <div className="pl-6 border-l-2 border-slate-800 space-y-2 relative">
                <div className="absolute -left-[9px] top-4 w-4 h-0.5 bg-slate-800" />
                <div className="p-2.5 rounded-lg bg-[#0c1e3d] border border-blue-800/40 flex items-center justify-between">
                  <span className="font-bold font-sans text-xs text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    ADMIN PANEL MODULES (Administrative Control Room)
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">5 Submodules</span>
                </div>

                {/* Admin Subnodes */}
                <div className="pl-5 border-l-2 border-blue-900/50 space-y-2 pt-1">
                  <div
                    onClick={() => setSelectedNode("admin-dashboard")}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedNode === "admin-dashboard"
                        ? "bg-blue-600/30 border-blue-400 text-white"
                        : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-sans text-xs font-semibold">
                      <span className="flex items-center gap-2">
                        <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                        AdminDashboard.jsx (Central KPI & Urgent Radar)
                      </span>
                      <span className="text-[9px] text-amber-300 font-mono">15d Watch</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedNode("admin-assets")}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedNode === "admin-assets"
                        ? "bg-blue-600/30 border-blue-400 text-white"
                        : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-sans text-xs font-semibold">
                      <span className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        AssetTracker.jsx (Domains, Hosting, VPS, SSL, AMC)
                      </span>
                      <span className="text-[9px] text-cyan-300 font-mono">Inventory</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedNode("admin-cron")}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedNode === "admin-cron"
                        ? "bg-blue-600/30 border-blue-400 text-white"
                        : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-sans text-xs font-semibold">
                      <span className="flex items-center gap-2">
                        <BellRing className="w-3.5 h-3.5 text-amber-400" />
                        NotificationEngine.jsx (15-Day CRON Job Simulator)
                      </span>
                      <span className="text-[9px] text-emerald-300 font-mono">CRON 00:00</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedNode("admin-invoices")}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedNode === "admin-invoices"
                        ? "bg-blue-600/30 border-blue-400 text-white"
                        : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-sans text-xs font-semibold">
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        InvoiceView.jsx (Pandharkars GST Tax Invoice)
                      </span>
                      <span className="text-[9px] text-indigo-300 font-mono">18% GST</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedNode("admin-reconciliation")}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      selectedNode === "admin-reconciliation"
                        ? "bg-blue-600/30 border-blue-400 text-white"
                        : "bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-sans text-xs font-semibold">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                        ReconciliationEngine.jsx (Gateway & Auto-Renew)
                      </span>
                      <span className="text-[9px] text-emerald-300 font-mono">Auto-Sync</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SEQUENCE FLOW TIMELINE */}
          {activeTab === "sequence" && (
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-slate-300 text-xs leading-relaxed">
                Step-by-step lifecycle of the <strong>RGVP Customer Renewal & Billing Automation</strong>:
              </div>

              <div className="space-y-3 relative pl-6 border-l-2 border-blue-700/40">
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shadow">
                    1
                  </span>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">Asset Expiry Tracking</h4>
                      <span className="text-[10px] text-blue-400 font-mono">Continuous</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      System continuously calculates days remaining for all customer domains, servers, and IT AMC services.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[10px] shadow">
                    2
                  </span>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">CRON Automated 15-Day Sweep</h4>
                      <span className="text-[10px] text-amber-400 font-mono">Daily 00:00 AM</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      When an asset hits ≤ 15 days before expiry, the CRON engine flags the asset as <em>Expiring Soon</em> and auto-generates a dynamic GST invoice.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shadow">
                    3
                  </span>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">Branded Email & PDF Invoice Dispatch</h4>
                      <span className="text-[10px] text-indigo-400 font-mono">Automated SMTP</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Dispatches email from <code>sales@pandharkarsinfotech.com</code> to client (<code>billing@rgvp-solutions.com</code>) with attached official Tax Invoice and instant payment link.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px] shadow">
                    4
                  </span>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">Payment Settlement / Gateway Webhook</h4>
                      <span className="text-[10px] text-cyan-400 font-mono">Payment Gateway</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Payment is settled by the client via online gateway or recorded directly by administrator with automated transaction capture.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shadow">
                    5
                  </span>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs">Automated Reconciliation & Renewal</h4>
                      <span className="text-[10px] text-emerald-400 font-mono">Zero Manual Friction</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Gateway webhook automatically marks invoice "Paid", generates tax receipt, and extends asset expiry date by <strong>+365 days</strong>. Zero service downtime achieved!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPONENT DIRECTORY */}
          {activeTab === "components" && (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 text-xs">
              {Object.entries(nodeDetails).map(([key, item]) => (
                <div
                  key={key}
                  onClick={() => setSelectedNode(key)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    selectedNode === key
                      ? "bg-blue-600/30 border-blue-400 text-white"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <h5 className="font-bold text-xs">{item.title}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">{item.file}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-medium">
                    {item.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 5 Cols: Selected Node Inspector & Technical Metadata */}
        <div className="lg:col-span-5 bg-[#0b1c3a] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Node Inspector & Specifications
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
              {selectedData.role}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Component Name
              </span>
              <h4 className="text-sm font-extrabold text-white mt-0.5">{selectedData.title}</h4>
              <p className="text-[11px] font-mono text-cyan-400 mt-0.5">{selectedData.file}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Architecture Responsibility
              </span>
              {selectedData.description}
            </div>

            {selectedData.state && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  State Variables Managed
                </span>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  {selectedData.state.map((st, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedData.actions && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                  Actions & Event Triggers
                </span>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  {selectedData.actions.map((act, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] text-cyan-300 flex items-start gap-1.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compliance Note */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-slate-300 space-y-1">
              <p className="font-bold text-blue-300 uppercase text-[10px]">
                Company Standards & Compliance
              </p>
              <p>
                Strictly incorporates <strong>{COMPANY_PROFILE.name}</strong> branding, CIN{" "}
                <code>{COMPANY_PROFILE.cin}</code>, and GSTIN <code>{COMPANY_PROFILE.gstin}</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
