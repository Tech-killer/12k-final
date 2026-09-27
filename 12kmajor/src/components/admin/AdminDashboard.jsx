import React from "react";
import {
  Server,
  AlertTriangle,
  Clock,
  TrendingUp,
  CreditCard,
  BellRing,
  FileCheck,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import {
  COMPANY_PROFILE,
  formatINR,
  calculateDaysRemaining,
  getExpiryBadgeInfo,
  formatDateDDMMYYYY
} from "../../data/mockData";

export default function AdminDashboard({
  assets,
  invoices,
  onNavigateTab,
  onTriggerCron,
  onOpenInvoice,
  isCronRunning,
  companyProfile = COMPANY_PROFILE
}) {
  // Metrics calculation
  const totalAssets = assets.length;
  const criticalAssets = assets.filter((a) => {
    const days = calculateDaysRemaining(a.expiryDate);
    return days <= 15;
  });

  const revenueAtRisk = criticalAssets.reduce((sum, a) => sum + (Number(a.renewalCost) || 0) * 1.18, 0);

  const totalCollected = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);

  const pendingInvoices = invoices.filter((inv) => inv.status === "Due");

  return (
    <div className="space-y-6">
      {/* Top Banner with Company Info & CRON Trigger */}
      <div className="admin-hero-banner p-6 rounded-2xl bg-gradient-to-r from-[#0b244d] via-[#0d2e61] to-[#071733] border border-blue-800/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="admin-banner-pill inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Team Beta - RGVP Customer Renewal & Billing Automation</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Centralized Renewal Tracking Dashboard
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Welcome to the command center for <strong className="text-white">{companyProfile?.name || COMPANY_PROFILE.name}</strong>.
            Actively monitoring digital domains, cloud VPS servers, SSL certificates, and annual IT maintenance contracts to prevent service downtime.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onTriggerCron}
            disabled={isCronRunning}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-950/60 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isCronRunning ? (
              <>
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Running 15-Day Sweep...</span>
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4 text-cyan-200" />
                <span>Run 15-Day CRON Scan</span>
              </>
            )}
          </button>

          <button
            onClick={() => onNavigateTab("admin-assets")}
            className="admin-btn-secondary px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Asset Inventory</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monitored Assets */}
        <div className="p-5 rounded-2xl bg-[#091833] border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Managed Assets</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalAssets}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Monitored</span>
          </div>
          <p className="text-[11px] text-slate-400">Domains, VPS nodes, SSL & IT AMCs</p>
        </div>

        {/* Card 2: Critical Expirations (<= 15 Days) */}
        <div className="p-5 rounded-2xl bg-[#1b1527] border border-amber-500/30 shadow-md space-y-2">
          <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
            <span>Expiring ≤ 15 Days</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-300">
              {criticalAssets.length}
            </span>
            <span className="text-xs text-amber-400 font-medium">Action Required</span>
          </div>
          <p className="text-[11px] text-slate-400">Automated reminder emails queued</p>
        </div>

        {/* Card 3: Revenue at Risk */}
        <div className="p-5 rounded-2xl bg-[#091833] border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Renewal Revenue at Risk</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {formatINR(revenueAtRisk)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Expiring invoices awaiting payment</p>
        </div>

        {/* Card 4: Collected Revenue */}
        <div className="p-5 rounded-2xl bg-[#091833] border border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Auto-Reconciled Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
              {formatINR(totalCollected)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">GST verified & receipts issued</p>
        </div>
      </div>

      {/* Critical 15-Day Alert Warning Banner */}
      {criticalAssets.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Critical Alert: {criticalAssets.length} Customer Assets Require Immediate Renewal
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Assets are expiring within 15 days. Automated notification engine has generated GST proforma invoices to avoid client downtime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab("admin-cron")}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Inspect CRON Dispatch</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Assets Expiring Soon (Highlight Table) */}
      <div className="bg-[#08152e] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Priority Renewal Radar (Urgent Watchlist)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Digital assets sorted by upcoming expiration date
            </p>
          </div>

          <button
            onClick={() => onNavigateTab("admin-assets")}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>View All ({assets.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1e3d] text-slate-300 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Digital Asset & Type</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Renewal Cost</th>
                <th className="py-3 px-4">Days Remaining</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {assets.slice(0, 5).map((asset) => {
                const days = calculateDaysRemaining(asset.expiryDate);
                const badge = getExpiryBadgeInfo(days);

                return (
                  <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{asset.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{asset.type}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{asset.clientName}</div>
                      <div className="text-[10px] text-slate-400">{asset.clientEmail}</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="font-semibold text-slate-200 text-xs">
                        {formatDateDDMMYYYY(asset.expiryDate)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {asset.expiryDate}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {formatINR(asset.renewalCost)}
                      <span className="text-[10px] text-slate-400 block font-sans">+18% GST</span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.bgColor}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.pillColor}`} />
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          const inv = invoices.find((i) => i.assetId === asset.id);
                          if (inv) onOpenInvoice(inv);
                          else onNavigateTab("admin-invoices");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-medium transition-all"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
