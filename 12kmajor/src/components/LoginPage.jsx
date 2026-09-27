import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Shield,
  Sparkles,
  UserPlus,
  LogIn,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { COMPANY_PROFILE } from "../data/mockData";
import api from "../services/apiService";

export default function LoginPage({ onLogin }) {
  const [authMode, setAuthMode] = useState("otp"); // 'otp' | 'login' | 'register'
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // OTP Login Tab states
  const [otpStep, setOtpStep] = useState("email"); // 'email' | 'code'
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const inputRefs = useRef([]);

  // Registration Email OTP Verification states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingRegOtp, setIsSendingRegOtp] = useState(false);
  const [isVerifyingRegOtp, setIsVerifyingRegOtp] = useState(false);
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpDigits, setRegOtpDigits] = useState(["", "", "", "", "", ""]);
  const [regOtpCooldown, setRegOtpCooldown] = useState(0);
  const regInputRefs = useRef([]);

  // Countdown timer for OTP Tab resend cooldown
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const interval = setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCooldown]);

  // Countdown timer for Registration OTP resend cooldown
  useEffect(() => {
    if (regOtpCooldown <= 0) return;
    const interval = setInterval(() => {
      setRegOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [regOtpCooldown]);

  // ============================================================================
  // TAB 1: EMAIL OTP LOGIN HANDLERS
  // ============================================================================
  const handleDigitChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, "");

    if (!clean) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      return;
    }

    const next = [...otpDigits];

    // Multi-digit paste or fast typing
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split("");
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c;
      });
      setOtpDigits(next);
      const targetIdx = Math.min(index + chars.length, 5);
      inputRefs.current[targetIdx]?.focus();

      if (next.every((d) => d !== "")) {
        handleVerifyOtp(null, next.join(""));
      }
      return;
    }

    next[index] = clean;
    setOtpDigits(next);

    // Focus next box
    if (index < 5 && clean) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 boxes are filled
    if (next.every((d) => d !== "")) {
      handleVerifyOtp(null, next.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((c, i) => {
      next[i] = c;
    });
    setOtpDigits(next);

    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();

    if (pasted.length === 6) {
      handleVerifyOtp(null, pasted);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid administrator email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await api.sendOtp(cleanEmail, "", "login");
      if (res.success) {
        setOtpStep("code");
        setOtpCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        setSuccessMessage(
          res.message || `A 6-digit verification code has been dispatched to ${cleanEmail}. Check your inbox!`
        );

        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 150);
      } else {
        if (res.data?.notRegistered || (res.message && res.message.toLowerCase().includes("not registered"))) {
          setErrorMessage(
            res.message || "This email is not registered. Please create an account first under the Register tab."
          );
        } else {
          setErrorMessage(
            res.message || res.error || "Failed to dispatch verification code. Please check your connection."
          );
        }
      }
    } catch (err) {
      setErrorMessage("Connection error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e, directCode) => {
    if (e) e.preventDefault();
    const code = directCode || otpDigits.join("").trim();

    if (!code || code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the OTP verification code.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await api.verifyOtp(email.trim(), code);
      if (res.success) {
        setSuccessMessage("OTP verified successfully! Authenticating administrator session...");
        const userObj = res.data?.user
          ? { ...res.data.user, token: res.data.token }
          : { email: email.trim(), role: "super_admin", token: res.data?.token || "session-" + Date.now() };
        setTimeout(() => {
          onLogin(userObj);
        }, 500);
      } else {
        setErrorMessage(
          res.message || res.error || "Invalid or expired OTP verification code. Please check your email and try again."
        );
      }
    } catch (err) {
      setErrorMessage("Verification error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // TAB 3: REGISTRATION EMAIL OTP VERIFICATION HANDLERS
  // ============================================================================
  const handleSendRegOtp = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address before requesting an OTP code.");
      return;
    }

    setIsSendingRegOtp(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await api.sendOtp(cleanEmail, fullName.trim(), "register");
      if (res.success) {
        setRegOtpSent(true);
        setRegOtpCooldown(60);
        setRegOtpDigits(["", "", "", "", "", ""]);
        setSuccessMessage(`Verification OTP sent to ${cleanEmail}. Enter the 6-digit code below.`);
        setTimeout(() => {
          regInputRefs.current[0]?.focus();
        }, 150);
      } else {
        if (res.data?.alreadyRegistered || (res.message && res.message.toLowerCase().includes("already registered"))) {
          setErrorMessage(
            res.message || "An account with this email is already registered. Please sign in via Email OTP or Password."
          );
        } else {
          setErrorMessage(res.message || res.error || "Failed to send verification code to this email.");
        }
      }
    } catch (err) {
      setErrorMessage("Error sending verification code: " + err.message);
    } finally {
      setIsSendingRegOtp(false);
    }
  };

  const handleRegDigitChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, "");
    const next = [...regOtpDigits];

    if (!clean) {
      next[index] = "";
      setRegOtpDigits(next);
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split("");
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c;
      });
      setRegOtpDigits(next);
      const targetIdx = Math.min(index + chars.length, 5);
      regInputRefs.current[targetIdx]?.focus();
      if (next.every((d) => d !== "")) {
        handleVerifyRegOtp(next.join(""));
      }
      return;
    }

    next[index] = clean;
    setRegOtpDigits(next);

    if (index < 5 && clean) {
      regInputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "")) {
      handleVerifyRegOtp(next.join(""));
    }
  };

  const handleRegKeyDown = (index, e) => {
    if (e.key === "Backspace" && !regOtpDigits[index] && index > 0) {
      regInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      regInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      regInputRefs.current[index + 1]?.focus();
    }
  };

  const handleRegOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pasted) return;

    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((c, i) => {
      next[i] = c;
    });
    setRegOtpDigits(next);

    const targetIdx = Math.min(pasted.length, 5);
    regInputRefs.current[targetIdx]?.focus();

    if (pasted.length === 6) {
      handleVerifyRegOtp(pasted);
    }
  };

  const handleVerifyRegOtp = async (codeToVerify) => {
    const code = typeof codeToVerify === "string" ? codeToVerify : regOtpDigits.join("").trim();
    if (!code || code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the OTP verification code.");
      return;
    }

    setIsVerifyingRegOtp(true);
    setErrorMessage("");

    try {
      const res = await api.verifyOtp(email.trim(), code);
      if (res.success) {
        setIsEmailVerified(true);
        setSuccessMessage("Email address verified successfully! You can now set your password and complete registration.");
      } else {
        setErrorMessage(res.message || "Invalid verification code. Please check your email and try again.");
      }
    } catch (err) {
      setErrorMessage("Verification error: " + err.message);
    } finally {
      setIsVerifyingRegOtp(false);
    }
  };

  // ============================================================================
  // TAB 2: PASSWORD LOGIN HANDLER
  // ============================================================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await api.login(email.trim(), password);
      if (res.success) {
        const userObj = res.data?.user
          ? { ...res.data.user, token: res.data.token }
          : { email: email.trim(), role: "super_admin", token: res.data?.token || "session-" + Date.now() };
        onLogin(userObj);
      } else {
        if (res.data?.notRegistered || (res.message && res.message.toLowerCase().includes("not registered"))) {
          setErrorMessage(
            res.message || "No registered account found with this email. Please register first under the Register tab."
          );
        } else if (res.data?.invalidPassword || (res.message && res.message.toLowerCase().includes("incorrect password"))) {
          setErrorMessage(
            res.message || "Incorrect password. Please verify your password or use Email OTP to sign in."
          );
        } else {
          setErrorMessage(
            res.message || "Invalid credentials. Please verify your credentials or use Email OTP."
          );
        }
      }
    } catch (err) {
      setErrorMessage("Connection error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // TAB 3: REGISTRATION SUBMISSION HANDLER
  // ============================================================================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage("Please enter your Full Name / Admin Name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("A valid email address is required.");
      return;
    }

    // If email is not yet verified, require OTP verification first
    if (!isEmailVerified) {
      if (!regOtpSent) {
        await handleSendRegOtp();
        setErrorMessage("Please verify your email with the 6-digit OTP code sent to your inbox before proceeding.");
      } else {
        setErrorMessage("Please enter the 6-digit OTP code above to verify your email first.");
      }
      return;
    }

    if (!password) {
      setErrorMessage("Please create a secure password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (password.length < 4) {
      setErrorMessage("Password must be at least 4 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await api.register(fullName.trim(), email.trim(), password, true);
      if (res.success) {
        setSuccessMessage("Super Administrator account created successfully! Signing in...");
        const userObj = res.data?.user
          ? { ...res.data.user, token: res.data.token }
          : { email: email.trim(), full_name: fullName.trim(), role: "super_admin", token: res.data?.token || "session-" + Date.now() };
        setTimeout(() => {
          onLogin(userObj);
        }, 500);
      } else {
        setErrorMessage(res.message || "Registration failed. Check backend database.");
      }
    } catch (err) {
      setErrorMessage("Registration error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050e1f] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-[#07152e]/80 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-900/50">
            <div className="w-full h-full bg-[#08152e] rounded-[10px] flex items-center justify-center font-black text-cyan-300 text-lg">
              PI
            </div>
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight text-white block uppercase">
              {COMPANY_PROFILE.name}
            </span>
            <span className="text-[11px] font-medium text-cyan-400 italic">
              "{COMPANY_PROFILE.tagline}"
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          <a
            href={`mailto:${COMPANY_PROFILE.email}`}
            className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{COMPANY_PROFILE.email}</span>
          </a>
        </div>
      </header>

      {/* Main Centered Login / Registration Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="bg-[#0b1b36]/90 border border-slate-700/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-950/70 space-y-6">
            {/* Box Header */}
            <div className="border-b border-slate-800/80 pb-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-900/50 mb-3">
                <div className="w-full h-full bg-[#08152e] rounded-[14px] flex items-center justify-center font-black text-cyan-300 text-xl">
                  PI
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {authMode === "otp"
                    ? "Email OTP Sign In"
                    : authMode === "login"
                    ? "Password Sign In"
                    : "Create Super Admin"}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  Super Admin
                </span>
              </div>

              <p className="text-xs text-slate-400">
                {authMode === "otp"
                  ? "Instant passwordless 6-digit code delivered directly to your inbox"
                  : authMode === "login"
                  ? "Enter your credentials to access the central management console"
                  : "Register your administrator credentials"}
              </p>

              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Backend Gateway: Live & Connected (MongoDB Atlas)</span>
              </div>

              {/* Status Notifications */}
              {errorMessage && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs text-left flex items-start gap-2.5 shadow-lg shadow-rose-950/30">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium leading-relaxed">{errorMessage}</p>
                    {errorMessage.toLowerCase().includes("not registered") || errorMessage.toLowerCase().includes("register first") ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("register");
                          setErrorMessage("");
                          setSuccessMessage("");
                        }}
                        className="mt-2 inline-flex items-center gap-1 font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/40 hover:bg-cyan-900/80 hover:text-cyan-100 transition-all cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Switch to Register Tab &amp; Create Account &rarr;</span>
                      </button>
                    ) : errorMessage.toLowerCase().includes("already registered") ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("otp");
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          className="inline-flex items-center gap-1 font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/40 hover:bg-cyan-900/80 hover:text-cyan-100 transition-all cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Sign in with Email OTP &rarr;</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          className="inline-flex items-center gap-1 font-bold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>Sign in with Password &rarr;</span>
                        </button>
                      </div>
                    ) : authMode === "login" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("otp");
                          setErrorMessage("");
                        }}
                        className="mt-1.5 font-bold text-cyan-300 underline hover:text-cyan-200 block cursor-pointer"
                      >
                        &rarr; Try Email OTP Sign In instead
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs text-center font-medium flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
            </div>

            {/* Auth Mode Toggle Tabs (3 Options) */}
            <div className="grid grid-cols-3 p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === "otp"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-300" />
                <span>Email OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === "login"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMode === "register"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>

            {/* ============================================================= */}
            {/* Mode 1: Clean Email OTP Flow */}
            {/* ============================================================= */}
            {authMode === "otp" && (
              <div className="space-y-4">
                {otpStep === "email" ? (
                  /* Step 1: Request OTP Form (Clean, no extra banners or toggles) */
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Administrator Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. admin@yourcompany.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Dispatching Verification OTP...</span>
                        </span>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Send 6-Digit OTP Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Direct email delivery via Hostinger Native Mailer</span>
                    </div>
                  </form>
                ) : (
                  /* Step 2: 6-Box Split Digit OTP Verification Form */
                  <form onSubmit={(e) => handleVerifyOtp(e)} className="space-y-4">
                    {/* Recipient badge */}
                    <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-700/50 text-xs text-blue-200">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-slate-300">Code dispatched to:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpStep("email");
                            setErrorMessage("");
                            setSuccessMessage("");
                          }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Change Email</span>
                        </button>
                      </div>
                      <p className="font-mono text-cyan-300 font-bold text-sm">{email}</p>
                    </div>

                    {/* 6 Individual Digit Boxes */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-300">
                          Enter 6-Digit Code
                        </label>
                        <span className="text-[11px] text-slate-500 font-mono">10 min expiry</span>
                      </div>

                      <div className="flex items-center justify-between gap-2" onPaste={handlePaste}>
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (inputRefs.current[idx] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(idx, e)}
                            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl bg-slate-900/90 border transition-all focus:outline-none ${
                              digit
                                ? "border-cyan-400 text-cyan-300 bg-cyan-950/20 shadow-lg shadow-cyan-950/40"
                                : "border-slate-700/80 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || otpDigits.some((d) => d === "")}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-teal-900/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>Verifying Code...</span>
                        </span>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify & Enter Platform</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Resend OTP Row */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <button
                        type="button"
                        disabled={otpCooldown > 0 || isSubmitting}
                        onClick={handleSendOtp}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                          otpCooldown > 0
                            ? "text-slate-600 cursor-not-allowed"
                            : "text-cyan-400 hover:text-cyan-300 font-semibold"
                        }`}
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? "animate-spin" : ""}`} />
                        <span>
                          {otpCooldown > 0
                            ? `Resend in ${Math.floor(otpCooldown / 60)}:${(otpCooldown % 60).toString().padStart(2, "0")}`
                            : "Resend OTP Code"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep("email");
                          setErrorMessage("");
                        }}
                        className="text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        Back to email entry
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* Mode 2: Standard Sign In Form (Password) */}
            {/* ============================================================= */}
            {authMode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Your Administrator Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin@yourcompany.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">Your Password</label>
                    <span className="text-[11px] text-slate-500">Database Encrypted</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember my session</span>
                  </label>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> 256-bit SSL
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Enter Admin Platform</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ============================================================= */}
            {/* Mode 3: Create Super Admin Account Form (with Email OTP Verification) */}
            {/* ============================================================= */}
            {authMode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* 1. Full Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Full Name / Admin Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    />
                  </div>
                </div>

                {/* 2. Your Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Your Email Address
                    </label>
                    {isEmailVerified ? (
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-mono">
                        Verification Required
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (isEmailVerified) setIsEmailVerified(false);
                      }}
                      placeholder="e.g. admin@yourcompany.com"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                        isEmailVerified
                          ? "border-emerald-500/80 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                          : "border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                      }`}
                    />
                  </div>
                </div>

                {/* 3. Email OTP Verification Widget (Right below Email ID) */}
                <div className="space-y-2">
                  {!isEmailVerified ? (
                    <div>
                      {!regOtpSent ? (
                        <button
                          type="button"
                          disabled={isSendingRegOtp || !email.trim() || !email.includes("@")}
                          onClick={handleSendRegOtp}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed verify-otp-btn"
                        >
                          {isSendingRegOtp ? (
                            <>
                              <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                              <span className="text-white font-bold">Sending OTP Code...</span>
                            </>
                          ) : (
                            <>
                              <KeyRound className="w-3.5 h-3.5 text-white" />
                              <span className="text-white font-bold text-xs tracking-wide">Verify Email with 6-Digit OTP</span>
                              <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-slate-900/95 border border-cyan-500/50 space-y-2.5 shadow-lg shadow-cyan-950/30 reg-otp-box">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-cyan-300 font-semibold reg-otp-prompt">Enter 6-digit code sent to email:</span>
                            <button
                              type="button"
                              disabled={regOtpCooldown > 0}
                              onClick={handleSendRegOtp}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer disabled:opacity-50 disabled:no-underline reg-otp-resend"
                            >
                              {regOtpCooldown > 0 ? `Resend (${regOtpCooldown}s)` : "Resend OTP"}
                            </button>
                          </div>

                          {/* 6 Individual Digit Boxes for Registration Verification */}
                          <div className="flex items-center justify-between gap-1.5" onPaste={handleRegOtpPaste}>
                            {regOtpDigits.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => (regInputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleRegDigitChange(idx, e.target.value)}
                                onKeyDown={(e) => handleRegKeyDown(idx, e)}
                                className={`w-10 h-12 text-center text-lg font-bold font-mono rounded-lg bg-slate-950 border transition-all focus:outline-none ${
                                  digit
                                    ? "border-cyan-400 text-cyan-300 bg-cyan-950/30"
                                    : "border-slate-700 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                                }`}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={isVerifyingRegOtp || regOtpDigits.some((d) => d === "")}
                            onClick={() => handleVerifyRegOtp()}
                            className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-950/50 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isVerifyingRegOtp ? (
                              <span className="flex items-center gap-2">
                                <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                <span>Verifying Email...</span>
                              </span>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Confirm & Verify Email</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-semibold">Email Ownership Verified</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">Ready to Register</span>
                    </div>
                  )}
                </div>

                {/* 4. Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Create Super Admin Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Create Super Admin & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer Details */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-[#061022]/90 backdrop-blur-sm py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} <strong className="text-slate-300">{COMPANY_PROFILE.name}</strong>. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Baner Tech Park, Pune, Maharashtra</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
