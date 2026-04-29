"use client";

import { Calendar, RotateCcw } from "lucide-react";

interface PeriodFilterBarProps {
  pnlPeriods: string[];
  bsPeriods: string[];
  activePnl: string[];
  activeBs: string[];
  onTogglePnl: (period: string) => void;
  onToggleBs: (period: string) => void;
  onResetAll: () => void;
}

function PeriodChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 select-none ${
        active
          ? "bg-[#1B3A5C] text-white shadow-sm"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
      }`}
    >
      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-white/70 shrink-0" />
      )}
      {label}
    </button>
  );
}

export function PeriodFilterBar({
  pnlPeriods,
  bsPeriods,
  activePnl,
  activeBs,
  onTogglePnl,
  onToggleBs,
  onResetAll,
}: PeriodFilterBarProps) {
  const allPnlActive = activePnl.length === pnlPeriods.length;
  const allBsActive = activeBs.length === bsPeriods.length;
  const isDefault = allPnlActive && allBsActive;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 shrink-0">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Period Filter
        </span>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-slate-200 shrink-0" />

      {/* P&L periods */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mr-1">
          P&amp;L
        </span>
        {pnlPeriods.map((p) => (
          <PeriodChip
            key={p}
            label={p}
            active={activePnl.includes(p)}
            onClick={() => onTogglePnl(p)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-slate-200 shrink-0" />

      {/* Balance Sheet periods */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mr-1">
          Balance Sheet
        </span>
        {bsPeriods.map((p) => (
          <PeriodChip
            key={p}
            label={p}
            active={activeBs.includes(p)}
            onClick={() => onToggleBs(p)}
          />
        ))}
      </div>

      {/* Reset */}
      {!isDefault && (
        <>
          <div className="h-5 w-px bg-slate-200 shrink-0" />
          <button
            onClick={onResetAll}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </>
      )}

      {/* Active filter summary */}
      <div className="ml-auto shrink-0 text-[10px] text-slate-400 hidden sm:block">
        Showing{" "}
        <strong className="text-slate-600">
          {activePnl.length} of {pnlPeriods.length}
        </strong>{" "}
        P&L ·{" "}
        <strong className="text-slate-600">
          {activeBs.length} of {bsPeriods.length}
        </strong>{" "}
        BS periods
      </div>
    </div>
  );
}
