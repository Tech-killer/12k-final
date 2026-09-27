import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  Sparkles,
  X,
  Send,
  RotateCcw,
  Bot,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Radio
} from "lucide-react";
import { formatINR, calculateDaysRemaining, COMPANY_PROFILE } from "../data/mockData";
import {
  askGroqAi,
  getGroqApiKey,
  setGroqApiKey,
  getGroqModel,
  setGroqModel,
  AVAILABLE_GROQ_MODELS,
  testGroqConnection,
  DEFAULT_GROQ_KEY,
  DEFAULT_GROQ_MODEL,
  getAiEcoResponse
} from "../services/groqService.js";

// Re-export all Groq AI APIs directly from AIBrainChat for maximum compatibility
export {
  askGroqAi,
  getGroqApiKey,
  setGroqApiKey,
  getGroqModel,
  setGroqModel,
  AVAILABLE_GROQ_MODELS,
  testGroqConnection,
  DEFAULT_GROQ_KEY,
  DEFAULT_GROQ_MODEL,
  getAiEcoResponse
};

export default function AIBrainChat({
  assets = [],
  invoices = [],
  cronLogs = [],
  transactions = [],
  onTriggerCron,
  onNavigateTab,
  onOpenInvoice,
  companyProfile = COMPANY_PROFILE,
  theme = "dark"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const activeModel = getGroqModel();
  const [expandedReasoning, setExpandedReasoning] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initial welcome message from AI Brain
  const [messages, setMessages] = useState([
    {
      id: "msg-init",
      sender: "ai",
      timestamp: "Just now",
      text: `Hello Administrator! I am **AI Brain**, your neural copilot powered by **${getGroqModel()}** for ${COMPANY_PROFILE.shortName}.\n\nI monitor 15-day digital asset expirations, automated CRON notification sweeps, and payment gateway reconciliations in real time.`,
      isLiveGroq: true,
      modelUsed: getGroqModel(),
      quickChips: [
        "🔍 Check 15-Day Expiry Radar",
        "💰 Summary of Pending Dues",
        "⚡ Run Automated CRON Sweep",
        "🔄 Payment Gateway Health"
      ]
    }
  ]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Compute live metrics for the AI Brain
  const expiringAssets = assets.filter((a) => calculateDaysRemaining(a.expiryDate) <= 15);
  const totalDueInvoices = invoices.filter((inv) => inv.status === "Due");
  const totalDueAmount = totalDueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalPaidInvoices = invoices.filter((inv) => inv.status === "Paid");
  const totalPaidAmount = totalPaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  // Local fallback response generator for offline or network issues
  const generateAIResponse = (query) => {
    const q = query.toLowerCase().trim();

    if (q.includes("expiry") || q.includes("radar") || q.includes("expire") || q.includes("15-day") || q.includes("asset")) {
      if (expiringAssets.length === 0) {
        return {
          text: `All ${assets.length} monitored customer digital assets are currently healthy and outside the critical 15-day expiration window.`,
          actionBtn: { label: "Open Asset Monitor", tab: "admin-assets" }
        };
      }
      const assetListSummary = expiringAssets
        .map(
          (a) =>
            `• **${a.name}** (${a.clientName}) — **${calculateDaysRemaining(a.expiryDate)} days remaining** (Renewal: ${formatINR(a.renewalCost * 1.18)})`
        )
        .join("\n");

      return {
        text: `⚠️ **AI Brain Radar Alert**: Detected **${expiringAssets.length} critical asset(s)** expiring within 15 days:\n\n${assetListSummary}\n\nThe automated CRON notification engine is set to dispatch reminder invoices automatically.`,
        actionBtn: { label: "View Assets in Inventory", tab: "admin-assets" }
      };
    }

    if (q.includes("due") || q.includes("pending") || q.includes("revenue") || q.includes("invoice") || q.includes("money") || q.includes("gst")) {
      return {
        text: `📊 **Financial & Invoicing Snapshot**:\n• **Pending Receivables:** ${formatINR(totalDueAmount)} (${totalDueInvoices.length} Due Invoices)\n• **Reconciled Revenue:** ${formatINR(totalPaidAmount)} (${totalPaidInvoices.length} Settled Invoices)\n• **GST Compliance:** All invoices calculated under CIN ${COMPANY_PROFILE.cin} with standard 18% GST (9% CGST + 9% SGST).`,
        actionBtn: { label: "Go to Invoices & Billing Hub", tab: "admin-invoices" }
      };
    }

    if (q.includes("cron") || q.includes("sweep") || q.includes("trigger") || q.includes("notification") || q.includes("email")) {
      if (onTriggerCron) onTriggerCron();
      return {
        text: `⚡ **Autonomous CRON Engine Triggered**!\n\nAI Brain has initiated an immediate 15-day database sweep across ${assets.length} monitored assets. Automated branded reminder emails with attached PDF GST invoices and payment links are being dispatched.`,
        actionBtn: { label: "Inspect 15-Day CRON Engine", tab: "admin-cron" }
      };
    }

    if (q.includes("gateway") || q.includes("reconcil") || q.includes("webhook") || q.includes("razorpay") || q.includes("payment")) {
      return {
        text: `🔄 **Payment Gateway & Reconciliation Health**:\n• **Gateway Webhooks:** Online & listening (Razorpay / UPI Instant webhook capture active).\n• **Recent Transactions Logged:** ${transactions.length} transactions.\n• **Auto-Action:** Upon invoice settlement, the database signature verifies HMAC, marks invoice **Paid**, issues tax receipt, and adds **+365 days** to asset expiry automatically.`,
        actionBtn: { label: "Open Payment Reconciliation", tab: "admin-reconciliation" }
      };
    }

    return {
      text: `I analyzed your query: "*${query}*". As the centralized **AI Brain**, I have full visibility into your **${assets.length} digital assets**, **${invoices.length} invoices**, and **${transactions.length} ledger transactions**.`,
      quickChips: [
        "🔍 Check 15-Day Expiry Radar",
        "💰 Summary of Pending Dues",
        "⚡ Run Automated CRON Sweep",
        "🔄 Payment Gateway Health"
      ]
    };
  };

  // Handle Send Message with Live Groq Streaming and Reasoning
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isTyping) return;

    const userMsg = {
      id: "user-" + Date.now(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: query
    };

    const aiMsgId = "ai-" + Date.now();
    const initialAiMsg = {
      id: aiMsgId,
      sender: "ai",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: "",
      reasoning: "",
      isLiveGroq: true,
      modelUsed: activeModel,
      isStreaming: true
    };

    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setInputMessage("");
    setIsTyping(true);

    // Format real-time context summary
    const expiringSummary = expiringAssets.length > 0
      ? expiringAssets.map((a) => `• ${a.name} (${a.clientName}) - ${calculateDaysRemaining(a.expiryDate)} days remaining (Renewal: ${formatINR(a.renewalCost * 1.18)})`).join("\n")
      : "All monitored assets are outside the 15-day window.";

    const userContext = {
      companyName: `${companyProfile?.name || COMPANY_PROFILE.name} (${companyProfile?.shortName || COMPANY_PROFILE.shortName})`,
      totalAssets: assets.length,
      expiringAssetsCount: expiringAssets.length,
      expiringAssetsSummary: expiringSummary,
      totalDueAmount,
      totalDueFormatted: formatINR(totalDueAmount),
      totalDueInvoicesCount: totalDueInvoices.length,
      totalPaidAmount,
      totalPaidFormatted: formatINR(totalPaidAmount),
      totalPaidInvoicesCount: totalPaidInvoices.length,
      cronLogsCount: cronLogs.length,
      transactionsCount: transactions.length
    };

    const qLower = query.toLowerCase();
    if ((qLower.includes("cron") || qLower.includes("sweep") || qLower.includes("trigger")) && onTriggerCron) {
      onTriggerCron();
    }

    try {
      const result = await askGroqAi({
        prompt: query,
        history: messages,
        userContext,
        model: activeModel,
        onReasoning: (accumulatedReasoning) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId ? { ...msg, reasoning: accumulatedReasoning } : msg
            )
          );
        },
        onChunk: (accumulatedContent, accumulatedReasoning) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId
                ? {
                    ...msg,
                    text: accumulatedContent,
                    reasoning: accumulatedReasoning,
                    isStreaming: true
                  }
                : msg
            )
          );
        }
      });

      // Contextual action button determination
      let actionBtn = null;
      if (qLower.includes("expiry") || qLower.includes("asset") || qLower.includes("radar") || qLower.includes("domain") || qLower.includes("server")) {
        actionBtn = { label: "View Assets in Inventory", tab: "admin-assets" };
      } else if (qLower.includes("due") || qLower.includes("invoice") || qLower.includes("revenue") || qLower.includes("billing") || qLower.includes("pending")) {
        actionBtn = { label: "Go to Invoices & Billing Hub", tab: "admin-invoices" };
      } else if (qLower.includes("cron") || qLower.includes("sweep") || qLower.includes("notification") || qLower.includes("email")) {
        actionBtn = { label: "Inspect 15-Day CRON Engine", tab: "admin-cron" };
      } else if (qLower.includes("gateway") || qLower.includes("reconcil") || qLower.includes("payment") || qLower.includes("razorpay") || qLower.includes("webhook")) {
        actionBtn = { label: "Open Payment Reconciliation", tab: "admin-reconciliation" };
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                text: result.text || msg.text || "Query processed successfully.",
                reasoning: result.reasoning || msg.reasoning,
                isLiveGroq: result.isLiveGroq,
                modelUsed: result.modelUsed || activeModel,
                isStreaming: false,
                actionBtn,
                quickChips: [
                  "🔍 Check 15-Day Expiry Radar",
                  "💰 Summary of Pending Dues",
                  "⚡ Run Automated CRON Sweep",
                  "🔄 Payment Gateway Health"
                ]
              }
            : msg
        )
      );
    } catch (err) {
      console.warn("Falling back to local AI heuristics:", err);
      const fallbackResult = generateAIResponse(query);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? {
                ...msg,
                text: fallbackResult.text,
                actionBtn: fallbackResult.actionBtn,
                quickChips: fallbackResult.quickChips,
                isLiveGroq: false,
                modelUsed: `${activeModel} (Fallback)`,
                isStreaming: false
              }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "msg-reset-" + Date.now(),
        sender: "ai",
        timestamp: "Just now",
        text: `Chat memory reset. **AI Brain** neural models (**${activeModel}**) are re-initialized and standing by.`,
        isLiveGroq: true,
        modelUsed: activeModel,
        quickChips: [
          "🔍 Check 15-Day Expiry Radar",
          "💰 Summary of Pending Dues",
          "⚡ Run Automated CRON Sweep"
        ]
      }
    ]);
  };



  const toggleReasoning = (id) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <>
      {/* ================= FLOATING ACTION BUTTON (RIGHT BOTTOM) ================= */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in zoom-in-90 duration-300">
          <button
            onClick={() => setIsOpen(true)}
            className="ai-brain-trigger group relative flex items-center gap-3 p-1.5 pr-4 rounded-full bg-gradient-to-r from-[#0d2753] via-[#0e3575] to-[#0a1e3f] border border-cyan-500/50 shadow-2xl shadow-cyan-900/60 hover:shadow-cyan-500/40 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Open AI Brain Copilot"
          >
            {/* Glowing Aura Ring */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-500 opacity-30 blur-md group-hover:opacity-75 transition-opacity pointer-events-none" />

            {/* Pulsing Brain Emblem */}
            <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[2px] flex items-center justify-center shrink-0 shadow-lg">
              <div className="ai-brain-emblem-inner w-full h-full rounded-full bg-[#071328] flex items-center justify-center">
                <Brain className="ai-brain-icon w-5 h-5 text-cyan-300 group-hover:text-white transition-colors animate-pulse" />
              </div>
            </div>

            {/* Label and Status */}
            <div className="relative text-left">
              <div className="flex items-center gap-1.5">
                <span className="ai-brain-title text-xs font-black tracking-wider text-white uppercase group-hover:text-cyan-200 transition-colors">
                  AI Brain
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
              </div>
              <p className="ai-brain-subtitle text-[10px] text-cyan-300/80 font-medium">
                Groq 120B Copilot
              </p>
            </div>

            {/* Sparkle Icon */}
            <Sparkles className="ai-brain-sparkles w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform ml-0.5" />
          </button>
        </div>
      )}

      {/* ================= CHAT MODAL / DRAWER (RIGHT BOTTOM) ================= */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] h-[580px] max-h-[88vh] flex flex-col bg-[#071328]/95 backdrop-blur-2xl border border-blue-500/40 rounded-2xl shadow-2xl shadow-blue-950/90 text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
          
          {/* Header Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-gradient-to-r from-[#0e2752] via-[#091b38] to-[#071328] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-[2px] shadow-md shadow-cyan-900/40">
                <div className="w-full h-full bg-[#08152e] rounded-[10px] flex items-center justify-center">
                  <Brain className="w-4 h-4 text-cyan-300 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold text-white tracking-tight">AI Brain</h3>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/30 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                    Groq 120B
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Neural Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Reset Conversation"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize AI Brain"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 text-cyan-300 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none border border-blue-400/30"
                      : "bg-[#0b1b36] border border-slate-800 text-slate-200 rounded-bl-none"
                  }`}
                >
                  {/* Reasoning Accordion for 120B Reasoning model */}
                  {msg.reasoning && (
                    <div className="mb-2 rounded-lg bg-slate-900/80 border border-slate-800 overflow-hidden">
                      <button
                        onClick={() => toggleReasoning(msg.id)}
                        className="w-full px-2.5 py-1.5 flex items-center justify-between text-[10px] text-cyan-300/90 hover:bg-slate-800/60 transition-colors"
                      >
                        <span className="flex items-center gap-1.5 font-mono">
                          <Brain className="w-3 h-3 text-cyan-400" />
                          Neural Reasoning Chain ({msg.reasoning.length} chars)
                        </span>
                        {expandedReasoning[msg.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                      {expandedReasoning[msg.id] && (
                        <div className="p-2.5 text-[10px] text-slate-400 font-mono whitespace-pre-wrap border-t border-slate-800 bg-black/20 max-h-44 overflow-y-auto leading-relaxed">
                          {msg.reasoning}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Message Content */}
                  <p className="whitespace-pre-line">
                    {msg.text || (msg.isStreaming ? "Synthesizing neural telemetry..." : "")}
                  </p>

                  {/* Optional Action Button embedded in message */}
                  {msg.actionBtn && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          if (msg.actionBtn.tab && onNavigateTab) onNavigateTab(msg.actionBtn.tab);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-400/40 text-cyan-300 font-semibold text-[11px] transition-all cursor-pointer"
                      >
                        <span>{msg.actionBtn.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                      {msg.actionBtn.tab === "admin-invoices" && invoices.length > 0 && onOpenInvoice && (
                        <button
                          onClick={() => {
                            const dueInv = invoices.find((i) => i.status === "Due") || invoices[0];
                            if (dueInv) onOpenInvoice(dueInv);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-400/40 text-emerald-300 font-semibold text-[11px] transition-all cursor-pointer"
                        >
                          <span>View Latest Due Tax Invoice</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Optional Quick Chips */}
                  {msg.quickChips && msg.quickChips.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1.5">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        Suggested Queries:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.quickChips.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(chip)}
                            className="px-2 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-[10px] text-cyan-300 transition-colors cursor-pointer"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer metadata: Model & timestamp */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60 text-[9px] text-slate-400/70 font-mono">
                    <span className="flex items-center gap-1">
                      {msg.sender === "ai" && msg.isLiveGroq && (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          {msg.modelUsed || "Groq 120B"}
                        </span>
                      )}
                      {msg.sender === "ai" && !msg.isLiveGroq && (
                        <span className="text-amber-400">Heuristics Mode</span>
                      )}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* AI Typing Simulator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-cyan-300 animate-in fade-in duration-200">
                <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-cyan-300 shadow-sm">
                  <Bot className="w-3.5 h-3.5 animate-bounce" />
                </div>
                <div className="p-2.5 rounded-2xl bg-[#0b1b36] border border-slate-800 flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <span>AI Brain is reasoning</span>
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-100" />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-200" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Form */}
          <div className="p-3 border-t border-slate-800/90 bg-[#061124]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask AI Brain anything (e.g. dues, CRON, expiry)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-900/40 cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
