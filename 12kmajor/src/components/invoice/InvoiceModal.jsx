import React from "react";
import { X } from "lucide-react";
import InvoiceView from "./InvoiceView";

export default function InvoiceModal({ invoice, isOpen, onClose, onPayNow }) {
  if (!isOpen || !invoice) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button on Top Right (hidden on print) */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 sm:top-3 sm:right-3 z-50 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors print:hidden shadow-lg border border-slate-700"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <InvoiceView invoice={invoice} onPayNow={onPayNow} />
      </div>
    </div>
  );
}
