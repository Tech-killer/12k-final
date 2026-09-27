import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Building2,
  Calendar,
  Clock,
  Printer,
  FileText,
  ArrowRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Mail,
  Lock,
  ArrowLeft,
  XCircle,
  AlertCircle,
  X
} from "lucide-react";
import { formatINR, formatDateDDMMYYYY, calculateDaysRemaining, getExpiryBadgeInfo, COMPANY_PROFILE } from "../../data/mockData";
import RazorpayModal from "./RazorpayModal";
import api from "../../services/apiService";

export default function ClientPaymentPortal({
  payInvoiceNumber,
  payAssetId
}) {
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [asset, setAsset] = useState(null);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const [isLinkExpired, setIsLinkExpired] = useState(false);

  const handleCloseWindow = () => {
    try {
      window.close();
    } catch (e) {
      console.warn("window.close() notice:", e);
    }
    setIsClosed(true);
  };

  // Load invoice and asset details
  useEffect(() => {
    let isMounted = true;
    async function fetchCheckoutData() {
      setLoading(true);
      setErrorMessage(null);
      try {
        let matchedInv = null;
        let matchedAsset = null;

        // 1. Fetch invoices
        const invRes = await api.getInvoices();
        if (invRes.success && Array.isArray(invRes.data)) {
          if (payInvoiceNumber) {
            matchedInv = invRes.data.find(
              (i) => i.invoiceNumber.toLowerCase() === payInvoiceNumber.toLowerCase()
            );
          }
          if (!matchedInv && payAssetId) {
            matchedInv = invRes.data.find((i) => i.assetId === payAssetId);
          }
        }

        // 2. Fetch assets
        const astRes = await api.getAssets();
        if (astRes.success && Array.isArray(astRes.data)) {
          if (payAssetId) {
            matchedAsset = astRes.data.find((a) => a.id === payAssetId);
          }
          if (!matchedAsset && matchedInv?.assetId) {
            matchedAsset = astRes.data.find((a) => a.id === matchedInv.assetId);
          }
        }

        if (!isMounted) return;

        // Fallback synthetic mock if fresh
        if (!matchedInv && !matchedAsset) {
          matchedInv = {
            invoiceNumber: payInvoiceNumber || "PIPL/2026-27/INV-701",
            date: new Date().toISOString().slice(0, 10),
            dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
            clientName: "Valued Client",
            clientEmail: "billing@client.com",
            items: [{ description: "Digital Asset Plan Renewal", rate: 199, qty: 1, amount: 199 }],
            subtotal: 199,
            cgst: 17.91,
            sgst: 17.91,
            total: 234.82,
            status: "Due"
          };
          matchedAsset = {
            id: payAssetId || "AST-001",
            name: "Cloud Asset & Domain Service",
            type: "Domain Registration",
            category: "Domain",
            clientName: "Valued Client",
            clientEmail: "billing@client.com",
            renewalCost: 199,
            expiryDate: matchedInv.dueDate,
            status: "Due"
          };
        } else if (!matchedAsset && matchedInv) {
          matchedAsset = {
            id: matchedInv.assetId || "AST-AUTO",
            name: matchedInv.items?.[0]?.description || "Digital Service Subscription",
            type: "Domain / IT Cloud Infrastructure",
            category: "Domain",
            clientName: matchedInv.clientName,
            clientEmail: matchedInv.clientEmail,
            renewalCost: matchedInv.subtotal,
            expiryDate: matchedInv.dueDate,
            status: matchedInv.status === "Paid" ? "Paid" : "Due"
          };
        } else if (!matchedInv && matchedAsset) {
          const sub = Number(matchedAsset.renewalCost) || 199;
          const tax = Math.round(sub * 0.18 * 100) / 100;
          matchedInv = {
            invoiceNumber: payInvoiceNumber || `PIPL/2026-27/INV-${Math.floor(800 + Math.random() * 200)}`,
            date: new Date().toISOString().slice(0, 10),
            dueDate: matchedAsset.expiryDate,
            assetId: matchedAsset.id,
            clientName: matchedAsset.clientName,
            clientEmail: matchedAsset.clientEmail,
            items: [{ description: `${matchedAsset.name} Renewal`, rate: sub, qty: 1, amount: sub }],
            subtotal: sub,
            cgst: Math.round((tax / 2) * 100) / 100,
            sgst: Math.round((tax / 2) * 100) / 100,
            total: Math.round((sub + tax) * 100) / 100,
            status: matchedAsset.status === "Paid" || matchedAsset.status === "Active" ? "Paid" : "Due"
          };
        }

        setInvoice(matchedInv);
        setAsset(matchedAsset);
        // Link auto-expires if invoice is paid or asset active/paid
        if (
          matchedInv.status === "Paid" ||
          matchedInv.paymentLinkExpired ||
          matchedAsset?.status === "Paid"
        ) {
          setIsLinkExpired(true);
        }
      } catch (err) {
        if (isMounted) setErrorMessage(err.message || "Failed to load payment invoice.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchCheckoutData();
    return () => {
      isMounted = false;
    };
  }, [payInvoiceNumber, payAssetId]);

  const handlePaymentSuccess = async (resultPayload) => {
    setPaymentSuccessData(resultPayload);
    setIsRazorpayOpen(false);

    try {
      if (invoice?.invoiceNumber) {
        await api.settleInvoice(invoice.invoiceNumber, resultPayload.paymentMethod || "Razorpay Direct");
      }
      if (asset?.id) {
        await api.updateAsset(asset.id, { status: "Active" });
      }
      setInvoice((prev) => (prev ? { ...prev, status: "Paid" } : prev));
      setAsset((prev) => (prev ? { ...prev, status: "Active" } : prev));
    } catch (e) {
      console.warn("Client settle notice:", e);
    }
  };

  const daysRemaining = calculateDaysRemaining(asset?.expiryDate || invoice?.dueDate);
  const badgeInfo = getExpiryBadgeInfo(daysRemaining);

  if (isClosed) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/70 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Payment Session Completed</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your payment has been securely recorded and service renewal is scheduled. You may now safely close this browser window or tab.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsClosed(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer transition-all shadow-xs"
            >
              View Receipt Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar with Brand and Security Indicator (No Admin Portal Button) */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md shadow-blue-500/20">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center font-black text-blue-600 text-sm tracking-tighter">
              PI
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
              <span>{COMPANY_PROFILE.name}</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-semibold">
                SECURE CHECKOUT
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono">
              Official GST Compliant Payment Portal &bull; CIN: {COMPANY_PROFILE.cin}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline font-semibold">256-Bit SSL Encrypted</span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-mono">Verifying tax invoice & payment link...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center space-y-3">
            <h3 className="text-base font-bold text-red-700">Payment Invoice Notice</h3>
            <p className="text-xs text-slate-600">{errorMessage}</p>
          </div>
        ) : isLinkExpired ? (
          /* Payment Link Expired View (Payment Already Completed) */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/70 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-600 shadow-md">
                <Clock className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 uppercase tracking-wider mb-2 font-mono">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>Payment Link Expired &bull; Already Paid</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  This Payment Link Has Expired
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
                  The subscription renewal for <strong className="text-slate-900">{asset?.name}</strong> has already been fully paid and confirmed. Single-use payment links automatically expire once payment is done to prevent duplicate billing.
                </p>
              </div>

              {/* Settled Details Summary Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left font-mono text-xs space-y-2.5 max-w-lg mx-auto text-slate-700">
                <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                  <span>Proforma Tax Invoice:</span>
                  <span className="text-slate-900 font-bold">{invoice?.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Digital Asset:</span>
                  <span className="text-blue-600 font-bold">{asset?.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Customer / Billed To:</span>
                  <span className="text-slate-800 font-medium">{invoice?.clientName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Amount Settled:</span>
                  <span className="text-emerald-600 font-bold text-sm">
                    {formatINR(invoice?.total || 234.82)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Digital Asset Protection:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Active &amp; Renewed</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200">
                  <span>Link Status:</span>
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Auto-Expired (Payment Completed)</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print Official Receipt</span>
                </button>

                <button
                  onClick={handleCloseWindow}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4 text-slate-500" />
                  <span>Close Window</span>
                </button>
              </div>
            </div>
          </div>
        ) : paymentSuccessData ? (
          /* Payment Succeeded Confirmation Screen (Day Theme) */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-emerald-300 shadow-xl shadow-emerald-500/10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-md animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 uppercase tracking-wider mb-2 font-mono">
                  Payment Successful &bull; Link Auto-Expired
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Thank You for Your Payment!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Your transaction has been processed securely. Digital asset validity and cloud monitoring have been extended.
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-mono">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>This payment link has auto-expired to prevent duplicate payments.</span>
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left font-mono text-xs space-y-2.5 max-w-lg mx-auto text-slate-700">
                <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                  <span>Tax Invoice:</span>
                  <span className="text-slate-900 font-bold">{invoice?.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Customer / Billed To:</span>
                  <span className="text-slate-800 font-medium">{invoice?.clientName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Digital Asset:</span>
                  <span className="text-blue-600 font-bold">{asset?.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-600 font-bold text-sm">
                    {formatINR(invoice?.total || paymentSuccessData.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Payment Gateway:</span>
                  <span className="text-slate-800">{paymentSuccessData.paymentMethod || "Razorpay"}</span>
                </div>
                {paymentSuccessData.paymentId && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Transaction ID:</span>
                    <span className="text-blue-600 font-semibold">{paymentSuccessData.paymentId}</span>
                  </div>
                )}
                {paymentSuccessData.utr && (
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Banking UTR:</span>
                    <span className="text-slate-700">{paymentSuccessData.utr}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200">
                  <span>Service Status:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active &amp; Protected</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print Official Receipt</span>
                </button>

                <button
                  onClick={handleCloseWindow}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4 text-slate-500" />
                  <span>Close Window</span>
                </button>
              </div>
            </div>
          </div>
        ) : isCancelled ? (
          /* Payment Cancelled / Postponed Screen (Day Theme) */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-amber-300 shadow-xl shadow-amber-500/10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center mx-auto text-amber-600 shadow-md">
                <XCircle className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 uppercase tracking-wider mb-2 font-mono">
                  Payment Cancelled / Postponed
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Payment Has Been Cancelled
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                  No charges were deducted. Your digital asset subscription renewal for <strong className="text-blue-600">{asset?.name}</strong> remains pending until payment is completed.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left font-mono text-xs space-y-2.5 max-w-lg mx-auto text-slate-700">
                <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                  <span>Proforma Tax Invoice:</span>
                  <span className="text-slate-900 font-bold">{invoice?.invoiceNumber}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Digital Asset:</span>
                  <span className="text-blue-600 font-bold">{asset?.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Outstanding Balance:</span>
                  <span className="text-amber-700 font-bold text-sm">
                    {formatINR(invoice?.total || 234.82)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Scheduled Expiry:</span>
                  <span className="text-slate-800 font-medium">{formatDateDDMMYYYY(asset?.expiryDate || invoice?.dueDate)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-200">
                  <span>Current Status:</span>
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Payment Due (Unpaid)</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => {
                    setIsCancelled(false);
                    setIsRazorpayOpen(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/25 hover:scale-[1.02]"
                >
                  <CreditCard className="w-4 h-4 text-cyan-200" />
                  <span>Resume &amp; Pay Now ({formatINR(invoice?.total || 234.82)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleCloseWindow}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4 text-slate-500" />
                  <span>Close Window</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Payment Checkout Card (Day Theme) */
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Main Checkout Card */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/70 overflow-hidden">
              {/* Header Gradient */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 p-6 sm:p-7 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-100 mb-1">
                    <ShieldCheck className="w-4 h-4 text-cyan-200" />
                    <span>Official GST Tax Invoice &amp; Payment Gateway</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    Complete Subscription Renewal
                  </h2>
                  <p className="text-xs text-cyan-100 mt-0.5">
                    Pay online to renew your digital asset and prevent interruption of service.
                  </p>
                </div>

                <div className="text-left sm:text-right sm:self-center bg-white/10 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-white/20">
                  <div className="text-[11px] uppercase font-mono text-cyan-100">Total Payable (INR)</div>
                  <div className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
                    {formatINR(invoice?.total || 234.82)}
                  </div>
                  <div className="text-[10px] text-cyan-100">Incl. 18% GST (CGST + SGST)</div>
                </div>
              </div>

              {/* Invoice & Asset Overview */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* 2-Column Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Digital Asset Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                        Digital Asset Information
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                        {asset?.category || "Domain"}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base tracking-tight">{asset?.name}</h3>
                      <p className="text-xs text-slate-600">{asset?.type || "Digital Service Subscription"}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Scheduled Expiry:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatDateDDMMYYYY(asset?.expiryDate || invoice?.dueDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Remaining Term:</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeInfo.bgColor}`}>
                        {badgeInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Invoice Card */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                        Invoice &amp; Client Details
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold font-mono">
                        STATUS: DUE
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base tracking-tight">{invoice?.clientName}</h4>
                      <p className="text-xs text-slate-600 font-mono">{invoice?.clientEmail}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Invoice Number:</span>
                      <span className="text-blue-600 font-bold">{invoice?.invoiceNumber}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">HSN/SAC Code:</span>
                      <span className="text-slate-700">998313 (IT &amp; Cloud Services)</span>
                    </div>
                  </div>
                </div>

                {/* Statutory GST Line Items Breakdown */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/50 border border-blue-200/80 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                    Statutory Tax Invoice Breakdown
                  </h4>

                  <div className="space-y-2 text-xs font-mono divide-y divide-slate-200">
                    <div className="flex justify-between items-center pt-1 text-slate-700">
                      <span>Base Plan Renewal Fee ({asset?.type || "Domain"}):</span>
                      <span className="font-bold text-slate-900">{formatINR(invoice?.subtotal || 199)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-slate-600">
                      <span>Central GST (CGST @ 9%):</span>
                      <span className="text-slate-800 font-medium">{formatINR(invoice?.cgst || 17.91)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 text-slate-600">
                      <span>State GST (SGST @ 9%):</span>
                      <span className="text-slate-800 font-medium">{formatINR(invoice?.sgst || 17.91)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 text-sm font-bold text-slate-900">
                      <span className="text-blue-800 font-extrabold">Total Amount Payable:</span>
                      <span className="text-emerald-600 font-black text-base">
                        {formatINR(invoice?.total || 234.82)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Action CTA: Pay Now or Cancel */}
                <div className="pt-2 space-y-4 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => setIsRazorpayOpen(true)}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-600/30 inline-flex items-center justify-center gap-3 transition-all cursor-pointer border border-emerald-400 hover:scale-[1.02]"
                    >
                      <CreditCard className="w-5 h-5 text-emerald-100" />
                      <span>Pay Now ({formatINR(invoice?.total || 234.82)})</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCancelled(true)}
                      className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 hover:border-red-400 text-slate-700 hover:text-red-600 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <XCircle className="w-4 h-4 text-slate-400" />
                      <span>Cancel</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
                    </span>
                    <span>&bull;</span>
                    <span>UPI (Google Pay, PhonePe, Paytm)</span>
                    <span>&bull;</span>
                    <span>Credit &amp; Debit Cards</span>
                    <span>&bull;</span>
                    <span>NetBanking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-1">
        <p>
          {COMPANY_PROFILE.name} &bull; GSTIN: {COMPANY_PROFILE.gstin} &bull; Support: {COMPANY_PROFILE.email}
        </p>
        <p className="text-[10px] text-slate-400">
          Baner Tech Park, Pune, Maharashtra - 411045 &bull; Instant activation upon payment settlement.
        </p>
      </footer>

      {/* Interactive Razorpay Payment Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        asset={asset}
        invoice={invoice}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
