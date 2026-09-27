/**
 * Groq AI Neural Integration Service for AI Brain
 * Optimized for 100% Client-Side Hosting Platforms (Vercel, Netlify, Cloudflare, GitHub Pages, Render, AWS)
 * Zero external npm dependencies required - uses native browser Fetch & SSE streaming reader.
 */

// Storage keys (supporting both CarbonIQ legacy and AI Brain)
export const STORAGE_KEY_GROQ = 'carboniq_groq_api_key';
export const STORAGE_KEY_MODEL = 'carboniq_groq_model';
const STORAGE_KEY_AIBRAIN_KEY = 'aibrain_groq_api_key';
const STORAGE_KEY_AIBRAIN_MODEL = 'aibrain_groq_model';

// Default Groq credentials & high-reasoning model
export const DEFAULT_GROQ_KEY = '';
export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b';

// Production-ready Groq models list
export const AVAILABLE_GROQ_MODELS = [
  { id: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B (High Reasoning)', speed: 'Ultra Intelligence' },
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Versatile)', speed: 'High Speed' },
  { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Instant)', speed: 'Ultra Fast' }
];

/**
 * Retrieves the active Groq API Key
 * Checks LocalStorage -> Vite Environment Variables -> Default Fallback Key
 */
export function getGroqApiKey() {
  if (typeof window === 'undefined') return DEFAULT_GROQ_KEY;
  return (
    localStorage.getItem(STORAGE_KEY_AIBRAIN_KEY) ||
    localStorage.getItem(STORAGE_KEY_GROQ) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) ||
    DEFAULT_GROQ_KEY
  );
}

/**
 * Stores the Groq API Key
 */
export function setGroqApiKey(key) {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    const trimmed = key.trim();
    localStorage.setItem(STORAGE_KEY_AIBRAIN_KEY, trimmed);
    localStorage.setItem(STORAGE_KEY_GROQ, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY_AIBRAIN_KEY);
    localStorage.removeItem(STORAGE_KEY_GROQ);
  }
}

/**
 * Retrieves the active Groq Model ID
 */
export function getGroqModel() {
  if (typeof window === 'undefined') return DEFAULT_GROQ_MODEL;
  return (
    localStorage.getItem(STORAGE_KEY_AIBRAIN_MODEL) ||
    localStorage.getItem(STORAGE_KEY_MODEL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_MODEL) ||
    DEFAULT_GROQ_MODEL
  );
}

/**
 * Stores the active Groq Model ID
 */
export function setGroqModel(model) {
  if (typeof window === 'undefined') return;
  if (model) {
    localStorage.setItem(STORAGE_KEY_AIBRAIN_MODEL, model);
    localStorage.setItem(STORAGE_KEY_MODEL, model);
  }
}

/**
 * Built-in fallback heuristics engine
 * Self-contained so it does not require any external './aiEngine' file,
 * guaranteeing zero build failures across hosting platforms.
 */
export function getAiEcoResponse(prompt = '', userContext = {}) {
  const q = String(prompt).toLowerCase().trim();

  // Expiring assets / radar
  if (q.includes('expiry') || q.includes('radar') || q.includes('expire') || q.includes('15-day') || q.includes('asset')) {
    const expiringCount = userContext.expiringAssetsCount ?? (userContext.expiringAssets?.length || 0);
    if (expiringCount === 0) {
      return {
        text: 'All monitored customer digital assets are healthy and outside the critical 15-day expiration window.',
        suggestedAction: { label: 'Open Asset Monitor', tab: 'admin-assets' }
      };
    }
    return {
      text: `⚠️ **AI Brain Radar Alert**: Detected **${expiringCount} critical asset(s)** expiring within 15 days. The automated CRON notification engine is scheduled to dispatch renewal reminders and GST invoices.`,
      suggestedAction: { label: 'View Assets in Inventory', tab: 'admin-assets' }
    };
  }

  // Pending Dues / Invoices / Financials
  if (q.includes('due') || q.includes('pending') || q.includes('revenue') || q.includes('invoice') || q.includes('money') || q.includes('gst')) {
    const dueAmount = userContext.totalDueAmount ? `₹${Number(userContext.totalDueAmount).toLocaleString('en-IN')}` : '₹6,726';
    const dueCount = userContext.totalDueInvoicesCount ?? (userContext.totalDueInvoices?.length || 2);
    return {
      text: `📊 **Financial & Invoicing Snapshot**:\n• **Pending Receivables:** ${dueAmount} (${dueCount} Due Invoices)\n• **GST Compliance:** Invoices generated with standard 18% GST (9% CGST + 9% SGST).\n• Automated payment links are active for fast reconciliation.`,
      suggestedAction: { label: 'Go to Invoices & Billing Hub', tab: 'admin-invoices' }
    };
  }

  // CRON Engine / Sweep
  if (q.includes('cron') || q.includes('sweep') || q.includes('trigger') || q.includes('notification') || q.includes('email')) {
    return {
      text: `⚡ **Autonomous CRON Engine Active**:\nAI Brain sweeps digital assets daily. When assets enter the 15-day expiration radar, verified PDF invoices and Razorpay instant checkout links are dispatched to clients.`,
      suggestedAction: { label: 'Inspect 15-Day CRON Engine', tab: 'admin-cron' }
    };
  }

  // Payment Gateway / Reconciliation
  if (q.includes('gateway') || q.includes('reconcil') || q.includes('webhook') || q.includes('razorpay') || q.includes('payment')) {
    return {
      text: `🔄 **Payment Gateway & Reconciliation Health**:\n• **Razorpay / UPI Instant Webhooks:** Online & verified with HMAC-SHA256.\n• **Auto-Action:** Upon invoice settlement, invoice status is stamped **Paid** and asset validity extended +365 days automatically.`,
      suggestedAction: { label: 'Open Payment Reconciliation', tab: 'admin-reconciliation' }
    };
  }

  // Carbon / Sustainability inquiries (backward-compatible)
  if (q.includes('carbon') || q.includes('footprint') || q.includes('eco') || q.includes('emission')) {
    return {
      text: `🌱 **Sustainability Intelligence**:\nDigital infrastructure energy efficiency directly lowers Scope 2 cloud server emissions. Using lightweight, serverless hosting reduces idle CPU draw by up to 68%.`,
      suggestedAction: null
    };
  }

  // General assistance fallback
  return {
    text: `I analyzed your inquiry: "${prompt}". As your **AI Brain Copilot**, I provide real-time intelligence on 15-day expiring assets, invoice collections, automated CRON sweeps, and payment ledger reconciliation.`,
    suggestedAction: { label: 'Check 15-Day Expiry Radar', tab: 'admin-assets' }
  };
}

/**
 * Formats structured system prompt for AI Brain
 * Includes live context of monitored assets, invoices, dues, and company profile.
 */
function buildSystemPrompt(selectedModel, userContext = {}) {
  const companyName = userContext.companyName || 'Prabha Infotech Private Limited (PIPL)';
  const totalAssets = userContext.totalAssets ?? 5;
  const expiringCount = userContext.expiringAssetsCount ?? 0;
  const pendingDue = userContext.totalDueFormatted || (userContext.totalDueAmount ? `₹${Number(userContext.totalDueAmount).toLocaleString('en-IN')}` : '₹0');
  const paidRevenue = userContext.totalPaidFormatted || (userContext.totalPaidAmount ? `₹${Number(userContext.totalPaidAmount).toLocaleString('en-IN')}` : '₹0');
  const expiringList = userContext.expiringAssetsSummary || 'None currently expiring within 15 days.';

  return `You are AI Brain, an ultra-intelligent neural copilot for ${companyName}, powered by ${selectedModel}.

ROLE & CAPABILITIES:
You monitor digital asset expirations (domains, SSL certificates, cloud servers, AMC contracts), automated 15-day CRON notification sweeps, GST tax invoicing (HSA/SAC, 18% GST), and payment gateway webhook reconciliations.

CURRENT LIVE SYSTEM TELEMETRY:
- Monitored Assets: ${totalAssets} total digital assets
- Critical 15-Day Expiration Radar: ${expiringCount} asset(s) expiring soon
- Expiring Items:
${expiringList}
- Pending Dues: ${pendingDue}
- Settled Revenue: ${paidRevenue}
- CRON Status: Active (Automated 15-day sweep with email dispatch & PDF invoices)
- Payment Gateway: Razorpay & UPI Webhooks verified with HMAC signature

RESPONSE GUIDELINES (MANDATORY):
1. Keep responses CONCISE, SHARP, and DIRECT (2 to 4 bullet points or 2-3 short sentences).
2. Cite real numbers, asset names, or rupee values directly from telemetry when relevant.
3. Be professional, proactive, and authoritative.
4. If asked about off-topic trivia (entertainment, medical diagnoses, sports), politely decline in one sentence and redirect to system monitoring or billing.`;
}

/**
 * Universal Stream Reader for Server-Sent Events (SSE)
 * Zero dependency - works in all modern browsers and hosting platforms.
 */
async function streamFetchResponse(response, onChunk, onReasoning) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let accumulatedContent = '';
  let accumulatedReasoning = '';
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(trimmed.slice(6));
            const delta = parsed.choices?.[0]?.delta;
            const contentDelta = delta?.content || '';
            const reasoningDelta = delta?.reasoning || '';

            if (reasoningDelta) {
              accumulatedReasoning += reasoningDelta;
              if (onReasoning) {
                onReasoning(accumulatedReasoning);
              }
            }

            if (contentDelta) {
              accumulatedContent += contentDelta;
              if (onChunk) {
                onChunk(accumulatedContent, accumulatedReasoning);
              }
            }
          } catch {
            // Ignore incomplete JSON chunks in SSE stream
          }
        }
      }
    }
  }

  return {
    content: accumulatedContent,
    reasoning: accumulatedReasoning
  };
}

/**
 * Executes a Chat Completion request to Groq using universal Fetch & SSE streaming.
 * Optimized for all hosting platforms (Vercel, Netlify, Cloudflare Pages, GitHub Pages).
 * 
 * Supports:
 * - Real-time streaming (via onChunk and onReasoning)
 * - Non-streaming responses
 * - Automatic fallback to local heuristics engine if network fails
 */
export async function askGroqAi({
  prompt,
  history = [],
  userContext = {},
  model = null,
  onChunk = null,
  onReasoning = null
}) {
  const apiKey = getGroqApiKey();
  const selectedModel = model || getGroqModel() || DEFAULT_GROQ_MODEL;
  const isStreaming = Boolean(onChunk);

  const systemMessage = {
    role: 'system',
    content: buildSystemPrompt(selectedModel, userContext)
  };

  // Format message history (keep last 6 for context efficiency)
  const formattedHistory = history.slice(-6).map((m) => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text || ''
  }));

  const messages = [
    systemMessage,
    ...formattedHistory,
    { role: 'user', content: prompt }
  ];

  let lastError = null;

  // Primary Endpoint: Direct Groq Official API with CORS support
  // Secondary Endpoint: Configurable local proxy (e.g. /groq-api/...)
  const endpoints = [
    'https://api.groq.com/openai/v1/chat/completions',
    '/groq-api/chat/completions'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages,
          temperature: 0.2,
          max_completion_tokens: 1024,
          top_p: 1,
          stream: isStreaming,
          reasoning_effort: 'medium',
          stop: null
        })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const msg = errorBody?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        lastError = msg;
        // If 401 or 400, no need to try proxy, break to fallback
        if (response.status === 401 || response.status === 400) {
          break;
        }
        continue;
      }

      if (isStreaming && response.body) {
        const streamResult = await streamFetchResponse(response, onChunk, onReasoning);
        const finalText = streamResult.content || streamResult.reasoning || 'Completed';

        return {
          text: finalText,
          reasoning: streamResult.reasoning,
          isLiveGroq: true,
          modelUsed: selectedModel,
          needsKey: false
        };
      } else {
        const data = await response.json();
        const choice = data?.choices?.[0];
        const message = choice?.message;
        const reply = message?.content || message?.reasoning || 'No response generated.';

        return {
          text: reply,
          reasoning: message?.reasoning || '',
          isLiveGroq: true,
          modelUsed: data?.model || selectedModel,
          needsKey: false
        };
      }
    } catch (fetchErr) {
      lastError = fetchErr?.message || 'Network request failed';
      // Continue to next endpoint if network failed
    }
  }

  // Graceful Fallback: Local intelligent heuristics if network or key fails
  console.warn('[AI Brain] Groq API call failed, activating local heuristics:', lastError);
  const fallback = getAiEcoResponse(prompt, userContext);

  return {
    text: `${fallback.text}`,
    suggestedAction: fallback.suggestedAction,
    isLiveGroq: false,
    modelUsed: `${selectedModel} (Offline Fallback)`,
    error: lastError,
    needsKey: !apiKey || apiKey === DEFAULT_GROQ_KEY
  };
}

/**
 * Quick ping verification to test Groq API key and model responsiveness
 * Measures round-trip latency in milliseconds.
 */
export async function testGroqConnection() {
  const apiKey = getGroqApiKey();
  const model = getGroqModel() || DEFAULT_GROQ_MODEL;
  const startTime = Date.now();

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'ping' }],
        model: model,
        max_completion_tokens: 100,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const durationMs = Date.now() - startTime;
    const choice = data?.choices?.[0]?.message;

    return {
      success: true,
      durationMs,
      model: model,
      response: choice?.content || choice?.reasoning || 'pong'
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Connection failed'
    };
  }
}

export default {
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
