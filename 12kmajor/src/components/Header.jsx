import React from "react";
import { Menu, Sun, Moon } from "lucide-react";

export default function Header({
  activeTab,
  isSidebarOpen,
  isOpen,
  setIsSidebarOpen,
  onToggleSidebar,
  expiringCount,
  onOpenQuickInvoice,
  currentUser,
  onLogout,
  theme = "dark",
  toggleTheme
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case "admin-dashboard":
        return "Centralized Renewal & Revenue Dashboard";
      case "admin-assets":
        return "Digital Asset Inventory & 15-Day Expiry Radar";
      case "admin-cron":
        return "Automated 15-Day Notification Engine (CRON)";
      case "admin-invoices":
        return "GST Billing Hub & Tax Invoices";
      case "admin-reconciliation":
        return "Payment Gateway & Automated Reconciliation";
      case "frontend-tree":
        return "Frontend System Architecture & Interactive Tree Flow Chart";
      default:
        return "Admin Renewal & Billing Platform";
    }
  };

  const handleToggle = () => {
    if (typeof onToggleSidebar === "function") {
      onToggleSidebar();
    } else if (typeof setIsSidebarOpen === "function") {
      setIsSidebarOpen(!(isSidebarOpen ?? isOpen));
    }
  };

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 lg:px-8 py-3 transition-colors duration-200 ${
        theme === "light"
          ? "bg-white/95 border-slate-200 shadow-xs"
          : "bg-[#071328]/95 border-slate-800/80"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu + View Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className={`p-2 rounded-lg lg:hidden transition-colors ${
              theme === "light"
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">
                Admin Control Room
              </span>
              <span className={theme === "light" ? "text-slate-300" : "text-slate-600"}>/</span>
              <span
                className={`text-xs font-medium ${
                  theme === "light" ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Team Beta - Module 2
              </span>
            </div>
            <h2
              className={`text-base lg:text-lg font-bold tracking-tight ${
                theme === "light" ? "text-slate-900" : "text-white"
              }`}
            >
              {getTabTitle()}
            </h2>
          </div>
        </div>

        {/* Right Side: Theme Toggle, Quick Invoice */}
        <div className="flex items-center gap-2.5 sm:gap-3">

          {/* Day / Night Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 shadow-sm cursor-pointer ${
              theme === "dark"
                ? "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-amber-300"
                : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800"
            }`}
            title={theme === "dark" ? "Switch to Day Mode (White Theme)" : "Switch to Night Mode (Dark Theme)"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-200">Day Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-slate-800">Night Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
