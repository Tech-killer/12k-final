import React from "react";
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  Building2,
  Mail,
  Globe,
  QrCode,
  ShieldCheck
} from "lucide-react";
import {
  COMPANY_PROFILE,
  formatINR,
  amountInWordsINR
} from "../../data/mockData";

export default function InvoiceView({ invoice, onPayNow, showPayButton = true }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === "Paid";

  return (
    <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans print:shadow-none print:border-none print:m-0 print:p-0">
      {/* Action Bar (Hidden on Print) */}
      <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Official GST Tax Invoice
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-xs text-slate-300 font-mono">{invoice.invoiceNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          {showPayButton && !isPaid && onPayNow && (
            <button
              onClick={() => onPayNow(invoice)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settle & Reconcile (Admin)</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-6 print:p-6 print:max-w-none">
        {/* Top Header Banner: PANDHARKARS INFOTECH PRIVATE LIMITED */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b-2 border-blue-900/20 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Circular Emblem */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0b2756] via-[#103d7c] to-[#0099ff] p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#081f42] rounded-[14px] flex items-center justify-center font-black text-2xl text-cyan-300 tracking-wider">
                  PI
                </div>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0b2756] tracking-tight uppercase leading-none">
                  {COMPANY_PROFILE.name}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-[#0066cc] italic mt-1">
                  "{COMPANY_PROFILE.tagline}"
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 max-w-md leading-relaxed pt-1">
              {COMPANY_PROFILE.address}
            </p>
          </div>

          {/* Right Header Metadata */}
          <div className="text-left sm:text-right space-y-1.5 text-xs text-slate-700 sm:self-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200 font-bold uppercase tracking-wider text-[11px]">
              TAX INVOICE
            </div>
            <p className="font-mono text-[11px] text-slate-800">
              <strong>CIN:</strong> {COMPANY_PROFILE.cin}
            </p>
            <p className="font-mono text-[11px] text-slate-800">
              <strong>GSTIN:</strong> {COMPANY_PROFILE.gstin}
            </p>
            <p className="text-[11px]">
              <strong>Email:</strong> {COMPANY_PROFILE.email}
            </p>
            <p className="text-[11px]">
              <strong>Web:</strong> {COMPANY_PROFILE.website}
            </p>
          </div>
        </div>

        {/* Invoice Meta Grid (Bill To & Invoice Details) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          {/* Billed To */}
          <div className="space-y-1 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] block">
              Billed To (Customer):
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">{invoice.clientName}</h3>
            <p className="text-slate-600 font-medium">{invoice.clientAddress}</p>
            <p className="font-mono text-slate-700">
              <strong>Customer GSTIN:</strong> {invoice.clientGstin || "27AAACR9821Q1Z4"}
            </p>
            <p className="text-slate-700">
              <strong>Email:</strong> {invoice.clientEmail}
            </p>
          </div>

          {/* Invoice Numbers & Status */}
          <div className="space-y-1 text-xs sm:text-right flex flex-col sm:items-end justify-between">
            <div className="space-y-1">
              <p className="text-slate-500 text-[10px] uppercase font-bold">Invoice Details</p>
              <p className="text-sm font-black font-mono text-blue-900">
                {invoice.invoiceNumber}
              </p>
              <p className="text-slate-600">
                <strong>Invoice Date:</strong> {invoice.date}
              </p>
              <p className="text-slate-600">
                <strong>Due Date:</strong> {invoice.dueDate}
              </p>
            </div>

            {/* Status Stamp */}
            <div className="pt-2">
              {isPaid ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs uppercase tracking-wider shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  PAID IN FULL
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-extrabold text-xs uppercase tracking-wider shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  PAYMENT DUE
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Itemized Services Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b2756] text-white uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Service Description</th>
                <th className="py-3 px-3 text-center">HSN/SAC</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Rate</th>
                <th className="py-3 px-4 text-right">Taxable Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{item.description}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Customer Asset Renewal & Provisioning via Automated Engine
                    </p>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-700">{item.hsn}</td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-800">{item.qty}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-800">
                    {formatINR(item.rate)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                    {formatINR(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Tax Calculation Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          {/* Amount In Words & Terms */}
          <div className="sm:col-span-7 space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Amount in Words:
              </span>
              <p className="font-bold text-slate-800 mt-1 italic">
                {amountInWordsINR(invoice.total)}
              </p>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Terms & Conditions:
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Payment due within 15 days of notice to prevent automated asset suspension.</li>
                <li>Online payments are auto-reconciled instantly with renewal extended by 1 year.</li>
                <li>Subject to Pune jurisdiction only.</li>
              </ul>
            </div>
          </div>

          {/* Tax Calculation Box */}
          <div className="sm:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Subtotal:</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatINR(invoice.subtotal)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>CGST (9.0%):</span>
              <span className="font-mono text-slate-900">{formatINR(invoice.cgst)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>SGST (9.0%):</span>
              <span className="font-mono text-slate-900">{formatINR(invoice.sgst)}</span>
            </div>

            <div className="border-t border-slate-300 pt-2 flex justify-between items-center text-sm font-black text-[#0b2756]">
              <span>Total Payable (INR):</span>
              <span className="text-base font-mono font-black">{formatINR(invoice.total)}</span>
            </div>
          </div>
        </div>

        {/* Bank Details & QR Code & Authorized Seal */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t border-slate-200 items-end">
          {/* Bank Transfer Info */}
          <div className="sm:col-span-5 space-y-1.5 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] block">
              Official Bank Remittance Details
            </span>
            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-[11px] space-y-1 text-slate-800">
              <p>
                <strong>Bank Name:</strong> {COMPANY_PROFILE.bankDetails.bankName}
              </p>
              <p>
                <strong>Account Name:</strong> {COMPANY_PROFILE.bankDetails.accountName}
              </p>
              <p className="font-mono">
                <strong>Account No:</strong> {COMPANY_PROFILE.bankDetails.accountNumber}
              </p>
              <p className="font-mono">
                <strong>IFSC Code:</strong> {COMPANY_PROFILE.bankDetails.ifscCode}
              </p>
              <p className="font-mono">
                <strong>UPI VPA:</strong> {COMPANY_PROFILE.bankDetails.upiId}
              </p>
            </div>
          </div>

          {/* UPI Instant QR Code */}
          <div className="sm:col-span-3 flex flex-col items-center justify-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
            <div className="w-20 h-20 bg-white p-1 rounded-md border border-slate-300 shadow-inner flex items-center justify-center mb-1.5">
              <QrCode className="w-16 h-16 text-slate-800" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 uppercase">Scan to Pay UPI</span>
            <span className="text-[9px] text-slate-500 font-mono">GPay / PhonePe / Paytm</span>
          </div>

          {/* Authorized Signatory Stamp */}
          <div className="sm:col-span-4 text-center sm:text-right space-y-2">
            <div className="inline-block text-center border-2 border-blue-900/40 rounded-xl p-2.5 bg-blue-50/40 min-w-[200px]">
              <p className="text-[10px] font-bold uppercase text-slate-700">
                For {COMPANY_PROFILE.name}
              </p>
              <div className="py-2 flex items-center justify-center">
                <span className="font-serif italic text-sm font-bold text-blue-900 border-b border-blue-900/30 px-3">
                  Authorized Signatory
                </span>
              </div>
              <p className="text-[9px] text-slate-500">Corporate Finance & Accounts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
