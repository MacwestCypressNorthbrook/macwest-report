"use client";

import { useState, useEffect } from "react";
import { Building2, Bell, User, Printer } from "lucide-react";
import { DashboardModel } from "@/types/dashboard";

interface HeaderProps {
  meta: DashboardModel["meta"];
  periods: string[];
  selectedPeriod: string;
  onChangePeriod: (p: string) => void;
}

export function Header({ meta, periods, selectedPeriod, onChangePeriod }: HeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="mb-5 h-16 rounded-2xl border border-slate-200 bg-white animate-pulse" />
    );
  }

  return (
    <header className="mb-5 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 md:px-5 md:py-3 shadow-sm">

      <div className="flex items-center justify-between lg:justify-start gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-200">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className="sm:block">
            <p className="text-sm font-bold tracking-tight text-slate-900 leading-tight">{meta.company}</p>
            <p className="text-[11px] text-slate-400 leading-tight">Board Financial Report</p>
          </div>
        </div>

        {/* Right controls (Mobile inline) */}
        <div className="flex lg:hidden items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm">
            <span className="text-[10px] font-bold text-slate-600">{meta.currency}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block h-8 w-px bg-slate-200 shrink-0" />

      {/* ── Central period selector ── */}
      <div className="flex-1 flex items-center justify-center overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 min-w-max">
          {periods.map((p) => {
            const active = p === selectedPeriod;
            return (
              <button
                key={p}
                onClick={() => onChangePeriod(p)}
                className={`relative px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-[#1B3A5C] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                }`}
              >
                {p}
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-blue-400 opacity-60" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block h-8 w-px bg-slate-200 shrink-0" />

      {/* Right controls (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        {/* Currency badge */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-600">{meta.currency}</span>
        </div>

        {/* Print / Export */}
        <button
          onClick={() => window.print()}
          title="Print / Export PDF"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors shadow-sm"
        >
          <Printer className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold hidden sm:inline">Export</span>
        </button>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <User className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
