"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { formatCompact, formatPercent } from "@/lib/dashboard/format";

const PALETTE = ["#941c1c", "#2f80ed", "#f2994a", "#7c3aed"];

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-900">{d.name}</p>
      <p className="text-slate-500 mt-0.5">{formatCompact(d.value)}</p>
    </div>
  );
}

export function RevenueTab({
  customers,
  concentration,
}: {
  customers: { name: string; value: number }[];
  concentration: number;
}) {
  const total = customers.reduce((s, c) => s + c.value, 0);
  const sorted = [...customers].sort((a, b) => b.value - a.value).map((c, i) => ({
    ...c,
    pct: c.value / total,
    color: PALETTE[i % PALETTE.length],
  }));

  const top = sorted[0];

  return (
    <div className="space-y-5">
      {concentration > 0.5 && (
        <div className="flex items-start gap-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">High Customer Concentration</p>
            <p className="text-sm text-amber-800 mt-1">
              <strong>{top.name}</strong> accounts for <strong>{formatPercent(top.pct)}</strong> of H1 2026 revenue ({formatCompact(top.value)}).
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-bold text-slate-900 mb-3">Revenue by Customer</h2>
          <div style={{ height: 240, minHeight: 240 }}>
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
              <PieChart>
                <Pie
                  data={sorted}
                  dataKey="value"
                  nameKey="name"
                  cx="50%" cy="50%"
                  innerRadius={65} outerRadius={100}
                  paddingAngle={2}
                  startAngle={90} endAngle={-270}
                >
                  {sorted.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {sorted.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-slate-600">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 tabular-nums">{formatCompact(c.value)}</span>
                  <span className="text-slate-400 text-xs w-10 text-right">{formatPercent(c.pct)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-base font-bold text-slate-900 mb-3">Revenue Share Breakdown</h2>
          <div className="space-y-4">
            {sorted.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">{c.name}</span>
                  <span className="font-semibold text-slate-900">{formatPercent(c.pct)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${c.pct * 100}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs text-slate-600">
              <strong className="text-slate-900">Concentration Risk:</strong> Top client share of {formatPercent(top.pct)} exceeds the 40% diversification benchmark. The company is actively onboarding new projects to reduce dependency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
