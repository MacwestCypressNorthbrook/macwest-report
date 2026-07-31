"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { formatCompact, formatPercent } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

const C = { navy: "#1a1d1f", red: "#dc2626", teal: "#0d9488", amber: "#d97706" };

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

function MetricCard({ label, current, prior, currentLabel, color, negative }: {
  label: string; current: number; prior?: number; currentLabel: string; color: string; negative?: boolean;
}) {
  const hasComp = prior !== undefined;
  const change = hasComp && prior !== 0 ? (current - prior) / Math.abs(prior) : 0;
  const up = change > 0;
  return (
    <div className={`bg-white rounded-xl border p-5 ${negative ? "border-red-200 bg-red-50" : "border-slate-200"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${negative ? "text-red-700" : "text-slate-900"}`}>{formatCompact(current)}</p>
      <p className="text-xs text-slate-400 mt-0.5">{currentLabel}</p>
      {hasComp && (
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {formatPercent(Math.abs(change))}
          </span>
          <span className="text-xs text-slate-400">vs prior</span>
        </div>
      )}
    </div>
  );
}

export function BalanceSheetTab({
  periods,
  assets,
  liabilities,
  equity,
  currentAssets,
  nonCurrentAssets,
  cashAndBank,
  receivables,
}: {
  periods: string[];
  assets: number[];
  liabilities: number[];
  equity: number[];
  currentAssets: number[];
  nonCurrentAssets: number[];
  cashAndBank: number[];
  receivables: number[];
}) {
  const eq = equity[0] ?? 0;
  const negEq = eq < 0;
  const borrowings = 18181454;

  const data = periods.map((p, i) => ({
    period: p,
    Assets: assets[i] ?? 0,
    Liabilities: liabilities[i] ?? 0,
    Equity: equity[i] ?? 0,
  }));

  return (
    <div className="space-y-5">
      {negEq && (
        <div className="flex items-start gap-4 rounded-xl border-2 border-red-300 bg-red-50 p-5">
          <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Negative Equity — Technical Insolvency</p>
            <p className="text-sm text-red-800 mt-1 leading-relaxed">
              Total equity of <strong>{formatCompact(eq)}</strong> is negative as at H1 2026. Borrowings of 
              <strong> GH¢ 18.18M</strong> now represent 96% of total liabilities. The company's liabilities 
              exceed its assets — immediate recapitalisation or debt restructuring is required.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <MetricCard label="Total Assets" current={assets[0] ?? 0} prior={assets[1]} currentLabel={periods[0] ?? ""} color={C.navy} />
        <MetricCard label="Current Assets" current={currentAssets[0] ?? 0} prior={currentAssets[1]} currentLabel={periods[0] ?? ""} color={C.navy} />
        <MetricCard label="Cash & Bank" current={cashAndBank[0] ?? 0} prior={cashAndBank[1]} currentLabel={periods[0] ?? ""} color={C.navy} negative={cashAndBank[0] < 1000000} />
        <MetricCard label="Total Equity" current={eq} prior={equity[1]} currentLabel={periods[0] ?? ""} color={negEq ? C.red : C.teal} negative={negEq} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-bold text-slate-900 mb-4">Balance Sheet Structure</h2>
        <div style={{ height: 260, minHeight: 260 }}>
          <ResponsiveContainer width="100%" height="100%" debounce={200}>
            <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={50} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} iconType="circle" iconSize={8} />
              <Bar dataKey="Assets" radius={[4, 4, 0, 0]} barSize={24}>
                {data.map((d, i) => <Cell key={i} fill={d.Assets >= 0 ? C.navy : C.red} />)}
              </Bar>
              <Bar dataKey="Liabilities" radius={[4, 4, 0, 0]} barSize={24}>
                {data.map((d, i) => <Cell key={i} fill={d.Liabilities >= 0 ? C.red : C.teal} />)}
              </Bar>
              <Bar dataKey="Equity" radius={[4, 4, 0, 0]} barSize={24}>
                {data.map((d, i) => <Cell key={i} fill={d.Equity >= 0 ? C.teal : C.red} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Receivables</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCompact(receivables[0] ?? 0)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{periods[0] ?? ""}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Non-Current Assets</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCompact(nonCurrentAssets[0] ?? 0)}</p>
          <p className="text-xs text-slate-400 mt-0.5">{periods[0] ?? ""}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500">Borrowings</p>
          <p className="text-lg font-bold text-red-700 mt-1">{formatCompact(borrowings)}</p>
          <p className="text-xs text-red-500 mt-0.5">+3,457% vs FY 2025</p>
        </div>
        <div className={`rounded-xl border p-4 ${negEq ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Equity Ratio</p>
          <p className={`text-lg font-bold mt-1 ${negEq ? "text-red-700" : "text-slate-900"}`}>{(eq / (assets[0] ?? 1) * 100).toFixed(1)}%</p>
          <p className="text-xs text-slate-400 mt-0.5">Equity / Total Assets</p>
        </div>
      </div>
    </div>
  );
}
