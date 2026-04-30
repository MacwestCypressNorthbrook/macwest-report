"use client";

import { ChevronLeft, Printer, Download } from "lucide-react";
import { DashboardModel } from "@/types/dashboard";

interface HeaderProps {
  meta: DashboardModel["meta"];
  periods: string[];
  selectedPeriod: string;
  onChangePeriod: (p: string) => void;
}

export function Header({ meta, periods, selectedPeriod, onChangePeriod }: HeaderProps) {
  return (
    <header className="mb-8 no-print">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors mb-4">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to projects
          </button>

          <h1 className="text-2xl font-bold text-slate-900">{meta.company} Management Report</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <p className="text-sm text-slate-500">{meta.periodEnding} ({selectedPeriod})</p>
            <span className="text-slate-300 hidden sm:inline">|</span>
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
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            title="Print / Save as PDF"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#941c1c] text-sm font-semibold text-white hover:bg-[#941c1c]/90 transition-colors shadow-sm">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>
    </header>
  );
}
