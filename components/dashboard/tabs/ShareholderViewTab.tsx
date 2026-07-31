"use client";

import { formatPercent, formatTimes, formatCompact } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from "lucide-react";

const C = { navy: "#1B3A5C", teal: "#0d9488", blue: "#2563eb", amber: "#d97706", red: "#dc2626" };

function ReturnCard({ label, value, formatted, description, icon: Icon, color, bg, status }: {
  label: string; value: number; formatted: string; description: string; icon: any; color: string; bg: string; status?: "good" | "bad";
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${status === "bad" ? "border-red-200 bg-red-50" : "border-slate-200"}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: bg }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mt-3">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${status === "bad" ? "text-red-700" : "text-slate-900"}`}>{formatted}</p>
      <p className="text-xs text-slate-500 mt-2">{description}</p>
    </div>
  );
}

function GrowthPill({ label, change }: { label: string; change: number }) {
  const up = change > 0;
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        up ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
      }`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {formatPercent(Math.abs(change))}
      </span>
    </div>
  );
}

export function ShareholderViewTab({ data }: {
  data: {
    revenueGrowth: number; pbtGrowth: number; equityGrowth: number; ebitdaGrowth: number;
    roa: number; roe: number; debtToEquity: number; equityRatio: number;
  };
}) {
  const negEq = data.debtToEquity < 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-gradient-to-br from-red-700 to-red-900 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-red-300">Q2 2026 — Distressed</p>
            <h2 className="text-xl font-bold mt-1">MacWest — Shareholder Value Report</h2>
            <p className="text-red-300 text-sm mt-1">Period ending 30 June 2026 — all metrics below warning thresholds</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <AlertTriangle className="h-8 w-8 text-red-300" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
          <div>
            <p className="text-[10px] text-red-300">Return on Equity</p>
            <p className="text-lg font-bold text-white mt-0.5">{formatPercent(data.roe)}</p>
          </div>
          <div>
            <p className="text-[10px] text-red-300">Return on Assets</p>
            <p className="text-lg font-bold text-white mt-0.5">{formatPercent(data.roa)}</p>
          </div>
          <div>
            <p className="text-[10px] text-red-300">Debt-to-Equity</p>
            <p className="text-lg font-bold text-white mt-0.5">{formatTimes(data.debtToEquity)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ReturnCard
          label="Return on Equity"
          value={data.roe} formatted={formatPercent(data.roe)}
          description="Net profit divided by total equity. Negative due to H1 net loss of GH¢ 12.53M and negative equity base."
          icon={TrendingDown} color={C.red} bg="#FEF2F2" status="bad"
        />
        <ReturnCard
          label="Return on Assets"
          value={data.roa} formatted={formatPercent(data.roa)}
          description="Net profit divided by total assets. Reflects the company's inability to generate positive returns from its asset base."
          icon={BarChart3} color={C.red} bg="#FEF2F2" status="bad"
        />
        <ReturnCard
          label="Debt-to-Equity"
          value={data.debtToEquity} formatted={formatTimes(data.debtToEquity)}
          description={negEq ? "Meaningless ratio — equity is negative. Borrowings of GH¢ 18.18M exceed total equity by 266%." : "Within manageable range"}
          icon={AlertTriangle} color={C.amber} bg="#FFFBEB" status="bad"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Growth vs Prior Period</h2>
        <p className="text-xs text-slate-400 mb-3">Comparing Q2 2026 against Q1 2026</p>
        <GrowthPill label="Revenue" change={data.revenueGrowth} />
        <GrowthPill label="EBITDA" change={data.ebitdaGrowth} />
        <GrowthPill label="PBT" change={data.pbtGrowth} />
        <GrowthPill label="Equity" change={data.equityGrowth} />
      </div>
    </div>
  );
}
