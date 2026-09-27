import React, { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  ExternalLink,
  ShieldCheck,
  Building2,
  Mail,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  X,
  Sparkles
} from "lucide-react";
import { COMPANY_PROFILE, formatINR, formatDateDDMMYYYY } from "../../data/mockData";

export default function AdminInvoices({
  invoices = [],
  assets = [],
  onOpenInvoice,
  onSettleInvoice,
  onOpenRazorpay,
  onCreateInvoice,
  companyProfile = COMPANY_PROFILE
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Invoice Form state
  const [newInv, setNewInv] = useState({
    assetId: assets[0]?.id || "",
    clientName: assets[0]?.clientName || "",
    clientEmail: assets[0]?.clientEmail || "",
    clientGstin: "27AAACR9821Q1Z4",
    clientAddress: "Baner Tech Park, Pune, Maharashtra - 411045",
    description: assets[0]?.name ? `${assets[0].name} - Annual Plan Renewal` : "Digital Infrastructure Subscription Renewal",
    hsn: "998313",
    subtotal: assets[0]?.renewalCost || 1399
  });

  const filteredInvoices = invoices.filter((inv) => {
    const invNum = (inv.invoiceNumber || "").toLowerCase();
    const cName = (inv.clientName || "").toLowerCase();
    const desc = (inv.items?.[0]?.description || "").toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = invNum.includes(q) || cName.includes(q) || desc.includes(q);
    const matchesStatus = statusFilter === "All" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalBilled = invoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const paidInvoices = invoices.filter((i) => i.status === "Paid");
  const totalPaid = paidInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);
  const dueInvoices = invoices.filter((i) => i.status === "Due");
  const totalDue = dueInvoices.reduce((sum, i) => sum + (Number(i.total) || 0), 0);

  const handleAssetSelect = (assetId) => {
    const selected = assets.find((a) => a.id === assetId);
    if (selected) {
      setNewInv({
        ...newInv,
        assetId: selected.id,
        clientName: selected.clientName,
        clientEmail: selected.clientEmail || "",
        description: `${selected.name} - ${selected.type || "Domain"} Subscription Renewal`,
        subtotal: selected.renewalCost || 1399
      });
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const sub = Number(newInv.subtotal) || 1399;
    const tax = Math.round(sub * 0.18 * 100) / 100;
    const tot = Math.round((sub + tax) * 100) / 100;

    const payload = {
      invoiceNumber: `PIPL/2026-27/INV-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
      assetId: newInv.assetId,
      clientName: newInv.clientName.trim(),
      clientEmail: newInv.clientEmail.trim(),
      clientGstin: newInv.clientGstin.trim(),
      clientAddress: newInv.clientAddress.trim(),
      items: [
        {
          description: newInv.description.trim(),
          hsn: newInv.hsn || "998313",
          qty: 1,
          rate: sub,
          amount: sub
        }
      ],
      subtotal: sub,
      cgst: Math.round(tax / 2 * 100) / 100,
      sgst: Math.round(tax / 2 * 100) / 100,
      total: tot,
      status: "Due"
    };

    if (onCreateInvoice) {
      await onCreateInvoice(payload);
    }
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tax Invoicing & GST Compliance Command</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            GST Billing Hub & Tax Invoices
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Official GST tax proformas and payment receipts generated under CIN {companyProfile?.cin || COMPANY_PROFILE.cin}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-cyan-300">
            GSTIN: {companyProfile?.gstin || COMPANY_PROFILE.gstin}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-900/40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#08152e] border border-slate-800 space-y-1">
          <div className="text-slate-400 text-xs font-semibold">Total Invoiced (Cumulative)</div>
          <div className="text-xl font-black text-white font-mono">{formatINR(totalBilled)}</div>
          <div className="text-[11px] text-slate-500">{invoices.length} official proformas issued</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#08152e] border border-emerald-900/40 space-y-1">
          <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paid & Reconciled via Gateway</span>
          </div>
          <div className="text-xl font-black text-emerald-300 font-mono">{formatINR(totalPaid)}</div>
          <div className="text-[11px] text-slate-400">{paidInvoices.length} settled with zero dispute</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#08152e] border border-amber-900/40 space-y-1">
          <div className="text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pending Due Invoices</span>
          </div>
          <div className="text-xl font-black text-amber-300 font-mono">{formatINR(totalDue)}</div>
          <div className="text-[11px] text-slate-400">{dueInvoices.length} awaiting customer payment</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#08152e] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number, client, service..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none"
          >
            <option value="All">All Invoices ({invoices.length})</option>
            <option value="Due">Due Pending ({dueInvoices.length})</option>
            <option value="Paid">Paid ({paidInvoices.length})</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#08152e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1d3d] text-slate-300 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Service Description</th>
                <th className="py-3.5 px-4">Issue / Due Date</th>
                <th className="py-3.5 px-4">Total (incl 18% GST)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-600" />
                      <p>No tax invoices recorded in database yet.</p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-1 px-3.5 py-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold hover:bg-blue-600/30 transition-all cursor-pointer"
                      >
                        + Generate First GST Tax Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{inv.clientName}</div>
                      <div className="text-[10px] text-slate-400">{inv.clientEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-200">
                      {inv.items?.[0]?.description || "Digital Asset Renewal"}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>{formatDateDDMMYYYY(inv.date)}</div>
                      <div className="text-[10px] text-slate-500">Due: {formatDateDDMMYYYY(inv.dueDate)}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {formatINR(inv.total)}
                      <span className="text-[10px] text-slate-400 block font-sans">
                        Base: {formatINR(inv.subtotal)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {inv.status === "Paid" ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Paid
                          </span>
                          {inv.paymentMethod && (
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {inv.paymentMethod}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Due Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => onOpenInvoice(inv)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-medium transition-all cursor-pointer"
                      >
                        View Invoice
                      </button>

                      {inv.status !== "Paid" && onOpenRazorpay && (
                        <button
                          onClick={() => onOpenRazorpay(inv)}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3 text-cyan-200" />
                          <span>Pay (Razorpay)</span>
                        </button>
                      )}

                      {inv.status !== "Paid" && onSettleInvoice && (
                        <button
                          onClick={() => onSettleInvoice(inv)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium transition-all cursor-pointer"
                        >
                          Settle
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Tax Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#0b1a34] border border-slate-700 rounded-3xl shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Generate Official GST Proforma Invoice</h3>
                <p className="text-xs text-slate-400">Creates tax invoice record in MariaDB with auto-calculated 18% GST</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs pt-4">
              {assets.length > 0 && (
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Link to Monitored Asset (Optional)</label>
                  <select
                    value={newInv.assetId}
                    onChange={(e) => handleAssetSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="">-- Standalone Customer Invoice --</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.clientName} &bull; {formatINR(a.renewalCost)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Customer / Company Name</label>
                  <input
                    type="text"
                    required
                    value={newInv.clientName}
                    onChange={(e) => setNewInv({ ...newInv, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                    placeholder="e.g. RG-VP Solutions Ltd"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Customer Billing Email</label>
                  <input
                    type="email"
                    required
                    value={newInv.clientEmail}
                    onChange={(e) => setNewInv({ ...newInv, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                    placeholder="e.g. billing@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Service Description / Line Item</label>
                <input
                  type="text"
                  required
                  value={newInv.description}
                  onChange={(e) => setNewInv({ ...newInv, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  placeholder="e.g. Annual Cloud Infrastructure & Domain Plan"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Taxable Subtotal (INR)</label>
                  <input
                    type="number"
                    required
                    value={newInv.subtotal}
                    onChange={(e) => setNewInv({ ...newInv, subtotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">HSN / SAC Code</label>
                  <input
                    type="text"
                    value={newInv.hsn}
                    onChange={(e) => setNewInv({ ...newInv, hsn: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Calculated Total Card */}
              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-800/40 font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span>{formatINR(newInv.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span>{formatINR((newInv.subtotal || 0) * 0.18)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xs pt-1 border-t border-slate-800 font-sans">
                  <span>Grand Total (incl 18% GST):</span>
                  <span className="text-cyan-300 font-mono">{formatINR((newInv.subtotal || 0) * 1.18)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-blue-900/40 cursor-pointer"
                >
                  Issue Tax Proforma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
