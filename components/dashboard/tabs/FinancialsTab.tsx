"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  BarChart,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from "recharts";
import { formatCompact, formatMoney, formatPercent, formatYAxisMoney } from "@/lib/dashboard/format";
import { FileText, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CfoCommentary, SectionNote } from "@/components/dashboard/CfoCommentary";

const C = {
  navy: "#1B3A5C",
  maroon: "#941c1c",
  blue: "#2563eb",
  purple: "#7c3aed",
  amber: "#d97706",
  red: "#dc2626",
  teal: "#0d9488",
  emerald: "#0d9488",
  slate: "#94a3b8",
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm min-w-[180px]">
      <p className="font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-100">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: e.fill || e.color }} />
            <span className="text-slate-500">{e.name}</span>
          </div>
          <span className="font-medium text-slate-900">{formatCompact(Math.abs(e.value))}</span>
        </div>
      ))}
    </div>
  );
}

export function FinancialsTab({
  periods,
  revenue,
  directCosts,
  grossProfit,
  opex,
  operatingIncome,
  pbt,
  pat,
}: {
  periods: string[];
  revenue: number[];
  directCosts: number[];
  grossProfit: number[];
  opex: number[];
  operatingIncome: number[];
  pbt: number[];
  pat: number[];
}) {
  /* ── Waterfall data for Q1 2026 ── */
  type WFEntry = { name: string; start: number; value: number; color: string; isTotal: boolean };
  const q1R = revenue[0] ?? 0;
  const q1DC = directCosts[0] ?? 0;
  const q1GP = grossProfit[0] ?? 0;
  const q1Opex = opex[0] ?? 0;
  const q1Op = operatingIncome[0] ?? 0;
  const q1PBT = pbt[0] ?? 0;

  const wf: WFEntry[] = [
    { name: "Revenue", start: 0, value: q1R, color: C.navy, isTotal: false },
    { name: "Direct Costs", start: q1GP, value: q1DC, color: C.red, isTotal: false },
    { name: "Gross Profit", start: 0, value: q1GP, color: C.teal, isTotal: true },
    { name: "OPEX", start: q1Op, value: q1Opex, color: C.amber, isTotal: false },
    { name: "Op. Income", start: 0, value: q1Op, color: C.blue, isTotal: true },
    { name: "Net PBT", start: 0, value: q1PBT, color: C.purple, isTotal: true },
  ];

  /* ── Grouped bar chart ── */
  const multiData = periods.map((p, i) => ({
    period: p,
    Revenue: revenue[i] ?? 0,
    "Gross Profit": grossProfit[i] ?? 0,
    "Op. Income": operatingIncome[i] ?? 0,
    PBT: pbt[i] ?? 0,
  }));

  /* ── Cost structure donut for Q1 ── */
  const donutData = [
    { name: "Direct Costs", value: q1DC, color: C.red },
    { name: "OPEX", value: q1Opex, color: C.amber },
    { name: "Operating Income", value: q1Op, color: C.teal },
  ];

  const totalRevQ1 = q1R;

  /* ── P&L table rows ── */
  const pnlRows = [
    { label: "Revenue", values: revenue, isHeading: true, color: C.navy, indent: 0 },
    { label: "Less: Direct Costs", values: directCosts.map((x) => -Math.abs(x)), isHeading: false, color: C.red, indent: 1 },
    { label: "Gross Profit", values: grossProfit, isHeading: true, color: C.teal, indent: 0 },
    { label: "Less: Operating Expenses", values: opex.map((x) => -Math.abs(x)), isHeading: false, color: C.amber, indent: 1 },
    { label: "Operating Income", values: operatingIncome, isHeading: true, color: C.blue, indent: 0 },
    { label: "Net Profit Before Tax", values: pbt, isHeading: true, color: C.purple, indent: 0 },
    { label: "Net Profit After Tax", values: pat, isHeading: true, color: C.purple, indent: 0 },
  ];

  const DonutTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm">
        <p className="font-semibold text-slate-900">{d.name}</p>
        <p className="text-slate-500">{formatCompact(d.value)} · {formatPercent(d.value / totalRevQ1)}</p>
      </div>
    );
  };

  const renderDonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <CfoCommentary
        tone="neutral"
        title="P&L Analysis — Revenue to Net Profit Decomposition"
        body={
          <>
            For the quarter ended 31 March 2026, the Company generated revenue of <strong>GHS 17.04M</strong>. Direct costs of <strong>GHS 10.57M</strong> (62.0% of revenue) produced a Gross Profit of GHS 6.47M, representing a margin of 39.5% — a significant improvement from 18.6% in FY2025. This margin expansion is attributable to higher-value service delivery and improved cost recovery on the primary contract. Operating expenditure of <strong>GHS 2.05M</strong> (12.0% of revenue) is well-controlled; the OPEX ratio compares favourably to 14.9% in FY2025, reflecting operational efficiency gains as the business scales. Net Profit Before Tax of <strong>GHS 4.84M</strong> represents a 99.9% improvement over FY2025 PBT of GHS 2.42M. The P&L waterfall below illustrates the step-by-step conversion of revenue into profit.
          </>
        }
      />

      {/* ── Row 1: Waterfall + Donut ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Waterfall chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">{periods[0] ?? "Current Period"} — P&L Cascade</h3>
            <SectionNote>Each bar represents a P&L line item, cascading from total revenue down to Net Profit Before Tax. Red bars (Direct Costs, OPEX) represent deductions; the remaining coloured bars show the cumulative profit position at each stage of the income statement.</SectionNote>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wf} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatYAxisMoney} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                {/* Invisible spacer bar */}
                <Bar dataKey="start" stackId="wf" fill="transparent" stroke="none" />
                {/* Value bar */}
                <Bar dataKey="value" stackId="wf" radius={[4, 4, 0, 0]}>
                  {wf.map((entry, i) => (
                    <Cell key={`wf-${i}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost structure donut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Revenue Allocation</h3>
            <SectionNote>Of every GHS 1.00 of revenue earned in {periods[0] ?? "the selected period"}: GHS 0.62 covers direct delivery costs, GHS 0.12 funds operating overheads, and GHS 0.27 converts to operating profit. This structure reflects a healthy conversion ratio for a services business.</SectionNote>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={renderDonutLabel}
                >
                  {donutData.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{formatCompact(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Multi-period grouped bars ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">Multi-Period Profit Comparison</h3>
          <SectionNote>This chart tracks the four headline P&L metrics across all reporting periods. The narrowing gap between Revenue and Gross Profit (i.e. rising gross margin) combined with growing Operating Income and PBT bars confirms that profitability is compounding with scale — a key indicator of a maturing, well-managed business.</SectionNote>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={formatYAxisMoney} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} iconType="circle" iconSize={8} />
              <Bar dataKey="Revenue" fill={C.navy} radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="Gross Profit" fill={C.teal} radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="Op. Income" fill={C.blue} radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="PBT" fill={C.purple} radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Full P&L Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-900">Full Profit & Loss Statement</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th className="w-56">Line Item</th>
                {periods.map((p) => <th key={p} className="text-right">{p}</th>)}
                <th className="text-right">YoY (Q1 vs FY25)</th>
              </tr>
            </thead>
            <tbody>
              {pnlRows.map(({ label, values, isHeading, color, indent }) => {
                const yoy = values[1] !== 0 ? (values[0] - values[1]) / Math.abs(values[1]) : 0;
                const yoyUp = yoy > 0;
                return (
                  <tr key={label} className={isHeading ? "" : "bg-slate-50/50"}>
                    <td className={`${isHeading ? "font-semibold text-slate-900" : "text-slate-500"} ${indent ? "pl-8" : ""}`}>{label}</td>
                    {values.map((v, i) => (
                      <td key={i} className={`text-right tabular-nums ${isHeading ? "font-semibold text-slate-900" : "text-slate-600"} ${v < 0 ? "text-red-600" : ""}`}>
                        {formatMoney(v)}
                      </td>
                    ))}
                    <td className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${yoyUp ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"}`}>
                        {yoyUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {yoyUp ? "+" : ""}{formatPercent(yoy)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="tbl-accent">
                <td>Gross Margin</td>
                {grossProfit.map((gp, i) => (
                  <td key={i} className="text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${revenue[i] && gp / revenue[i] >= 0.3 ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}>
                      {revenue[i] ? formatPercent(gp / revenue[i]) : "—"}
                    </span>
                  </td>
                ))}
                <td />
              </tr>
              <tr className="tbl-accent">
                <td>Operating Margin</td>
                {operatingIncome.map((op, i) => (
                  <td key={i} className="text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${revenue[i] && op / revenue[i] >= 0.15 ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}>
                      {revenue[i] ? formatPercent(op / revenue[i]) : "—"}
                    </span>
                  </td>
                ))}
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
