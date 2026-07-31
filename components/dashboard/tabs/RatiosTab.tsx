"use client";

import { RatioModel } from "@/types/dashboard";
import { formatPercent, formatTimes } from "@/lib/dashboard/format";
import { CheckCircle, AlertCircle, XCircle, AlertTriangle } from "lucide-react";

type Status = "good" | "warn" | "bad";

const cfg = {
  good: { color: "#0d9488", bg: "bg-teal-50", text: "text-teal-700", label: "Healthy", Icon: CheckCircle },
  warn: { color: "#d97706", bg: "bg-amber-50", text: "text-amber-700", label: "Monitor", Icon: AlertCircle },
  bad:  { color: "#dc2626", bg: "bg-red-50", text: "text-red-700", label: "Below Benchmark", Icon: XCircle },
};

function getStatus(value: number, good: number, bad: number, higherIsBetter = true): Status {
  if (higherIsBetter) {
    if (value >= good) return "good";
    if (value >= bad) return "warn";
    return "bad";
  } else {
    if (value <= good) return "good";
    if (value <= bad) return "warn";
    return "bad";
  }
}

function Gauge({ label, formatted, status, benchmark, fill }: {
  label: string; formatted: string; status: Status; benchmark: string; fill: number;
}) {
  const c = cfg[status];
  const Icon = c.Icon;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
          <Icon className="h-3 w-3" />
          {c.label}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-3">{formatted}</p>
      <div className="relative">
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(Math.max(fill, 0), 100)}%`, background: c.color }} />
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2">Benchmark: {benchmark}</p>
    </div>
  );
}

export function RatiosTab({ ratios }: { ratios: RatioModel }) {
  const negEq = ratios.debtToEquity < 0;
  const deStatus: Status = negEq ? "bad" : getStatus(ratios.debtToEquity, 2.0, 3.5, false);

  const items = [
    { label: "Current Ratio", value: ratios.currentRatio, fmt: formatTimes, status: getStatus(ratios.currentRatio, 1.5, 1.0), benchmark: "> 1.5x", fill: (ratios.currentRatio / 3) * 100 },
    { label: "Quick Ratio", value: ratios.quickRatio, fmt: formatTimes, status: getStatus(ratios.quickRatio, 1.0, 0.5), benchmark: "> 1.0x", fill: (ratios.quickRatio / 2) * 100 },
    { label: "Debt-to-Equity", value: ratios.debtToEquity, fmt: formatTimes, status: deStatus, benchmark: negEq ? "N/A (neg. equity)" : "< 2.0x", fill: negEq ? 0 : Math.max(100 - (ratios.debtToEquity / 8) * 100, 0) },
    { label: "Return on Equity", value: ratios.roe, fmt: formatPercent, status: getStatus(ratios.roe, 0.15, 0.08), benchmark: "> 15%", fill: Math.min(ratios.roe * 100, 100) },
    { label: "Return on Assets", value: ratios.roa, fmt: formatPercent, status: getStatus(ratios.roa, 0.05, 0.02), benchmark: "> 5%", fill: Math.min(ratios.roa * 100, 100) },
    { label: "Net Margin", value: ratios.netMarginPAT, fmt: formatPercent, status: getStatus(ratios.netMarginPAT, 0.1, 0.05), benchmark: "> 10%", fill: Math.min(ratios.netMarginPAT * 100, 100) },
  ];

  return (
    <div>
      {negEq && (
        <div className="flex items-start gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-4 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900">
            <strong>Debt-to-Equity</strong> ({formatTimes(ratios.debtToEquity)}) is distorted by negative equity. 
            The company carries <strong>GH¢ 18.18M in borrowings</strong> against a negative equity base. 
            Focus on the absolute debt level and the urgent need for recapitalisation rather than this ratio.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g) => (
          <Gauge key={g.label} label={g.label} formatted={g.fmt(g.value)} status={g.status} benchmark={g.benchmark} fill={g.fill} />
        ))}
      </div>

      <div className="mt-4 bg-red-50 rounded-xl border border-red-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 leading-relaxed">
            <strong className="text-red-900">Financial Health Assessment:</strong> All six key ratios are below benchmark. 
            The H1 2026 net loss of <strong>GH¢ 12.53M</strong> and negative equity of <strong>GH¢ 6.84M</strong> indicate severe financial distress. 
            Liquidity is critically constrained (Current Ratio 0.58x vs 1.5x target). The company requires immediate 
            intervention on cost recovery, debt restructuring, and capital injection.
          </p>
        </div>
      </div>
    </div>
  );
}
