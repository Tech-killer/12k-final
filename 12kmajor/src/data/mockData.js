/**
 * ==============================================================================
 * PANDHARKARS INFOTECH PRIVATE LIMITED (PIPL)
 * Enterprise Utility & Formatting Helper Module
 * NOTE: All static dummy data has been completely eliminated.
 * Real-time operational data is fetched dynamically from Hostinger MariaDB
 * via https://transporter.solutions/12k PHP REST endpoints.
 * ==============================================================================
 */

// Fallback Company Profile structure (used prior to live API fetch completion)
export const DEFAULT_COMPANY_PROFILE = {
  name: "PANDHARKARS INFOTECH PRIVATE LIMITED",
  shortName: "Pandharkars Infotech",
  tagline: "We Manage, Control & Grow Your Business!",
  cin: "U72900MH2021PTC366004",
  gstin: "27AAMCP2248L1ZY",
  email: "sales@pandharkarsinfotech.com",
  supportEmail: "support@pandharkarsinfotech.com",
  website: "www.pandharkarsinfotech.com",
  phone: "+91 98220 12345 / +91 (020) 2456-7890",
  address: "Level 4, Infotech Tower, Baner Tech Park, Pune, Maharashtra - 411045, India",
  bankDetails: {
    bankName: "HDFC Bank Ltd",
    branch: "Baner Road Branch, Pune",
    accountName: "PANDHARKARS INFOTECH PRIVATE LIMITED",
    accountNumber: "50200087462910",
    ifscCode: "HDFC0001234",
    accountType: "Current Account",
    upiId: "pandharkarsinfotech@hdfcbank"
  }
};

export const COMPANY_PROFILE = DEFAULT_COMPANY_PROFILE;

// Export empty arrays to eliminate static dummy data while preserving import compatibility
export const INITIAL_CLIENTS = [];
export const INITIAL_ASSETS = [];
export const INITIAL_INVOICES = [];
export const INITIAL_CRON_LOGS = [];
export const INITIAL_TRANSACTIONS = [];

// Reference date for simulation calculations
export const SIMULATED_TODAY = new Date();

/**
 * Safely parses any date string (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, ISO) into a local Date.
 */
export const parseDateSafe = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;

  const str = String(dateStr).trim();

  // Match DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1], 10);
    const month = parseInt(ddmmyyyy[2], 10) - 1;
    const year = parseInt(ddmmyyyy[3], 10);
    return new Date(year, month, day);
  }

  // Match YYYY-MM-DD or YYYY/MM/DD
  const yyyymmdd = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (yyyymmdd) {
    const year = parseInt(yyyymmdd[1], 10);
    const month = parseInt(yyyymmdd[2], 10) - 1;
    const day = parseInt(yyyymmdd[3], 10);
    return new Date(year, month, day);
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Calculates accurate calendar days remaining from today until the specified expiry date string.
 * Normalizes both today and expiry to midnight local time to prevent off-by-one errors from hours/minutes.
 */
export const calculateDaysRemaining = (expiryDateStr) => {
  if (!expiryDateStr) return 0;
  const expiry = parseDateSafe(expiryDateStr);
  if (!expiry) return 0;

  const now = new Date();
  // Normalize both dates to midnight local calendar time
  const expiryMidnight = new Date(expiry.getFullYear(), expiry.getMonth(), expiry.getDate()).getTime();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffMs = expiryMidnight - todayMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Formats a numeric currency value into Indian Rupee standard format.
 */
export const formatINR = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(num);
};

/**
 * Returns color-coded badge info based on remaining days until expiry.
 */
export const getExpiryBadgeInfo = (days) => {
  if (days < 0) {
    return {
      label: `Expired ${Math.abs(days)}d ago`,
      bgColor: "bg-red-500/15 text-red-400 border-red-500/30",
      pillColor: "bg-red-500",
      urgency: "EXPIRED"
    };
  }
  if (days === 0) {
    return {
      label: "Expires Today (Urgent)",
      bgColor: "bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse font-bold",
      pillColor: "bg-rose-500",
      urgency: "EXPIRED_TODAY"
    };
  }
  if (days === 1) {
    return {
      label: "1 Day Remaining (Critical)",
      bgColor: "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse font-bold",
      pillColor: "bg-rose-500",
      urgency: "CRITICAL"
    };
  }
  if (days <= 5) {
    return {
      label: `${days} Days Remaining (Urgent)`,
      bgColor: "bg-orange-500/20 text-orange-300 border-orange-500/40 animate-pulse font-bold",
      pillColor: "bg-orange-500",
      urgency: "CRITICAL"
    };
  }
  if (days <= 15) {
    return {
      label: `${days} Days Remaining (Renewal Due)`,
      bgColor: "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold",
      pillColor: "bg-amber-500",
      urgency: "WARNING"
    };
  }
  if (days <= 30) {
    return {
      label: `${days} Days Remaining`,
      bgColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
      pillColor: "bg-blue-500",
      urgency: "MODERATE"
    };
  }
  return {
    label: `${days} Days Remaining (Healthy)`,
    bgColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    pillColor: "bg-emerald-500",
    urgency: "HEALTHY"
  };
};

/**
 * Converts an integer/float amount to official INR verbal representation.
 */
export const amountInWordsINR = (num) => {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return "overflow";
    let nArray = ("000000000" + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArray) return "";
    let str = "";
    str += nArray[1] != 0 ? (a[Number(nArray[1])] || b[nArray[1][0]] + " " + a[nArray[1][1]]) + "Crore " : "";
    str += nArray[2] != 0 ? (a[Number(nArray[2])] || b[nArray[2][0]] + " " + a[nArray[2][1]]) + "Lakh " : "";
    str += nArray[3] != 0 ? (a[Number(nArray[3])] || b[nArray[3][0]] + " " + a[nArray[3][1]]) + "Thousand " : "";
    str += nArray[4] != 0 ? (a[Number(nArray[4])] || b[nArray[4][0]] + " " + a[nArray[4][1]]) + "Hundred " : "";
    str += nArray[5] != 0 ? ((str != "") ? "and " : "") + (a[Number(nArray[5])] || b[nArray[5][0]] + " " + a[nArray[5][1]]) : "";
    return str.trim();
  };

  const integerPart = Math.floor(Number(num) || 0);
  const words = inWords(integerPart);
  return words ? `Rupees ${words} Only` : "Rupees Zero Only";
};

/**
 * Formats standard ISO YYYY-MM-DD date to DD-MM-YYYY format (e.g. 07-10-2027)
 */
export const formatDateDDMMYYYY = (isoStr) => {
  if (!isoStr) return "--";
  if (/^\d{2}-\d{2}-\d{4}$/.test(isoStr)) return isoStr;
  const match = String(isoStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  return isoStr;
};
