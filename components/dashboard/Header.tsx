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

  if (!mounted) return null;

  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumbs */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors mb-4">
            <span className="rotate-180">➜</span> Back to projects
          </button>
          
          <h1 className="text-2xl font-bold text-slate-900">{meta.company} Management Report</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-slate-500">{meta.periodEnding} (Q1 2026)</p>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => onChangePeriod(p)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    p === selectedPeriod 
                      ? "bg-slate-900 text-white" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Printer className="h-4 w-4" />
            Edit project
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#941c1c] text-sm font-semibold text-white hover:bg-[#941c1c]/90 transition-colors shadow-sm">
            <span>+</span> Create Invoice
          </button>
        </div>
      </div>
    </header>
  );
}
