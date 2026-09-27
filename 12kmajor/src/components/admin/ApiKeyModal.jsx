import React, { useState, useEffect } from "react";
import {
  Key,
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  Server,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import api, { getApiKey, setApiKey, DEFAULT_API_BASE_URL } from "../../services/apiService";

export default function ApiKeyModal({ isOpen, onClose, onSaveAndReload }) {
  const [apiKeyUrl, setApiKeyUrl] = useState(getApiKey());
  const [testStatus, setTestStatus] = useState(null); // { loading, success, message, latency }
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyUrl(getApiKey());
      setTestStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    // Temporarily set to test this URL
    const original = getApiKey();
    setApiKey(apiKeyUrl);
    try {
      const res = await api.testApiConnection();
      if (res.success) {
        setTestStatus({
          loading: false,
          success: true,
          message: res.message || "Connected to MySQL / MariaDB backend successfully.",
          latency: res.durationMs,
          tables: res.data?.tables ? Object.keys(res.data.tables).length : 6
        });
      } else {
        setTestStatus({
          loading: false,
          success: false,
          message: res.error || "Connection test failed. Check host and endpoint path.",
          latency: res.durationMs
        });
        // revert if failed
        setApiKey(original);
      }
    } catch (err) {
      setTestStatus({
        loading: false,
        success: false,
        message: err.message,
        latency: 0
      });
      setApiKey(original);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setApiKey(apiKeyUrl);
    setTimeout(() => {
      setIsSaving(false);
      if (onSaveAndReload) onSaveAndReload();
      onClose();
    }, 400);
  };

  const handleResetDefault = () => {
    setApiKeyUrl(DEFAULT_API_BASE_URL);
    setApiKey(DEFAULT_API_BASE_URL);
    setTestStatus(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#071328] border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-cyan-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Backend API Key & Gateway Endpoint
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure your active PHP API location connecting to MariaDB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2.5 leading-relaxed">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            All assets, proforma invoices, CRON sweeps, and payment reconciliation events
            communicate directly with this live backend endpoint.
          </span>
        </div>

        {/* Input Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Backend API Location / Endpoint Key
          </label>
          <div className="relative">
            <input
              type="text"
              value={apiKeyUrl}
              onChange={(e) => setApiKeyUrl(e.target.value)}
              placeholder="e.g. https://transporter.solutions/12k"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Default endpoint: <code className="text-slate-400">{DEFAULT_API_BASE_URL}</code>
          </p>
        </div>

        {/* Test Result Display */}
        {testStatus && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              testStatus.loading
                ? "bg-slate-900 border-slate-700 text-slate-300"
                : testStatus.success
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/40 border-rose-500/40 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {testStatus.loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              ) : testStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-medium">{testStatus.message}</span>
            </div>

            {testStatus.latency !== undefined && !testStatus.loading && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-slate-700/50">
                {testStatus.latency}ms
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus?.loading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testStatus?.loading ? "animate-spin" : ""}`} />
            <span>Test Connection</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-colors"
            >
              Reset Default
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-blue-950/50 transition-all cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save & Sync Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
