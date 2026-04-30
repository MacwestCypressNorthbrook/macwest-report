"use client";

import { useState, type ComponentType } from "react";
import Image from "next/image";
import {
  BarChart3, Building2, Calculator, Coins, LineChart,
  PieChart, Wallet, ChevronLeft, ChevronRight, LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardModel } from "@/types/dashboard";
import { formatPercent, formatTimes } from "@/lib/dashboard/format";

export type DashboardTab =
  | "Executive Summary"
  | "Income Statement"
  // | "Financials"
  | "Revenue"
  | "Balance Sheet"
  | "Cash Flow"
  | "Ratios"
  | "Shareholder View";

const navItems: { label: DashboardTab; icon: ComponentType<{ className?: string }>; badge?: string }[] = [
  { label: "Executive Summary", icon: LayoutDashboard },
  { label: "Income Statement", icon: LineChart },
  // { l abel: "Financials",         icon: Calculator },
  { label: "Revenue", icon: PieChart, badge: "⚠" },
  { label: "Balance Sheet", icon: Building2 },
  { label: "Cash Flow", icon: Wallet },
  { label: "Ratios", icon: BarChart3 },
  { label: "Shareholder View", icon: Coins },
];

function NavItem({ label, icon: Icon, badge, activeTab, onChange, open }: {
  label: DashboardTab;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  open: boolean;
}) {
  const active = activeTab === label;
  return (
    <button onClick={() => onChange(label)} className={cn("sidebar-item", active && "active")}>
      <Icon className="h-5 w-5 shrink-0" />
      {open && (
        <span className="flex-1 whitespace-nowrap text-sm">{label}</span>
      )}
      {open && badge && (
        <span className="ml-auto text-amber-500 text-xs font-bold">{badge}</span>
      )}
    </button>
  );
}

export function DashboardSidebar({ activeTab, onChange, model, isOpen, onClose }: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  model?: DashboardModel;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(true);

  const sidebarContent = (
    <nav className={cn(
      "flex h-full flex-col bg-white transition-[width] duration-300 overflow-hidden",
      open ? "w-60" : "w-[60px]"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 border-b border-slate-100 p-6", !open && "px-4")}>
        <div className="relative shrink-0 flex items-center justify-center">
          <Image
            src="/logo-macwest-new.png"
            alt="Macwest Logo"
            width={open ? 140 : 32}
            height={32}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            badge={item.badge}
            activeTab={activeTab}
            onChange={onChange}
            open={open}
          />
        ))}
      </div>

      {/* Quick stats + toggle */}
      <div className="border-t border-slate-100 p-3 space-y-2">
        {open && model && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="section-label mb-2">Quick Stats</p>
            {[
              { label: "ROE", value: formatPercent(model.shareholderView.roe) },
              { label: "D/E", value: formatTimes(model.shareholderView.debtToEquity) },
              { label: "Curr.", value: formatTimes(model.ratios.currentRatio) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-0.5">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-xs font-bold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="hidden md:flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex sticky top-0 h-screen border-r border-slate-200 bg-white shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer Content */}
        <div
          className={cn(
            "relative flex h-full w-64 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Re-using the same content structure but forced to be open/expanded for mobile */}
          <nav className="flex h-full w-full flex-col overflow-hidden">
            {/* Logo */}
            <div className="flex items-center gap-3 border-b border-slate-100 p-6">
              <div className="relative shrink-0 flex items-center justify-center">
                <Image
                  src="/logo-macwest-new.png"
                  alt="Macwest Logo"
                  width={140}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Nav items */}
            <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                  activeTab={activeTab}
                  onChange={(tab) => {
                    onChange(tab);
                    onClose?.();
                  }}
                  open={true}
                />
              ))}
            </div>

            {/* User profile & Company footer */}
            <div className="border-t border-slate-100 p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#941c1c] flex items-center justify-center text-white font-bold text-xs shadow-sm border border-[#941c1c]/10">
                  MW
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">Macwest Limited</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">CFO Portal</p>
                </div>
              </div>
            </div>

            {/* Quick stats on mobile bottom */}
            <div className="border-t border-slate-100 p-3 md:hidden">
              {model && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                  <p className="section-label mb-2">Quick Stats</p>
                  {[
                    { label: "ROE", value: formatPercent(model.shareholderView.roe) },
                    { label: "D/E", value: formatTimes(model.shareholderView.debtToEquity) },
                    { label: "Curr.", value: formatTimes(model.ratios.currentRatio) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-0.5">
                      <span className="text-xs text-slate-500">{label}</span>
                      <span className="text-xs font-bold text-slate-900">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
