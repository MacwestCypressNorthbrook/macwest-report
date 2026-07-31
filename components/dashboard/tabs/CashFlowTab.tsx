"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatCompact } from "@/lib/dashboard/format";
import { RatioModel } from "@/types/dashboard";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const C = { teal: "#0d9488", red: "#dc2626", amber: "#f2994a" };

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-100">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 py-0.5">
          <span className="text-slate-500">{e.name}</span>
          <span className="font-medium text-slate-900">{formatCompact(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

function MetricBox({ label, value, status, note }: { label: string; value: string; status: "good" | "warn" | "bad"; note?: string }) {
  const colors = {
    good: "bg-teal-50 border-teal-200 text-teal-700",
    warn: "bg-amber-50 border-amber-200 text-amber-700",
    bad: "bg-red-50 border-red-200 text-red-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[status]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
      {note && <p className="text-xs mt-1 opacity-80">{note}</p>}
    </div>
  );
}

export function CashFlowTab({
  periods,
  cashAtEnd,
  ratios,
}: {
  periods: string[];
  cashAtEnd: number[];
  ratios: RatioModel;
}) {
  const data = periods.map((p, i) => ({
    period: p,
    "Cash & Bank": cashAtEnd[i] ?? 0,
  }));

  const latest = cashAtEnd[0] ?? 0;
  const prev = cashAtEnd[1] ?? 0;
  const change = latest - prev;
  const up = change > 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricBox label="Cash & Bank" value={formatCompact(latest)} status={latest > 500000 ? "warn" : "bad"} note={latest < 1000000 ? "Critical — less than 1 month operating runway" : undefined} />
        <MetricBox label="DSO" value={`${ratios.dso.toFixed(0)} days`} status={ratios.dso <= 45 ? "good" : ratios.dso <= 75 ? "warn" : "bad"} note="Days to collect from clients" />
        <MetricBox label="Cash Conversion Cycle" value={`${ratios.ccc.toFixed(0)} days`} status={ratios.ccc < 30 ? "good" : ratios.ccc < 60 ? "warn" : "bad"} note="Days cash tied up in operations" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Cash Position Trend</h2>
            <p className="text-xs text-slate-400 mt-0.5">End-of-period cash & bank balances</p>
          </div>
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            up ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
          }`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatCompact(Math.abs(change))}
          </span>
        </div>

        <div style={{ height: 260, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%" debounce={200}>
            <AreaChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.teal} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={50} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Area type="monotone" dataKey="Cash & Bank" stroke={change < 0 ? C.red : C.teal} fill="url(#cashGrad)" strokeWidth={2.5} dot={{ r: 4, fill: change < 0 ? C.red : C.teal, stroke: "#fff", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900 text-sm">Cash Position Alert</p>
            <p className="text-xs text-red-800 mt-1 leading-relaxed">
              Cash dropped from GH¢ 5.76M at Q1 2026 to GH¢ 0.83M at H1 2026 — an 85.5% burn in 3 months. 
              Borrowings surged to GH¢ 18.18M to cover operations. At this burn rate, the company has 
              less than 2 months of cash runway without additional financing or a significant improvement 
              in collections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
