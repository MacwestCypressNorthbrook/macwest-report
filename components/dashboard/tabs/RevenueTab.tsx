"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { AlertTriangle, ShieldAlert, Users, TrendingUp } from "lucide-react";
import { formatCompact, formatMoney, formatPercent } from "@/lib/dashboard/format";
import { CfoCommentary, SectionNote } from "@/components/dashboard/CfoCommentary";

const PALETTE = ["#1B3A5C", "#2563eb", "#059669", "#7c3aed", "#d97706", "#dc2626", "#64748b"];
const C = { navy: "#1B3A5C", emerald: "#059669", blue: "#2563eb", purple: "#7c3aed", amber: "#d97706", red: "#dc2626" };

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm min-w-[160px]">
      <p className="font-semibold text-slate-900 mb-1">{label || payload[0]?.name}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 py-0.5">
          <span className="text-slate-500">{e.name || "Revenue"}</span>
          <span className="font-semibold text-slate-900">{formatCompact(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

const DonutCenterLabel = ({ cx, cy, totalRevenue }: { cx: number; cy: number; totalRevenue: number }) => (
  <g>
    <text x={cx} y={cy - 10} textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="700">
      {formatCompact(totalRevenue)}
    </text>
    <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="11">
      Q1 2026
    </text>
    <text x={cx} y={cy + 26} textAnchor="middle" fill="#94a3b8" fontSize="10">
      Total Revenue
    </text>
  </g>
);

export function RevenueTab({
  customers,
  segments,
  concentration,
}: {
  customers: { name: string; value: number }[];
  segments: { name: string; q1: number; fy25: number }[];
  concentration: number;
}) {
  const totalRevenue = customers.reduce((s, c) => s + c.value, 0);
  const sorted = [...customers].sort((a, b) => b.value - a.value).map((c, i) => ({
    ...c,
    pct: c.value / totalRevenue,
    color: PALETTE[i % PALETTE.length],
  }));

  const topCustomer = sorted[0];
  const top3Share = sorted.slice(0, 3).reduce((s, c) => s + c.pct, 0);

  const segData = segments
    .filter((s) => s.q1 > 0)
    .sort((a, b) => b.q1 - a.q1)
    .map((s) => ({ name: s.name, "Q1 2026": s.q1 }));

  const DonutPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm">
        <p className="font-semibold text-slate-900">{d.name}</p>
        <p className="text-slate-500 mt-0.5">{formatCompact(d.value)}</p>
        <p className="text-slate-400 text-xs">{formatPercent(d.value / totalRevenue)} of total</p>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <CfoCommentary
        tone="warning"
        title="Revenue Deep Dive — Concentration Risk Requires Urgent Board Attention"
        body={
          <>
            Total Q1 2026 revenue of <strong>GHS 17.04M</strong> is derived from six active clients. However, <strong>De Simone Ltd accounts for GHS 15.63M — 91.7% of total revenue</strong>. This level of single-client dependency represents a material and elevated business risk. Any disruption, renegotiation or termination of the De Simone contract would have an immediate and severe impact on revenue and profitability. The Board should formally acknowledge this risk and direct management to present a client diversification strategy within the next quarter. The remaining five clients collectively contribute only GHS 1.41M (8.3%), highlighting that no secondary revenue pillar currently exists. Service line diversification across Logistics Support, Technical Works and Manpower Services is positive structurally, but effective diversification requires a broader active client base.
          </>
        }
      />

      {/* ── Concentration Risk Alert ── */}
      {concentration > 0.85 && (
        <div className="flex items-start gap-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
          <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">High Customer Concentration Risk</p>
            <p className="text-sm text-amber-800 mt-1">
              <strong>{topCustomer.name}</strong> accounts for <strong>{formatPercent(topCustomer.pct)}</strong> of Q1 2026 revenue ({formatCompact(topCustomer.value)}).
              Revenue dependency on a single client significantly elevates business continuity risk. Diversification strategy is recommended.
            </p>
          </div>
        </div>
      )}

      {/* ── Row 1: Donut + Horizontal Bar ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Donut chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Revenue by Customer</h3>
            <SectionNote>The donut chart visualises the revenue share by client. The dominant segment (De Simone Ltd) consuming over 90% of the chart illustrates the concentration risk in a single, stark visual. A healthy revenue donut would show no single segment exceeding 30–40% of the total.</SectionNote>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sorted}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={110}
                  paddingAngle={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {sorted.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<DonutPieTooltip />} />
                {/* Center label hack via custom shape - use foreignObject or just the static SVG text */}
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-1 space-y-1.5">
            {sorted.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-slate-600">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 tabular-nums">{formatCompact(c.value)}</span>
                  <span className="text-slate-400 text-xs w-12 text-right">{formatPercent(c.pct)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Revenue Ranking</h3>
            <SectionNote>Clients ranked by Q1 2026 revenue contribution. Progress bars show each client's share of total revenue. The clear dominance of De Simone Ltd underscores the need to grow the remaining five client relationships and actively pursue new accounts to build a sustainable revenue base.</SectionNote>
          </div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#475569" }} tickLine={false} axisLine={false} width={110} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" name="Revenue" radius={[0, 5, 5, 0]} barSize={20}>
                  {sorted.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Progress bars with % share */}
          <div className="mt-3 space-y-2">
            {sorted.slice(0, 4).map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-500 truncate max-w-[140px]">{c.name}</span>
                  <span className="font-semibold text-slate-700">{formatPercent(c.pct)}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${c.pct * 100}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Segment Chart + Risk Metrics ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Segment bar */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Service Line / Segment Breakdown</h3>
            <SectionNote>Contracted value by service line for Q1 2026. Logistics Support represents the largest contracted segment at GHS 38.5M, followed by Technical Works at GHS 11.6M. Note that contracted value differs from invoiced/recognised revenue — actual Q1 revenue of GHS 17.04M reflects the portion executed and billed during the quarter.</SectionNote>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} angle={-12} textAnchor="end" height={48} />
                <YAxis tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={48} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="Q1 2026" fill={C.navy} radius={[5, 5, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Concentration risk metrics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Concentration Risk</h3>
            <p className="text-sm text-slate-400 mt-0.5">Client dependency metrics</p>
          </div>

          {[
            { label: "Top Client Share", value: formatPercent(topCustomer.pct), sub: topCustomer.name, status: topCustomer.pct > 0.8 ? "danger" : "warn", icon: <AlertTriangle className="h-4 w-4" /> },
            { label: "Top 3 Clients Share", value: formatPercent(top3Share), sub: "Combined", status: top3Share > 0.9 ? "warn" : "good", icon: <Users className="h-4 w-4" /> },
            { label: "Active Clients", value: String(customers.filter((c) => c.value > 0).length), sub: "Q1 2026", status: "good", icon: <TrendingUp className="h-4 w-4" /> },
          ].map(({ label, value, sub, status, icon }) => (
            <div
              key={label}
              className={`insight-card ${status === "danger" ? "insight-card-danger" : status === "warn" ? "insight-card-warn" : "insight-card-good"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
                  <p className="text-xs text-slate-400">{sub}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${status === "danger" ? "bg-red-50 text-red-600" : status === "warn" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                  {icon}
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 mt-auto">
            <p className="text-xs text-slate-500 font-medium mb-1">Benchmark</p>
            <p className="text-xs text-slate-600">Healthy: Top client &lt; 40% of revenue. Current: <span className="font-semibold text-red-600">{formatPercent(topCustomer.pct)}</span> — immediate diversification required.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
