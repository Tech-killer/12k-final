import React, { useState, useEffect } from "react";
import {
  BellRing,
  Mail,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Send,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Paperclip,
  Activity,
  Copy,
  Check
} from "lucide-react";
import {
  COMPANY_PROFILE,
  calculateDaysRemaining,
  formatINR
} from "../../data/mockData";
import api from "../../services/apiService";

export default function NotificationEngine({
  assets = [],
  invoices = [],
  cronLogs = [],
  onTriggerCron,
  onOpenInvoice,
  isCronRunning,
  companyProfile = COMPANY_PROFILE
}) {
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const activeAsset = (selectedAssetId ? assets.find((a) => a.id === selectedAssetId) : null) || assets[0] || null;
  const previewAsset = activeAsset;

  // CRON Scheduler Pause / Resume State
  const [cronStatus, setCronStatus] = useState({ isPaused: false, autoSweepEnabled: true });
  const [isTogglingPause, setIsTogglingPause] = useState(false);

  // Send Single Renewal Notice State
  const [isSendingSingle, setIsSendingSingle] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.getCronStatus().then((res) => {
      if (isMounted && res && res.success && res.data) {
        setCronStatus(res.data);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleTogglePause = async () => {
    setIsTogglingPause(true);
    try {
      const res = await api.toggleCronPause(!cronStatus.isPaused);
      if (res.success && res.data) {
        setCronStatus(res.data);
        setActionNotice({
          type: res.data.isPaused ? "warning" : "success",
          message: res.data.message || `Auto-CRON has been ${res.data.isPaused ? "PAUSED" : "RESUMED"}.`
        });
      }
    } catch (err) {
      setActionNotice({
        type: "error",
        message: err.message || "Failed to toggle CRON status."
      });
    } finally {
      setIsTogglingPause(false);
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  const handleSendSingleEmail = async () => {
    if (!previewAsset) return;
    setIsSendingSingle(true);
    try {
      const res = await api.sendRenewalNotice({
        assetId: previewAsset.id,
        clientEmail: previewAsset.clientEmail,
        invoiceNumber: matchingInvoice?.invoiceNumber
      });
      if (res.success) {
        setActionNotice({
          type: "success",
          message: `Branded renewal notice with payment link dispatched to ${previewAsset.clientEmail} via Hostinger SMTP!`
        });
      } else {
        setActionNotice({
          type: "error",
          message: res.message || res.error || "Failed to dispatch email."
        });
      }
    } catch (err) {
      setActionNotice({
        type: "error",
        message: err.message || "Error dispatching renewal email."
      });
    } finally {
      setIsSendingSingle(false);
      setTimeout(() => setActionNotice(null), 6000);
    }
  };

  const expiringAssets = assets.filter((a) => {
    const days = calculateDaysRemaining(a.expiryDate);
    return days <= 15;
  });

  const matchingInvoice = invoices.find(
    (inv) => inv.assetId === (activeAsset ? activeAsset.id : null)
  );

  const daysRemaining = previewAsset ? calculateDaysRemaining(previewAsset.expiryDate) : 6;
  
  const getDaysBadgeStyle = (days) => {
    if (days <= 1) return "bg-rose-50 text-rose-700 border-rose-200";
    if (days <= 3) return "bg-orange-50 text-orange-700 border-orange-200";
    if (days <= 6) return "bg-amber-50 text-amber-800 border-amber-200";
    return "bg-yellow-50 text-yellow-800 border-yellow-200";
  };

  const planExtensionText = previewAsset?.planDuration
    ? `+${previewAsset.planDuration} ${previewAsset.planUnit === "days" ? (previewAsset.planDuration === 1 ? "day" : "days") : (previewAsset.planDuration === 1 ? "month" : "months")}`
    : "+1 year";

  const hostOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const previewPaymentUrl = `${hostOrigin}/?pay_invoice=${encodeURIComponent(
    matchingInvoice?.invoiceNumber || "PIPL/2026-27/INV-995"
  )}&pay_asset=${encodeURIComponent(previewAsset?.id || "AST-1840")}`;

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-md transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            actionNotice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : actionNotice.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs font-bold underline hover:opacity-75 cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Engine Status Banner with Auto Pause / Resume Controls */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Subtle decorative daylight gradient glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-blue-100/70 via-indigo-50/50 to-cyan-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            {cronStatus.isPaused ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                CRON Auto-Scheduler: PAUSED (Manual Only)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                CRON Auto-Scheduler: ACTIVE (Automatic Sweeps Running)
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs">
              <BellRing className="w-3.5 h-3.5 text-blue-600" />
              <span>Daily 15-Day Radar Detection</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Automated Notification Engine &amp; CRON Dispatcher
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Continuously evaluates active client domains, hosting servers, and IT AMC services.
            Automatically drafts official GST invoices and dispatches branded reminder emails with embedded payment links 15 days prior to expiration to extend customer subscriptions.
          </p>
        </div>

        {/* Controls: Pause/Resume Toggle + Manual Sweep Trigger */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <button
            onClick={handleTogglePause}
            disabled={isTogglingPause}
            className={`px-4 py-3.5 rounded-2xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer border hover:scale-[1.02] ${
              cronStatus.isPaused
                ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800"
                : "bg-white hover:bg-slate-50 border-amber-300 text-amber-800"
            }`}
            title={cronStatus.isPaused ? "Resume automated daily background sweeps" : "Pause automated daily sweeps (manual only)"}
          >
            {isTogglingPause ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : cronStatus.isPaused ? (
              <Play className="w-4 h-4 text-emerald-600 fill-emerald-500" />
            ) : (
              <Pause className="w-4 h-4 text-amber-600 fill-amber-500" />
            )}
            <span>{cronStatus.isPaused ? "Resume Auto-CRON" : "Pause Auto-CRON"}</span>
          </button>

          <button
            onClick={onTriggerCron}
            disabled={isCronRunning}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
          >
            {isCronRunning ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Executing 15-Day Sweep &amp; Sending Mails...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Scheduled CRON Run Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. Outbound Email Dispatch Preview - Horizontal Full Card */}
      <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/40 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Automated Outbound Email Dispatch Preview
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Live interactive rendering of the email dispatched to clients at 15 days threshold to extend subscriptions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-500">Target Asset:</span>
            <select
              value={activeAsset ? activeAsset.id : ""}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({calculateDaysRemaining(a.expiryDate)}d left)
                </option>
              ))}
            </select>

            {/* Separate Manual Send Button */}
            <button
              onClick={handleSendSingleEmail}
              disabled={isSendingSingle || !previewAsset}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-60"
              title="Dispatch this exact renewal email notice to the selected client right now"
            >
              {isSendingSingle ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-blue-100" />
                  <span>Send This Email Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Email Client Simulated Window */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden text-xs shadow-md shadow-slate-100 max-w-4xl mx-auto">
          {/* Email Meta Info Header */}
          <div className="p-4 bg-slate-50/90 border-b border-slate-200 space-y-2 font-mono text-[11px]">
            <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
              <span>
                <strong className="text-slate-800 font-semibold font-sans">From:</strong>{" "}
                {companyProfile?.name || COMPANY_PROFILE.name} &lt;{companyProfile?.email || COMPANY_PROFILE.email}&gt;
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Status: Sent via CRON
              </span>
            </div>
            <div className="text-slate-600">
              <strong className="text-slate-800 font-semibold font-sans">To:</strong>{" "}
              <span className="text-blue-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                {activeAsset ? activeAsset.clientEmail : (companyProfile?.email || "billing@customer.com")}
              </span>
            </div>
            <div className="text-slate-900 font-sans font-bold bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-blue-600 font-semibold">Subject:</span> [URGENT RENEWAL] Your service{" "}
              {activeAsset?.name || "Digital Service"} expires in{" "}
              {activeAsset ? calculateDaysRemaining(activeAsset.expiryDate) : 15} days
            </div>
          </div>

          {/* Email Body Content with Company Logo */}
          <div className="p-5 sm:p-6 space-y-4 font-sans text-slate-700 bg-white">
            {/* Branded Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-cyan-50/40 border border-blue-100 flex items-center justify-between shadow-2xs">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
                  {companyProfile?.name || COMPANY_PROFILE.name}
                </h4>
                <p className="text-[11px] text-blue-700 italic font-medium">"{companyProfile?.tagline || COMPANY_PROFILE.tagline}"</p>
                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                  CIN: {COMPANY_PROFILE.cin} | GSTIN: {COMPANY_PROFILE.gstin}
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-blue-500/20">
                PI
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p>
                Dear <strong className="text-slate-900 font-bold">{previewAsset?.clientName || "Valued Client"}</strong>,
              </p>
              <p>
                This is an automated system notification from Pandharkars Infotech Customer Renewal Engine.
                Our monitoring systems have flagged that the following digital asset will expire within{" "}
                <strong className="text-slate-900 font-bold">15 days</strong>:
              </p>
            </div>

            {/* Asset Highlight Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5 shadow-2xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Service Description
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm mt-0.5">{previewAsset?.name}</h5>
                  <p className="text-xs text-slate-500 font-medium">{previewAsset?.type}</p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-2xs ${getDaysBadgeStyle(daysRemaining)}`}>
                  {daysRemaining} {daysRemaining === 1 ? "Day" : "Days"} Left
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-baseline text-xs">
                <span className="text-slate-600 font-medium">Annual Renewal Fee:</span>
                <span className="font-bold font-mono text-emerald-700 text-sm">
                  {formatINR(previewAsset?.renewalCost || 99)} + 18% GST
                </span>
              </div>
            </div>

            {/* Attached Proforma Invoice Pill */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Attached Tax Invoice: {matchingInvoice?.invoiceNumber || "PIPL/2026-27/INV-0841"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Official GST Compliant Proforma Invoice (PDF)
                  </p>
                </div>
              </div>

              {matchingInvoice && (
                <button
                  onClick={() => onOpenInvoice(matchingInvoice)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>View PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Payment Button CTA in Email - Interactive Link */}
            <div className="pt-2 text-center space-y-3">
              <a
                href={previewPaymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                Click to Pay Online Securely (Instant Auto-Reconciliation) &rarr;
              </a>

              <p className="text-[11px] text-slate-500">
                Payments made via UPI, NetBanking, or Cards are automatically reconciled with renewal extended {planExtensionText}.
              </p>

              {/* Direct Link Copy Capsule */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-mono max-w-full">
                <span className="font-semibold text-slate-500">Payment Link:</span>
                <span className="text-blue-700 font-mono truncate max-w-xs">{previewPaymentUrl}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(previewPaymentUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="p-1 rounded hover:bg-slate-200 text-slate-700 cursor-pointer ml-1"
                  title="Copy Direct Payment Link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Automated CRON Execution Logs - Horizontal Full Card */}
      <div className="w-full bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/40 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Automated CRON Execution Logs
                </h3>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                  {cronLogs.length} {cronLogs.length === 1 ? "Sweep" : "Sweeps"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Real-time history of scheduled daily background scans &amp; automated notification runs
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Heartbeat: OK
          </span>
        </div>

        <div className="space-y-3.5">
          {cronLogs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-slate-600 text-xs space-y-1.5">
              <p className="font-bold text-slate-700 text-sm">No CRON executions logged yet in the database.</p>
              <p className="text-xs text-slate-500">
                Click "Simulate Scheduled CRON Run Now" above to trigger your first sweep.
              </p>
            </div>
          ) : (
            cronLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-sm">{log.event}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border uppercase tracking-wider ${
                        log.status === "Success" || log.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : log.status === "Paused"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {log.status}
                    </span>
                    <span className="bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 font-semibold text-slate-700 font-mono text-[11px] shadow-2xs">
                      ID: {log.id}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                    {log.details}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center font-mono text-[10px] shrink-0 w-full lg:w-72">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500 block font-sans font-semibold text-[10px]">Evaluated</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block">{log.assetsEvaluated}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 shadow-2xs">
                    <span className="text-amber-800 block font-sans font-semibold text-[10px]">&le; 15d Due</span>
                    <span className="font-black text-amber-800 text-sm mt-0.5 block">{log.expiringDetected}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 shadow-2xs">
                    <span className="text-blue-800 block font-sans font-semibold text-[10px]">Dispatched</span>
                    <span className="font-black text-blue-800 text-sm mt-0.5 block">{log.emailsDispatched}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
