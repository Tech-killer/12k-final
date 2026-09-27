import React, { useState } from "react";
import {
  Server,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Mail,
  ArrowUpDown,
  RefreshCw,
  FileText,
  CreditCard,
  Lock,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Send,
  X
} from "lucide-react";
import {
  calculateDaysRemaining,
  getExpiryBadgeInfo,
  formatINR,
  formatDateDDMMYYYY,
  parseDateSafe
} from "../../data/mockData";
import RazorpayModal from "../payment/RazorpayModal";
import api from "../../services/apiService";

export const QUICK_DAY_PLANS = [
  { id: "1-day", shortLabel: "1 Day", label: "1 Day (Critical Test)", unit: "days", duration: 1, tag: "24h Critical", tagColor: "bg-rose-100 text-rose-800 border-rose-300", subtext: "24h Critical Test" },
  { id: "3-days", shortLabel: "3 Days", label: "3 Days (Urgent Radar)", unit: "days", duration: 3, tag: "Urgent", tagColor: "bg-orange-100 text-orange-800 border-orange-300", subtext: "Urgent Warning" },
  { id: "6-days", shortLabel: "6 Days", label: "6 Days (Expiring Soon)", unit: "days", duration: 6, tag: "Expiring", tagColor: "bg-amber-100 text-amber-800 border-amber-300", subtext: "Expiring Soon" },
  { id: "15-days", shortLabel: "15 Days", label: "15 Days (Radar Threshold)", unit: "days", duration: 15, tag: "Threshold", tagColor: "bg-yellow-100 text-yellow-800 border-yellow-300", subtext: "15-Day Radar" }
];

export const STANDARD_MONTH_PLANS = [
  { id: "3-months", shortLabel: "3 Months", label: "3 Months (Quarterly)", unit: "months", duration: 3, tag: "Quarterly", tagColor: "bg-blue-100 text-blue-800 border-blue-300", subtext: "Quarterly Term" },
  { id: "6-months", shortLabel: "6 Months", label: "6 Months (Half-Yearly)", unit: "months", duration: 6, tag: "Half-Year", tagColor: "bg-indigo-100 text-indigo-800 border-indigo-300", subtext: "Semi-Annual" },
  { id: "12-months", shortLabel: "12 Months", label: "12 Months (1 Year - Annual)", unit: "months", duration: 12, isDefault: true, tag: "Popular", tagColor: "bg-emerald-100 text-emerald-800 border-emerald-300", subtext: "1 Year Annual" },
  { id: "3-years", shortLabel: "3 Years", label: "3 Years (36 Months - Multi-Year)", unit: "months", duration: 36, tag: "Multi-Year", tagColor: "bg-purple-100 text-purple-800 border-purple-300", subtext: "3-Year Enterprise" }
];

export const ALL_BILLING_PLANS = [...QUICK_DAY_PLANS, ...STANDARD_MONTH_PLANS];
export const BILLING_PLANS = ALL_BILLING_PLANS;

export const PLAN_PRICING = {
  Domain: {
    "1-day": 99,
    "3-days": 199,
    "6-days": 299,
    "15-days": 399,
    "3-months": 499,
    "6-months": 899,
    "12-months": 1399,
    "3-years": 3799
  },
  "Server Hosting": {
    "1-day": 499,
    "3-days": 1299,
    "6-days": 2499,
    "15-days": 3999,
    "3-months": 5499,
    "6-months": 9999,
    "12-months": 18500,
    "3-years": 49999
  },
  Security: {
    "1-day": 299,
    "3-days": 699,
    "6-days": 1299,
    "15-days": 1899,
    "3-months": 2499,
    "6-months": 4499,
    "12-months": 7999,
    "3-years": 21999
  },
  "Support AMC": {
    "1-day": 1500,
    "3-days": 3500,
    "6-days": 7500,
    "15-days": 12000,
    "3-months": 18000,
    "6-months": 34000,
    "12-months": 65000,
    "3-years": 175000
  }
};

/**
 * Calculates future expiry date string (YYYY-MM-DD) for days or months.
 */
export const calculateExpiryDate = (plan, baseDateStr) => {
  const base = parseDateSafe(baseDateStr) || new Date();
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  if (plan?.unit === "days") {
    d.setDate(d.getDate() + Number(plan.duration));
  } else {
    const originalDay = d.getDate();
    d.setMonth(d.getMonth() + Number(plan?.duration || 12));
    if (d.getDate() !== originalDay) {
      d.setDate(0);
    }
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const getExpiryDateForDays = (days, baseDateStr) => {
  return calculateExpiryDate({ unit: "days", duration: days }, baseDateStr);
};

export const getExpiryDateForMonths = (months, baseDateStr) => {
  return calculateExpiryDate({ unit: "months", duration: months }, baseDateStr);
};

export default function AssetTracker({
  assets,
  invoices,
  onOpenInvoice,
  onAddNewAsset,
  onQuickRenew,
  onPaymentSuccess
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterUrgency, setFilterUrgency] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getTodayLocalYYYYMMDD = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [planMode, setPlanMode] = useState("days"); // 'days' for 1D, 3D, 6D, 15D or 'months' for 3M, 6M, 12M, 3Y
  const [selectedPlan, setSelectedPlan] = useState("1-day");
  const [startDate, setStartDate] = useState(getTodayLocalYYYYMMDD);

  // Email Payment Link Dispatched Modal & Resend State
  const [dispatchedData, setDispatchedData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState({});
  const [actionNotice, setActionNotice] = useState(null);

  // Razorpay Demo Payment State
  const [selectedRazorpayAsset, setSelectedRazorpayAsset] = useState(null);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);

  // Derive unique clients dynamically from loaded live assets
  const existingClients = Array.from(
    new Map(
      assets
        .filter((a) => a.clientName)
        .map((a) => [a.clientName, { name: a.clientName, email: a.clientEmail || "" }])
    ).values()
  );

  // New Asset form state with auto-calculated cost and expiry date matching selected plan
  const [newAsset, setNewAsset] = useState(() => {
    const today = getTodayLocalYYYYMMDD();
    return {
      name: "",
      type: "Domain Registration",
      category: "Domain",
      clientName: "",
      clientEmail: "",
      plan: "1-day",
      planDuration: 1,
      planUnit: "days",
      renewalCost: 99,
      expiryDate: calculateExpiryDate({ unit: "days", duration: 1 }, today)
    };
  });

  const handleOpenRegisterModal = () => {
    const today = getTodayLocalYYYYMMDD();
    const defaultExpiry = calculateExpiryDate({ unit: "days", duration: 1 }, today);
    setStartDate(today);
    setSelectedPlan("1-day");
    setPlanMode("days");
    setNewAsset({
      name: "",
      type: "Domain Registration",
      category: "Domain",
      clientName: "",
      clientEmail: "",
      plan: "1-day",
      planDuration: 1,
      planUnit: "days",
      renewalCost: PLAN_PRICING["Domain"]?.["1-day"] ?? 99,
      expiryDate: defaultExpiry
    });
    setIsModalOpen(true);
  };

  const handlePlanChange = (planId, currentCategory = newAsset.category, baseDate = startDate) => {
    setSelectedPlan(planId);
    const plan = ALL_BILLING_PLANS.find((p) => p.id === planId);
    if (plan?.unit === "days") {
      setPlanMode("days");
    } else if (plan?.unit === "months") {
      setPlanMode("months");
    }
    const autoCost = PLAN_PRICING[currentCategory]?.[planId] ?? 99;
    const autoExpiry = plan
      ? calculateExpiryDate(plan, baseDate)
      : calculateExpiryDate({ unit: "days", duration: 1 }, baseDate);

    setNewAsset((prev) => ({
      ...prev,
      plan: planId,
      planDuration: plan?.duration || 1,
      planUnit: plan?.unit || "days",
      renewalCost: autoCost,
      expiryDate: autoExpiry
    }));
  };

  const handleStartDateChange = (dateVal) => {
    setStartDate(dateVal);
    const plan = ALL_BILLING_PLANS.find((p) => p.id === selectedPlan);
    const autoExpiry = plan
      ? calculateExpiryDate(plan, dateVal)
      : calculateExpiryDate({ unit: "days", duration: 1 }, dateVal);

    setNewAsset((prev) => ({
      ...prev,
      expiryDate: autoExpiry
    }));
  };

  const handleCategoryChange = (newCat) => {
    const autoCost = PLAN_PRICING[newCat]?.[selectedPlan] ?? 99;
    let autoType = "Domain Registration";
    if (newCat === "Server Hosting") autoType = "Cloud VPS / Dedicated Server";
    else if (newCat === "Security") autoType = "Wildcard SSL Certificate";
    else if (newCat === "Support AMC") autoType = "IT DevOps & AMC Support";

    const plan = ALL_BILLING_PLANS.find((p) => p.id === selectedPlan);
    const autoExpiry = plan
      ? calculateExpiryDate(plan, startDate)
      : calculateExpiryDate({ unit: "days", duration: 1 }, startDate);

    setNewAsset((prev) => ({
      ...prev,
      category: newCat,
      type: autoType,
      renewalCost: autoCost,
      expiryDate: autoExpiry
    }));
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      (asset.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.clientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.type || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === "All" || asset.category === filterCategory;

    const days = calculateDaysRemaining(asset.expiryDate);
    let matchesUrgency = true;
    if (filterUrgency === "Critical") {
      matchesUrgency = days <= 15;
    } else if (filterUrgency === "Healthy") {
      matchesUrgency = days > 15;
    }

    return matchesSearch && matchesCategory && matchesUrgency;
  });

  const handleResendPaymentLink = async (asset) => {
    setIsSendingLink((prev) => ({ ...prev, [asset.id]: true }));
    setActionNotice(null);
    try {
      const res = await api.sendPaymentLink({
        assetId: asset.id,
        clientEmail: asset.clientEmail
      });
      if (res.success) {
        setActionNotice({
          type: "success",
          message: `Payment link & tax invoice dispatched to ${asset.clientEmail} via Hostinger SMTP!`
        });
      } else {
        setActionNotice({
          type: "error",
          message: res.message || "Failed to dispatch email via Hostinger."
        });
      }
    } catch (err) {
      setActionNotice({
        type: "error",
        message: err.message || "Network error dispatching email."
      });
    } finally {
      setIsSendingLink((prev) => ({ ...prev, [asset.id]: false }));
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    const plan = ALL_BILLING_PLANS.find((p) => p.id === selectedPlan);
    const assetPayload = {
      ...newAsset,
      id: "AST-" + Math.floor(1000 + Math.random() * 9000),
      clientName: newAsset.clientName.trim(),
      clientEmail: newAsset.clientEmail.trim(),
      status: "Due",
      autoRenew: false,
      hsnCode: "998313",
      plan: selectedPlan,
      planDuration: plan?.duration || 1,
      planUnit: plan?.unit || "days",
      description: `${newAsset.name} - ${plan?.shortLabel || "1 Day"} Renewal Plan`
    };

    setIsModalOpen(false);
    let creationRes = null;
    if (onAddNewAsset) {
      creationRes = await onAddNewAsset(assetPayload);
    }

    const hostOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
    const paymentUrl =
      creationRes?.data?.paymentLink ||
      `${hostOrigin}/?pay_invoice=${encodeURIComponent(
        creationRes?.data?.invoiceNumber || "PIPL/2026-27/INV-NEW"
      )}&pay_asset=${encodeURIComponent(assetPayload.id)}`;

    setDispatchedData({
      assetName: assetPayload.name,
      clientName: assetPayload.clientName,
      clientEmail: assetPayload.clientEmail,
      invoiceNumber: creationRes?.data?.invoiceNumber || "PIPL/2026-27/INV-NEW",
      renewalCost: assetPayload.renewalCost,
      expiryDate: assetPayload.expiryDate,
      paymentLink: paymentUrl,
      emailDispatched: creationRes?.data?.emailDispatched !== false
    });
  };

  const handleOpenRazorpay = (asset) => {
    setSelectedRazorpayAsset(asset);
    setIsRazorpayOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add Asset Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Digital Asset Inventory & Expiry Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time tracking of domains, cloud VPS, security certificates, and IT contracts
          </p>
        </div>

        <button
          onClick={handleOpenRegisterModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Asset</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-[#08152e] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search domain, server, client..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Category & Urgency Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Domain">Domains</option>
            <option value="Server Hosting">Server Hosting</option>
            <option value="Security">SSL Security</option>
            <option value="Support AMC">Support AMC</option>
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none"
          >
            <option value="All">All Urgencies</option>
            <option value="Critical">≤ 15 Days (Critical)</option>
            <option value="Healthy">&gt; 15 Days (Healthy)</option>
          </select>
        </div>
      </div>

      {/* Notice Banner */}
      {actionNotice && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
            actionNotice.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/60 border-red-500/40 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Assets Inventory Table (Showing Asset Name & Details, Client, Category, Days Remaining, and Payment Actions) */}
      <div className="bg-[#08152e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1d3d] text-slate-300 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Asset Name & Details</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Days Remaining</th>
                <th className="py-3.5 px-4 text-right">Payment Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Server className="w-8 h-8 text-slate-600" />
                      <p className="text-xs">No digital assets registered yet.</p>
                      <button
                        onClick={handleOpenRegisterModal}
                        className="mt-1 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30 transition-all cursor-pointer"
                      >
                        + Register First Customer Asset
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const inv = invoices.find(
                    (i) => i.assetId === asset.id || (asset.invoiceNumber && i.invoiceNumber === asset.invoiceNumber)
                  );
                  const isPaid = inv ? inv.status === "Paid" : asset.status === "Active" || asset.status === "Paid";
                  const totalPayable = Math.round((Number(asset.renewalCost) || 1399) * 1.18 * 100) / 100;
                  const days = calculateDaysRemaining(asset.expiryDate);
                  const badge = getExpiryBadgeInfo(days);

                  return (
                    <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Column 1: Asset Name & Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm tracking-tight">{asset.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-slate-300">
                            {asset.type} {asset.plan ? `(${ALL_BILLING_PLANS.find(p => p.id === asset.plan)?.shortLabel || asset.plan})` : ""}
                          </span>
                          <span>&bull;</span>
                          <span className="text-cyan-300 font-semibold font-mono">
                            {formatINR(asset.renewalCost)} + 18% GST
                          </span>
                          <span>&bull;</span>
                          <span className="text-slate-400">
                            Valid until: <strong className="text-slate-200">{formatDateDDMMYYYY(asset.expiryDate)}</strong>
                          </span>
                        </div>
                      </td>

                      {/* Column 2: Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200 text-xs">{asset.clientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{asset.clientEmail}</div>
                      </td>

                      {/* Column 3: Category */}
                      <td className="py-3.5 px-4">
                        <span className="asset-category-badge px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold inline-block">
                          {asset.category}
                        </span>
                      </td>

                      {/* Column 4: Days Remaining with Exact Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.bgColor}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.pillColor}`} />
                          {badge.label}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Expires: {formatDateDDMMYYYY(asset.expiryDate)}
                        </div>
                      </td>

                      {/* Column 5: Payment Action (Email Payment Link + Complete Payment) */}
                      <td className="py-3.5 px-4 text-right">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Paid</span>
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="Resend Payment Link & Tax Invoice Email to Client"
                              onClick={() => handleResendPaymentLink(asset)}
                              disabled={isSendingLink[asset.id]}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                            >
                              {isSendingLink[asset.id] ? (
                                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                              )}
                              <span>Resend Mail</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenRazorpay(asset)}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md shadow-blue-950/60 inline-flex items-center gap-1.5 transition-all cursor-pointer border border-cyan-400/40 hover:scale-[1.02]"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-cyan-200" />
                              <span>Pay ({formatINR(totalPayable)})</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Asset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0b1a34] border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
            <h3 className="text-base font-bold text-white mb-1">
              Register New Customer Digital Asset
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add domain, server hosting, or IT service with automated plan billing and expiry scheduling.
            </p>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Client Company</label>
                  <input
                    type="text"
                    required
                    list="client-suggestions"
                    placeholder="e.g. RG-VP Solutions Ltd"
                    value={newAsset.clientName}
                    onChange={(e) => {
                      const matched = existingClients.find(
                        (c) => c.name.toLowerCase() === e.target.value.toLowerCase()
                      );
                      setNewAsset({
                        ...newAsset,
                        clientName: e.target.value,
                        clientEmail: matched ? matched.email : newAsset.clientEmail
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                  <datalist id="client-suggestions">
                    {existingClients.map((c, idx) => (
                      <option key={idx} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Client Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. billing@company.com"
                    value={newAsset.clientEmail}
                    onChange={(e) => setNewAsset({ ...newAsset, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Asset / Domain Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rgvp-securecloud.in or AWS Cluster 04"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                />
              </div>

              {/* Service Category & Effective Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Service Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none font-medium"
                  >
                    <option value="Domain">Domain Registration</option>
                    <option value="Server Hosting">Server Hosting (Cloud VPS)</option>
                    <option value="Security">SSL Security Certificate</option>
                    <option value="Support AMC">Support & IT AMC</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Start / Activation Date</label>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {formatDateDDMMYYYY(startDate)}
                    </span>
                  </div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Billing Plan Duration Selector with Quick Days & Standard Term Tabs - Day Mode White Theme */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-3.5 shadow-md">
                {/* Header & Mode Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs transition-all ${
                      planMode === "days"
                        ? "bg-amber-50 border-amber-300 text-amber-600"
                        : "bg-blue-50 border-blue-300 text-blue-600"
                    }`}>
                      {planMode === "days" ? <Clock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-slate-900 font-extrabold text-xs block leading-tight">
                        Duration &amp; Expiry Plan
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {planMode === "days" ? "Urgent Expiry Radar (Days)" : "Commercial Lifecycle (Months/Years)"}
                      </span>
                    </div>
                  </div>

                  {/* Mode Pill Toggle: Quick Days vs Standard Months */}
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200/90 w-full sm:w-auto gap-1 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        setPlanMode("days");
                        if (!QUICK_DAY_PLANS.some((p) => p.id === selectedPlan)) {
                          handlePlanChange("1-day");
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        planMode === "days"
                          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-sm shadow-orange-500/30 ring-1 ring-amber-400"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Radar Test (1D, 3D, 6D, 15D)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPlanMode("months");
                        if (!STANDARD_MONTH_PLANS.some((p) => p.id === selectedPlan)) {
                          handlePlanChange("12-months");
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        planMode === "months"
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm shadow-blue-500/30 ring-1 ring-blue-400"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Standard (3M, 6M, 1Y, 3Y)</span>
                    </button>
                  </div>
                </div>

                {/* Info & Help Banner */}
                <div className={`p-2.5 rounded-xl border text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 transition-all shadow-xs ${
                  planMode === "days"
                    ? "bg-gradient-to-r from-amber-50 to-orange-50/50 border-amber-200/90 text-amber-950"
                    : "bg-gradient-to-r from-blue-50 to-cyan-50/50 border-blue-200/90 text-blue-950"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${
                      planMode === "days" ? "bg-amber-500" : "bg-blue-600"
                    }`} />
                    <span className="font-semibold">
                      {planMode === "days"
                        ? "⚡ Day Radar Mode: Simulates near-term expiry & triggers automated notices"
                        : "📅 Standard Term: Commercial billing term with statutory 18% GST"}
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border self-end sm:self-auto ${
                    planMode === "days"
                      ? "bg-amber-100/90 text-amber-800 border-amber-300"
                      : "bg-blue-100/90 text-blue-800 border-blue-300"
                  }`}>
                    Auto-fills Renewal &amp; Expiry
                  </span>
                </div>

                {/* 4 Cards for Active Mode */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(planMode === "days" ? QUICK_DAY_PLANS : STANDARD_MONTH_PLANS).map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    const price = PLAN_PRICING[newAsset.category]?.[plan.id] ?? 1399;
                    const planExpiry = calculateExpiryDate(plan, startDate);

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handlePlanChange(plan.id)}
                        className={`group relative p-2.5 sm:p-3 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between overflow-hidden ${
                          isSelected
                            ? planMode === "days"
                              ? "bg-gradient-to-b from-amber-50/90 via-orange-50/30 to-white border-2 border-amber-500 text-slate-900 shadow-md shadow-amber-500/15 ring-2 ring-amber-400/30 scale-[1.02]"
                              : "bg-gradient-to-b from-blue-50/90 via-cyan-50/30 to-white border-2 border-blue-600 text-slate-900 shadow-md shadow-blue-500/15 ring-2 ring-blue-400/30 scale-[1.02]"
                            : "bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 border-slate-200 hover:border-slate-300 shadow-xs"
                        }`}
                      >
                        {/* Top: Tag & Check */}
                        <div className="flex items-center justify-between w-full mb-1.5">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                            isSelected
                              ? `${plan.tagColor || "bg-slate-100 text-slate-800 border-slate-300"} ring-1.5 ring-amber-500/60 font-black shadow-xs`
                              : plan.tagColor || "bg-slate-100 text-slate-700 border-slate-200 font-semibold"
                          }`}>
                            {plan.tag || (planMode === "days" ? "Radar" : "Standard")}
                          </span>

                          {isSelected ? (
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white shadow-xs ${
                              planMode === "days" ? "bg-amber-500" : "bg-blue-600"
                            }`}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 group-hover:border-slate-400 bg-white" />
                          )}
                        </div>

                        {/* Title & Price */}
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm tracking-tight">
                            {plan.shortLabel}
                          </div>
                          <div className={`text-xs font-mono font-extrabold mt-0.5 ${
                            isSelected
                              ? planMode === "days" ? "text-amber-700 font-black" : "text-blue-700 font-black"
                              : "text-slate-600 font-bold"
                          }`}>
                            {formatINR(price)}
                          </div>
                        </div>

                        {/* Expiry Date on Card */}
                        <div className={`mt-2 pt-1.5 border-t text-[10px] font-mono flex items-center justify-between ${
                          isSelected
                            ? planMode === "days" ? "border-amber-200/80" : "border-blue-200/80"
                            : "border-slate-200/80"
                        }`}>
                          <span className="text-slate-500 font-medium">Expires:</span>
                          <span className={isSelected ? (planMode === "days" ? "text-amber-900 font-bold" : "text-blue-900 font-bold") : "text-slate-700 font-semibold"}>
                            {formatDateDDMMYYYY(planExpiry)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-filled Renewal Cost (INR) & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">
                      Renewal Cost (INR)
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      Auto-filled: {formatINR(newAsset.renewalCost)}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={newAsset.renewalCost}
                      onChange={(e) =>
                        setNewAsset({ ...newAsset, renewalCost: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                      INR + 18% GST
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">Expiry Date</label>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">
                      {formatDateDDMMYYYY(newAsset.expiryDate)}
                    </span>
                  </div>
                  <input
                    type="date"
                    required
                    value={newAsset.expiryDate}
                    onChange={(e) => setNewAsset({ ...newAsset, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Dynamic Summary Banner */}
              <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] transition-all ${
                planMode === "days"
                  ? "bg-amber-950/30 border-amber-500/40 text-amber-100"
                  : "bg-blue-950/40 border-blue-800/40 text-slate-300"
              }`}>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-semibold">Scheduled Term:</span>
                  <span className={`font-bold font-mono ${planMode === "days" ? "text-amber-300" : "text-cyan-300"}`}>
                    {BILLING_PLANS.find((p) => p.id === selectedPlan)?.shortLabel} ({formatINR(newAsset.renewalCost)} + 18% GST)
                  </span>
                </div>
                <div className="font-mono flex items-center gap-2 flex-wrap">
                  <span className="text-slate-300">
                    Expires: <strong className="text-white">{formatDateDDMMYYYY(newAsset.expiryDate)}</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    planMode === "days"
                      ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                      : "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                  }`}>
                    {calculateDaysRemaining(newAsset.expiryDate)} Days Remaining
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-blue-900/40 cursor-pointer"
                >
                  Save to Radar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Link Dispatched Confirmation Modal */}
      {dispatchedData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-800 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            {/* Close X Button */}
            <button
              type="button"
              onClick={() => setDispatchedData(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start sm:items-center gap-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                <Mail className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono text-emerald-700 uppercase tracking-wider font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Email Dispatched via Hostinger SMTP
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
                  Customer Asset Registered &amp; Link Sent!
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
              An official GST tax invoice and secure online payment link have been dispatched to{" "}
              <strong className="text-blue-700 font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-semibold">{dispatchedData.clientEmail}</strong>. The customer can open their email to pay directly online.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs font-mono space-y-2.5 shadow-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span className="font-medium text-slate-600">Digital Asset:</span>
                <span className="text-slate-900 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{dispatchedData.assetName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span className="font-medium text-slate-600">Invoice Number:</span>
                <span className="text-blue-700 font-bold bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/80">{dispatchedData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span className="font-medium text-slate-600">Total Payable:</span>
                <span className="text-emerald-700 font-black text-sm">{formatINR(Number(dispatchedData.renewalCost) * 1.18)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span className="font-medium text-slate-600">Scheduled Expiry:</span>
                <span className="text-slate-800 font-semibold">
                  {formatDateDDMMYYYY(dispatchedData.expiryDate)}{" "}
                  <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    ({calculateDaysRemaining(dispatchedData.expiryDate)} Days Remaining)
                  </span>
                </span>
              </div>
            </div>

            {/* Direct Customer Payment Link */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Direct Customer Payment Link:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={dispatchedData.paymentLink}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-blue-700 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 select-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(dispatchedData.paymentLink);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:shadow"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                disabled={isSendingLink[dispatchedData.clientEmail]}
                onClick={async () => {
                  setIsSendingLink((prev) => ({ ...prev, [dispatchedData.clientEmail]: true }));
                  try {
                    const res = await api.sendPaymentLink({
                      clientEmail: dispatchedData.clientEmail,
                      invoiceNumber: dispatchedData.invoiceNumber
                    });
                    if (res.success) {
                      setActionNotice({
                        type: "success",
                        message: `Payment link & tax invoice email resent to ${dispatchedData.clientEmail}!`
                      });
                    }
                  } catch (e) {
                    setActionNotice({
                      type: "error",
                      message: e.message || "Failed to resend email."
                    });
                  } finally {
                    setIsSendingLink((prev) => ({ ...prev, [dispatchedData.clientEmail]: false }));
                    setTimeout(() => setActionNotice(null), 5000);
                  }
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSendingLink[dispatchedData.clientEmail] ? (
                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Resend Mail</span>
              </button>
              <a
                href={dispatchedData.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Client Checkout</span>
              </a>
              <button
                type="button"
                onClick={() => setDispatchedData(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Demo Payment Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        asset={selectedRazorpayAsset}
        invoice={
          selectedRazorpayAsset
            ? invoices.find(
                (i) =>
                  i.assetId === selectedRazorpayAsset.id ||
                  (selectedRazorpayAsset.invoiceNumber &&
                    i.invoiceNumber === selectedRazorpayAsset.invoiceNumber)
              )
            : null
        }
        onPaymentSuccess={async (result) => {
          if (onPaymentSuccess) {
            await onPaymentSuccess(result);
          }
        }}
      />
    </div>
  );
}
