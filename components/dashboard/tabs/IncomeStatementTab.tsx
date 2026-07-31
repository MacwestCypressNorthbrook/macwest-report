"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { formatCompact } from "@/lib/dashboard/format";

const C = { navy: "#1a1d1f", teal: "#0d9488", red: "#eb5757", blue: "#2f80ed" };

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-100">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-slate-500">{e.name}</span>
          <span className="font-medium text-slate-900">{formatCompact(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function IncomeStatementTab({
  periods,
  revenue,
  grossProfit,
  operatingIncome,
  ebitda,
  netMargin,
  grossMargin,
  operatingMargin,
}: {
  periods: string[];
  revenue: number[];
  grossProfit: number[];
  operatingIncome: number[];
  ebitda: number[];
  netMargin: number[];
  grossMargin: number[];
  operatingMargin: number[];
}) {
  const data = periods.map((p, i) => ({
    period: p,
    Revenue: revenue[i] ?? 0,
    "Gross Profit": grossProfit[i] ?? 0,
    EBITDA: ebitda[i] ?? 0,
  }));

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-bold text-slate-900 mb-4">Revenue & Profit Trends</h2>
        <div style={{ height: 280, minHeight: 280 }}>
          <ResponsiveContainer width="100%" height="100%" debounce={200}>
            <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={50} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="Revenue" radius={[4, 4, 0, 0]} barSize={24}>
                {data.map((_, i) => <Cell key={i} fill={i === 0 ? C.navy : "#cbd5e1"} />)}
              </Bar>
              <Bar dataKey="Gross Profit" radius={[4, 4, 0, 0]} barSize={24}>
                {data.map((d, i) => <Cell key={i} fill={d["Gross Profit"] >= 0 ? C.teal : C.red} />)}
              </Bar>
              <Bar dataKey="EBITDA" radius={[4, 4, 0, 0]} barSize={24}>
                {data.map((d, i) => <Cell key={i} fill={d["EBITDA"] >= 0 ? C.blue : C.red} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-bold text-slate-900 mb-3">Period Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Line Item</th>
                {periods.map((p) => <th key={p} className="text-right py-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Revenue", values: revenue },
                { label: "Gross Profit", values: grossProfit },
                { label: "EBITDA", values: ebitda },
                { label: "Operating Income", values: operatingIncome },
              ].map(({ label, values }) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-sm font-medium text-slate-700">{label}</td>
                  {values.map((v, i) => (
                    <td key={i} className={`text-right py-2 px-3 text-sm font-semibold tabular-nums ${i === 0 ? "text-slate-900" : "text-slate-500"}`}>
                      {formatCompact(v)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-slate-100 bg-slate-50">
                <td className="py-2 pr-4 text-sm font-medium text-slate-700">Gross Margin</td>
                {grossMargin.map((v, i) => (
                  <td key={i} className="text-right py-2 px-3 text-sm font-semibold tabular-nums">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      v >= 0.3 ? "bg-teal-50 text-teal-700" : v >= 0.15 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                    }`}>
                      {(v * 100).toFixed(1)}%
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-50">
                <td className="py-2 pr-4 text-sm font-medium text-slate-700">Net Margin</td>
                {netMargin.map((v, i) => (
                  <td key={i} className="text-right py-2 px-3 text-sm font-semibold tabular-nums">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      v >= 0.1 ? "bg-teal-50 text-teal-700" : v >= 0.05 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                    }`}>
                      {(v * 100).toFixed(1)}%
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
