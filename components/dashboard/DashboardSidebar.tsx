"use client";

import { useState, type ComponentType } from "react";
import Image from "next/image";
import {
  BarChart3, Building2, Calculator, Coins, LineChart,
  PieChart, Wallet, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardModel } from "@/types/dashboard";
import { formatPercent, formatTimes } from "@/lib/dashboard/format";

export type DashboardTab =
  | "Income Statement"
  | "Financials"
  | "Revenue"
  | "Balance Sheet"
  | "Cash Flow"
  | "Ratios"
  | "Shareholder View";

const navItems: { label: DashboardTab; icon: ComponentType<{ className?: string }>; badge?: string }[] = [
  { label: "Income Statement",  icon: LineChart },
  { label: "Financials",        icon: Calculator },
  { label: "Revenue",           icon: PieChart,  badge: "⚠" },
  { label: "Balance Sheet",     icon: Building2 },
  { label: "Cash Flow",         icon: Wallet },
  { label: "Ratios",            icon: BarChart3 },
  { label: "Shareholder View",  icon: Coins },
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
      <Icon className="h-4.5 w-4.5 shrink-0" />
      {open && (
        <span className="flex-1 whitespace-nowrap text-sm">{label}</span>
      )}
      {open && badge && (
        <span className="ml-auto text-amber-500 text-xs font-bold">{badge}</span>
      )}
    </button>
  );
}

export function DashboardSidebar({ activeTab, onChange, model }: {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  model?: DashboardModel;
}) {
  const [open, setOpen] = useState(true);

  return (
    <nav className={cn(
      "sticky top-0 flex h-screen flex-col shrink-0 border-r border-slate-200 bg-white transition-[width] duration-300 overflow-hidden",
      open ? "w-60" : "w-[60px]"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center gap-3 border-b border-slate-100 p-4", !open && "justify-center p-3")}>
        <div className="relative h-9 w-9 shrink-0 flex items-center justify-center">
          <Image 
            src="/logo-nb.png" 
            alt="Northbrook Logo" 
            width={36}
            height={36}
            className="object-contain"
            priority
          />
        </div>
        {open && (
          <div>
            <p className="text-sm font-bold text-slate-900 leading-tight">North-Brook</p>
            <p className="text-[11px] text-slate-400">Financial Portal</p>
          </div>
        )}
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
          className="flex h-9 w-full items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </nav>
  );
}
