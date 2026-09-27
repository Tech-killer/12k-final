import React, { useState } from "react";
import {
  X,
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Key,
  Copy,
  Check
} from "lucide-react";
import { formatINR } from "../../data/mockData";

export default function RazorpayModal({
  isOpen,
  onClose,
  asset,
  invoice,
  onPaymentSuccess
}) {
  const [razorpayKey, setRazorpayKey] = useState("rzp_test_demokey12k");
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [activeMethod, setActiveMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("789");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  if (!isOpen || !asset) return null;

  const baseCost = Number(asset.renewalCost) || 1399;
  const gstAmount = Math.round(baseCost * 0.18 * 100) / 100;
  const totalAmount = Math.round((baseCost + gstAmount) * 100) / 100;
  const invNumber = invoice?.invoiceNumber || `PIPL/2026-27/INV-${Math.floor(100 + Math.random() * 900)}`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(razorpayKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExecutePayment = async () => {
    setIsProcessing(true);

    // Simulate authentic Razorpay payment processing & HMAC webhook capture
    setTimeout(async () => {
      const generatedPayId = "pay_demo_" + Math.random().toString(36).substring(2, 11);
      const utrNumber = "UTR" + Math.floor(100000000000 + Math.random() * 900000000000);
      const methodLabel =
        activeMethod === "upi"
          ? "Razorpay UPI (Google Pay / PhonePe)"
          : activeMethod === "card"
          ? `Razorpay Cards (Ending ${cardNumber.slice(-4)})`
          : `Razorpay NetBanking (${selectedBank})`;

      const resultPayload = {
        invoiceNumber: invNumber,
        assetId: asset.id,
        amount: totalAmount,
        paymentMethod: methodLabel,
        paymentId: generatedPayId,
        utr: utrNumber,
        apiKey: razorpayKey
      };

      setPaymentSuccessData(resultPayload);
      setIsProcessing(false);

      if (onPaymentSuccess) {
        await onPaymentSuccess(resultPayload);
      }
    }, 1200);
  };

  const handleFinish = () => {
    setPaymentSuccessData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Razorpay Brand Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-5 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 p-0.5 shadow-md">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  Razorpay Checkout
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-100 border border-emerald-400/40 text-[10px] font-bold">
                  TEST DEMO
                </span>
              </div>
              <p className="text-[11px] text-cyan-100">
                Pandharkars Infotech Private Limited &bull; Verified Merchant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {paymentSuccessData ? (
          /* Payment Success Confirmation View (Day Theme) */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900 tracking-tight">
                Payment Captured Successfully!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Settled via Razorpay Gateway &bull; Webhook HMAC Verified
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 font-mono text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Asset:</span>
                <span className="text-slate-900 font-bold">{asset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client:</span>
                <span className="text-slate-800">{asset.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="text-blue-600 font-bold">{paymentSuccessData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment ID:</span>
                <span className="text-emerald-600 font-semibold">{paymentSuccessData.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank UTR:</span>
                <span className="text-slate-700">{paymentSuccessData.utr}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-sans font-bold">
                <span className="text-slate-700">Amount Paid:</span>
                <span className="text-emerald-600 font-black">{formatINR(paymentSuccessData.amount)}</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              &bull; Invoice status updated to <strong>PAID</strong> in MongoDB.<br />
              &bull; Digital asset validity extended automatically.
            </p>

            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Done &amp; View Official Receipt
            </button>
          </div>
        ) : (
          /* Checkout Payment Flow (Day Theme) */
          <div className="p-5 space-y-4 text-xs">
            {/* API Key Banner */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">
                    Razorpay Demo API Key
                  </div>
                  {isEditingKey ? (
                    <input
                      type="text"
                      value={razorpayKey}
                      onChange={(e) => setRazorpayKey(e.target.value)}
                      className="bg-white border border-blue-500 rounded px-2 py-0.5 text-xs text-slate-900 font-mono focus:outline-none"
                    />
                  ) : (
                    <div className="font-mono text-blue-700 font-bold">{razorpayKey}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 cursor-pointer"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingKey(!isEditingKey)}
                  className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700 cursor-pointer"
                >
                  {isEditingKey ? "Save" : "Change"}
                </button>
              </div>
            </div>

            {/* Asset Order Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-900 text-sm">{asset.name}</div>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-[10px] border border-blue-200 font-semibold">
                  {asset.category}
                </span>
              </div>

              <div className="text-slate-600 text-[11px]">
                Customer: <strong className="text-slate-900">{asset.clientName}</strong> ({asset.clientEmail})
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-700 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Base Plan Cost:</span>
                  <span>{formatINR(baseCost)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST (18% Integrated / CGST+SGST):</span>
                  <span>{formatINR(gstAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200 font-sans">
                  <span>Total Amount Payable:</span>
                  <span className="text-emerald-600 font-mono font-black">{formatINR(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5 text-[11px]">
                Choose Demo Payment Method:
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMethod("upi")}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    activeMethod === "upi"
                      ? "bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px]">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod("card")}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    activeMethod === "card"
                      ? "bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px]">Cards (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMethod("netbanking")}
                  className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                    activeMethod === "netbanking"
                      ? "bg-blue-50 border-blue-600 text-blue-700 font-bold shadow-xs ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px]">NetBanking</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {activeMethod === "upi" && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center border border-slate-200 shadow-xs">
                  <div className="w-full h-full border border-blue-900 rounded flex flex-col items-center justify-center text-[7px] text-blue-900 font-bold text-center leading-tight">
                    <QrCode className="w-8 h-8 text-blue-700 mb-0.5" />
                    <span>RAZORPAY UPI</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-xs">Simulated Instant UPI QR</div>
                  <p className="text-[10px] text-slate-500">
                    Supports Google Pay, PhonePe, Paytm &amp; CRED UPI IDs. Clicking pay will simulate instant customer confirmation.
                  </p>
                </div>
              </div>
            )}

            {activeMethod === "card" && (
              <div className="space-y-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-slate-600 text-[10px] mb-0.5">Demo Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 text-[10px] mb-0.5">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 text-[10px] mb-0.5">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeMethod === "netbanking" && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-slate-600 text-[10px]">Select Indian Bank:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank"].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                        selectedBank === bank
                          ? "bg-blue-50 border-blue-600 text-blue-700 font-bold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExecutePayment}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-400 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Processing Razorpay Demo Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Pay {formatINR(totalAmount)} via Razorpay Demo Key</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-100" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <Lock className="w-3 h-3" /> 256-bit Encrypted
              </span>
              <span>&bull;</span>
              <span>Razorpay Verified Partner</span>
              <span>&bull;</span>
              <span>Instant Webhook Reconciled</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
