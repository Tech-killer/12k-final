import React from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  Sparkles,
  Lock,
  Clock,
  ExternalLink
} from "lucide-react";
import { COMPANY_PROFILE, formatINR, formatDateDDMMYYYY } from "../../data/mockData";

export default function ReconciliationEngine({
  transactions = [],
  invoices = [],
  assets = [],
  onSimulateWebhook,
  onOpenRazorpay,
  companyProfile = COMPANY_PROFILE
}) {
  const pendingInvoices = invoices.filter((i) => i.status === "Due");
  const settledTransactions = transactions;
  const totalSettledAmount = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="admin-hero-banner p-6 rounded-3xl bg-gradient-to-r from-[#0b2447] via-[#0d2a57] to-[#07162d] border border-blue-800/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Automated Payment Gateway Webhook Reconciliation</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Gateway Sync & Automated Reconciliation
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Eliminating administrative bottlenecks and payment chasing. When client settles an invoice via Razorpay or UPI, the webhook automatically verifies the signature, marks invoice <strong>PAID</strong>, issues a tax receipt, and adds <strong>+365 days</strong> to the digital asset expiry date.
          </p>
        </div>

        {/* Quick Simulation Trigger */}
        <div className="shrink-0 flex flex-col sm:flex-row gap-2">
          {pendingInvoices.length > 0 ? (
            <button
              onClick={() => onSimulateWebhook(pendingInvoices[0])}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Simulate Webhook ({pendingInvoices[0].invoiceNumber})</span>
            </button>
          ) : (
            <button
              onClick={() => onSimulateWebhook(invoices[0])}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Simulate Gateway Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Reconciliation Status Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#08152e] border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-semibold">Gateway Audit Transactions</div>
          <div className="text-xl font-black text-white font-mono">{transactions.length} Verified</div>
          <div className="text-[11px] text-emerald-400 font-mono">100% HMAC Authenticated</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#08152e] border border-emerald-900/40 space-y-1">
          <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reconciled Settlement Value</span>
          </div>
          <div className="text-xl font-black text-emerald-300 font-mono">{formatINR(totalSettledAmount)}</div>
          <div className="text-[11px] text-slate-400">Captured in Hostinger MariaDB</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#08152e] border border-amber-900/40 space-y-1">
          <div className="text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Invoices</span>
          </div>
          <div className="text-xl font-black text-amber-300 font-mono">{pendingInvoices.length} Due</div>
          <div className="text-[11px] text-slate-400">Awaiting automated gateway trigger</div>
        </div>
      </div>

      {/* 3-Step Visual Reconciliation Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#08152e] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Gateway Event Capture</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Customer completes payment via UPI / Cards. Razorpay/Stripe securely fires <code>payment.captured</code> webhook to Pandharkars Infotech.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#08152e] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Automated Match & Settle</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            System verifies HMAC signature, matches customer GSTIN and invoice number, and updates status to <strong>PAID IN FULL</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#08152e] border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Asset Extension & Receipt</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Digital asset expiry is extended by <strong>365 Days</strong> automatically. Official GST receipt is sent to client email with zero downtime.
          </p>
        </div>
      </div>

      {/* Pending Due Invoices Awaiting Settlement */}
      {pendingInvoices.length > 0 && (
        <div className="bg-[#08152e] border border-amber-900/40 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Pending Due Invoices Awaiting Settlement ({pendingInvoices.length})
              </h3>
            </div>
            <span className="text-[11px] text-amber-300 font-mono">Real-time Webhook Listeners Ready</span>
          </div>

          <div className="divide-y divide-slate-800">
            {pendingInvoices.map((inv) => (
              <div key={inv.invoiceNumber} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300 text-xs">{inv.invoiceNumber}</span>
                    <span className="text-xs text-white font-semibold">{inv.clientName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {inv.items?.[0]?.description || "Digital Service"} &bull; Due: {formatDateDDMMYYYY(inv.dueDate)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white text-xs">{formatINR(inv.total)}</span>
                  <button
                    onClick={() => onSimulateWebhook(inv)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-yellow-200" />
                    <span>Simulate Razorpay Webhook</span>
                  </button>
                  {onOpenRazorpay && (
                    <button
                      onClick={() => onOpenRazorpay(inv)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Checkout Demo</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Transaction Reconciliation Log */}
      <div className="bg-[#08152e] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Payment Gateway Ledger & Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified automated gateway events and reconciliation records stored in MySQL table <code>transactions</code>
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">Sync Mode: Real-time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c1e3d] text-slate-300 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Gateway & Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Automated Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CreditCard className="w-8 h-8 text-slate-600" />
                      <p>No payment gateway transactions recorded in the database yet.</p>
                      {invoices.length > 0 && (
                        <button
                          onClick={() => onSimulateWebhook(invoices[0])}
                          className="mt-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition-all cursor-pointer"
                        >
                          + Simulate First Webhook Settlement
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((txn, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">{txn.txnId}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">{txn.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{txn.clientName}</td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{txn.gateway}</div>
                      {txn.timestamp && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{txn.timestamp}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                      {formatINR(txn.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Reconciled
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-300 max-w-xs leading-relaxed">
                      {txn.reconciliationNote}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
