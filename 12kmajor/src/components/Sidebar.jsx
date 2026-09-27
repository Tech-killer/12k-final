import React from "react";
import {
  LayoutDashboard,
  Server,
  BellRing,
  FileText,
  RefreshCw,
  GitFork,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { COMPANY_PROFILE } from "../data/mockData";

export default function Sidebar({
  activeTab,
  setActiveTab,
  onSelectTab,
  isSidebarOpen,
  isOpen,
  setIsSidebarOpen,
  onClose,
  expiringCount,
  onLogout,
  companyProfile = COMPANY_PROFILE,
  currentUser = null,
  theme = "dark"
}) {
  const sidebarOpen = isSidebarOpen ?? isOpen ?? false;
  const setSidebarOpen = (val) => {
    if (typeof setIsSidebarOpen === "function") setIsSidebarOpen(val);
    if (typeof onClose === "function" && !val) onClose();
  };

  const handleSelectTab = (tabId) => {
    if (typeof setActiveTab === "function") setActiveTab(tabId);
    if (typeof onSelectTab === "function") onSelectTab(tabId);
    setSidebarOpen(false);
  };

  const adminNavItems = [
    {
      id: "admin-dashboard",
      label: "Central Dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "admin-assets",
      label: "Assets & Expiry Monitor",
      icon: Server,
      badge: expiringCount > 0 ? `${expiringCount} Due` : "Active",
      badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30"
    },
    {
      id: "admin-cron",
      label: "15-Day CRON Engine",
      icon: BellRing,
      badge: "Automated",
      badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-500/30"
    },
    {
      id: "admin-invoices",
      label: "Invoices & Billing Hub",
      icon: FileText,
      badge: "GST Hub",
      badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/30"
    },
    {
      id: "admin-reconciliation",
      label: "Payment Reconciliation",
      icon: RefreshCw,
      badge: "Gateway",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
    },
    // {
    //   id: "frontend-tree",
    //   label: "Frontend Tree Flow Chart",
    //   icon: GitFork,
    //   badge: "Visual Tree",
    //   badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
    // }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          theme === "light"
            ? "bg-white border-r border-slate-200 text-slate-900 shadow-xl"
            : "bg-[#071328] border-r border-slate-800/80 text-slate-200"
        }`}
      >
        {/* Brand Header */}
        <div
          className={`sidebar-brand-header p-5 border-b transition-colors ${
            theme === "light"
              ? "border-slate-200 bg-white"
              : "border-slate-800/70 bg-gradient-to-b from-[#0e2246] to-[#071328]"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Stylized Logo */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-blue-900/40 shrink-0">
              <div className="w-full h-full bg-[#08152e] rounded-[10px] flex items-center justify-center font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-lg border border-blue-400/20">
                PI
              </div>
            </div>

            <div className="overflow-hidden">
              <h1
                className={`sidebar-brand-title font-extrabold text-sm tracking-tight leading-tight uppercase line-clamp-1 ${
                  theme === "light" ? "text-slate-900" : "text-white"
                }`}
              >
                Pandharkars
              </h1>
              <p className="text-[11px] font-semibold tracking-wider text-cyan-500 uppercase">
                Infotech Pvt Ltd
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 sidebar-section-label">
            Administrative Controls
          </div>

          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`sidebar-tab-btn w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? "sidebar-active-tab bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/40 border border-blue-400/40"
                    : "sidebar-inactive-tab text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-cyan-400"
                    }`}
                  />
                  <span className={isActive ? "text-white font-bold" : "font-medium"}>
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                      isActive
                        ? "sidebar-active-badge bg-white/25 text-white border border-white/50 shadow-xs"
                        : item.badgeColor || "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Session & Logout Footer */}
        <div
          className={`sidebar-user-footer p-3 border-t transition-colors ${
            theme === "light"
              ? "border-slate-200 bg-slate-50"
              : "border-slate-800/80 bg-[#061022]"
          }`}
        >
          <div
            className={`flex items-center justify-between p-2 rounded-lg border sidebar-user-card ${
              theme === "light"
                ? "bg-white border-slate-200 shadow-xs"
                : "bg-slate-900/80 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="shield-avatar w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm shadow-blue-500/20">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="overflow-hidden">
                <p
                  className={`sidebar-admin-name text-xs font-semibold truncate flex items-center gap-1.5 ${
                    theme === "light" ? "text-slate-900" : "text-white"
                  }`}
                >
                  {currentUser?.full_name || currentUser?.name || "Admin Master"}
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono">
                    {currentUser?.role || "Super"}
                  </span>
                </p>
                <p
                  className={`sidebar-admin-email text-[10px] truncate ${
                    theme === "light" ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {currentUser?.email || companyProfile?.email || "admin@yourcompany.com"}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
