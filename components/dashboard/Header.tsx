"use client";

import { useState, useEffect } from "react";
import { Building2, Bell, User, ChevronDown } from "lucide-react";
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
    <header className="mb-5 flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">

      {/* Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-200">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold tracking-tight text-slate-900 leading-tight">{meta.company}</p>
          <p className="text-[11px] text-slate-400 leading-tight">Board Financial Report</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-slate-200 shrink-0" />

      {/* ── Central period selector ── */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          {periods.map((p) => {
            const active = p === selectedPeriod;
            return (
              <button
                key={p}
                onClick={() => onChangePeriod(p)}
                className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
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
      <div className="h-8 w-px bg-slate-200 shrink-0" />

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Currency badge */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-600">{meta.currency}</span>
        </div>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
          <Bell className="h-3.5 w-3.5" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
          <User className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
