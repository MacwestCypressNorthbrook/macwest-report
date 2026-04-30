"use client";

import { MarginCard } from "@/types/dashboard";
import { formatPercent } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown } from "lucide-react";

function MarginChip({ margin, index }: { margin: MarginCard; index: number }) {
  const delta = margin.current - margin.prior;
  const up = delta > 0;
  const changePpt = delta * 100;

  const colors = [
    { bar: "#0d9488", light: "#f0fdfa", text: "text-teal-700" },
    { bar: "#2563eb", light: "#eff6ff", text: "text-blue-700" },
    { bar: "#7c3aed", light: "#f5f3ff", text: "text-violet-700" },
  ];
  const c = colors[index % colors.length];

  return (
    <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm" style={{ animationDelay: `${index * 80}ms` }}>
      <p className="section-label">{margin.label}</p>
      <div className="mt-2 flex items-baseline gap-3">
        <span className="text-2xl font-bold text-slate-900">{formatPercent(margin.current)}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${up ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}{changePpt.toFixed(1)}pp
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(margin.current * 100, 100)}%`, background: c.bar }} />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">vs FY2025: {formatPercent(margin.prior)}</span>
        <span className={`text-xs font-semibold ${c.text}`} style={{ background: c.light, padding: "2px 8px", borderRadius: 999 }}>
          {formatPercent(margin.current)}
        </span>
      </div>
    </div>
  );
}

export function MarginBand({ margins }: { margins: MarginCard[] }) {
  return (
    <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Margin indicators">
      {margins.map((m, i) => <MarginChip key={m.label} margin={m} index={i} />)}
    </section>
  );
}
