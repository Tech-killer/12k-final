/**
 * ==============================================================================
 * PANDHARKARS INFOTECH PRIVATE LIMITED (PIPL)
 * Production API Client for Hostinger PHP Backend
 * Target Endpoint: https://transporter.solutions/12k
 * ==============================================================================
 */

export const DEFAULT_API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : 'https://transporter.solutions/12k';
export const STORAGE_KEY_API_URL = 'pipl_backend_api_url';
export const STORAGE_KEY_TOKEN = 'pipl_auth_token';

export const STORAGE_KEY_API_KEY = 'pipl_backend_api_key';

/**
 * Retrieves the active backend API Base URL / API Key.
 * Checks: LocalStorage -> Vite Environment (.env) -> Default Hostinger URL
 */
export function getApiBaseUrl() {
  if (typeof window === 'undefined') return DEFAULT_API_BASE_URL;

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost) {
    const saved = localStorage.getItem(STORAGE_KEY_API_URL) || localStorage.getItem(STORAGE_KEY_API_KEY);
    if (saved && (saved.includes('localhost') || saved.includes('127.0.0.1'))) {
      return saved.replace(/\/+$/, '');
    }
    return 'http://localhost:8000';
  }

  const val = (
    localStorage.getItem(STORAGE_KEY_API_KEY) ||
    localStorage.getItem(STORAGE_KEY_API_URL) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
    DEFAULT_API_BASE_URL
  );
  let cleaned = String(val).trim();
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned.replace(/\/+$/, '');
}

export const getApiKey = getApiBaseUrl;

/**
 * Updates or resets the backend API Base URL / API Key in localStorage.
 */
export function setApiBaseUrl(url) {
  if (typeof window === 'undefined') return;
  if (url && url.trim()) {
    let cleaned = url.trim();
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned;
    }
    const normalized = cleaned.replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY_API_URL, normalized);
    localStorage.setItem(STORAGE_KEY_API_KEY, normalized);
  } else {
    localStorage.removeItem(STORAGE_KEY_API_URL);
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }
}

export const setApiKey = setApiBaseUrl;

/**
 * Quick diagnostic ping to test backend connection and database health.
 */
export async function testApiConnection() {
  const startTime = Date.now();
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/test_db.php?format=json`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const durationMs = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    return {
      success: response.ok && data.success !== false,
      durationMs,
      url: baseUrl,
      data: data.data || data,
      message: data.message || (response.ok ? 'Connection verified' : 'Connection failed')
    };
  } catch (err) {
    return {
      success: false,
      durationMs: Date.now() - startTime,
      url: baseUrl,
      error: err.message
    };
  }
}

/**
 * Universal request handler with JSON parsing, error handling, and authorization.
 */
async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `${baseUrl}/${cleanEndpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_TOKEN) : null;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn(`[API] Request to ${url} failed:`, err);
    return {
      success: false,
      error: err.message,
      url
    };
  }
}

export const api = {
  // Config & Diagnostics
  getApiBaseUrl,
  setApiBaseUrl,
  getApiKey,
  setApiKey,
  testApiConnection,
  DEFAULT_API_BASE_URL,

  // 1. Authentication (LoginPage.jsx)
  login: async (email, password) => {
    const res = await request('auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, action: 'login' })
    });
    if (res.success && typeof window !== 'undefined') {
      if (res.data?.token) localStorage.setItem(STORAGE_KEY_TOKEN, res.data.token);
      if (res.data?.user) localStorage.setItem('pipl_active_user', JSON.stringify(res.data.user));
    }
    return res;
  },
  sendOtp: async (email, fullName = '', intent = 'login') => {
    return request('auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, fullName, name: fullName, intent, action: 'send_otp' })
    });
  },
  verifyOtp: async (email, otp) => {
    const res = await request('auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, action: 'verify_otp' })
    });
    if (res.success && typeof window !== 'undefined') {
      if (res.data?.token) localStorage.setItem(STORAGE_KEY_TOKEN, res.data.token);
      if (res.data?.user) localStorage.setItem('pipl_active_user', JSON.stringify(res.data.user));
    }
    return res;
  },
  register: async (fullName, email, password, otpVerified = false) => {
    const res = await request('auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: fullName, email, password, otpVerified, action: 'register' })
    });
    if (res.success && typeof window !== 'undefined') {
      if (res.data?.token) localStorage.setItem(STORAGE_KEY_TOKEN, res.data.token);
      if (res.data?.user) localStorage.setItem('pipl_active_user', JSON.stringify(res.data.user));
    }
    return res;
  },

  // 2. Central Dashboard KPIs (AdminDashboard.jsx)
  getDashboard: () => request('dashboard.php'),
  getCompanyProfile: () => request('company.php'),
  updateCompanyProfile: (profile) => 
    request('company.php', { method: 'PUT', body: JSON.stringify(profile) }),

  // 3. Digital Asset Management (AssetTracker.jsx & Radar)
  getAssets: (filter = '') => 
    request(`assets.php${filter ? `?filter=${encodeURIComponent(filter)}` : ''}`),
  getExpiringRadar: () => request('assets.php?filter=expiring'),
  createAsset: (asset) => 
    request('assets.php', { method: 'POST', body: JSON.stringify(asset) }),
  updateAsset: (id, asset) => 
    request(`assets.php?id=${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(asset) }),
  deleteAsset: (id) => 
    request(`assets.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
  sendPaymentLink: (data) =>
    request('assets/send-payment-link', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 4. Invoices & Billing Hub (AdminInvoices.jsx & InvoiceModal.jsx)
  getInvoices: (status = '') => 
    request(`invoices.php${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  createInvoice: (data) => 
    request('invoices.php', { method: 'POST', body: JSON.stringify(data) }),
  settleInvoice: (invoiceNumber, paymentMethod) => 
    request('invoices.php', {
      method: 'PUT',
      body: JSON.stringify({ invoiceNumber, paymentMethod, status: 'Paid' })
    }),

  // 5. Autonomous CRON Sweep Engine (NotificationEngine.jsx)
  getCronLogs: () => request('cron.php'),
  triggerCronSweep: () => request('cron.php', { method: 'POST' }),
  getCronStatus: () => request('cron/status'),
  toggleCronPause: (isPaused) => 
    request('cron/toggle-pause', { 
      method: 'POST', 
      body: JSON.stringify(isPaused !== undefined ? { isPaused } : {}) 
    }),
  sendRenewalNotice: (data) =>
    request('cron/send-single', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // 6. Payment Webhook Reconciliation (ReconciliationEngine.jsx)
  getTransactions: () => request('transactions.php'),
  simulateWebhook: (invoiceNumber) => 
    request('reconciliation.php', {
      method: 'POST',
      body: JSON.stringify({ invoiceNumber })
    })
};

export default api;
