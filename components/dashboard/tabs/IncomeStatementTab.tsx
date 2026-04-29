"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { formatCompact, formatPercent, formatYAxisMoney } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown, ArrowUpRight, Activity, DollarSign, Percent, BarChart3, Zap } from "lucide-react";
import { CfoCommentary, SectionNote } from "@/components/dashboard/CfoCommentary";

const C = {
  navy: "#1B3A5C",
  emerald: "#059669",
  blue: "#2563eb",
  purple: "#7c3aed",
  amber: "#d97706",
  red: "#dc2626",
  slate: "#64748b",
};

function ChartTooltipMoney({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm min-w-[180px]">
      <p className="font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-100">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: e.color }} />
            <span className="text-slate-500">{e.name}</span>
          </div>
          <span className="font-medium text-slate-900">
            {e.name.includes("%") || e.name.includes("Margin") ? `${Number(e.value).toFixed(1)}%` : formatCompact(e.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartTooltipPercent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm min-w-[180px]">
      <p className="font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-100">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: e.color }} />
            <span className="text-slate-500">{e.name}</span>
          </div>
          <span className="font-medium text-slate-900">{Number(e.value).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

interface SummaryPillProps {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

function SummaryPill({ label, value, change, hasComparison, compLabel, icon, color, bg }: SummaryPillProps & { hasComparison: boolean; compLabel: string }) {
  const up = change > 0;
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: bg }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-slate-900 truncate">{value}</p>
        {hasComparison && (
          <p className="text-[10px] text-slate-400 mt-0.5">vs {compLabel}</p>
        )}
      </div>
      {hasComparison ? (
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}{formatPercent(Math.abs(change))}
        </div>
      ) : (
        <span className="text-xs text-slate-300 font-medium">Selected period</span>
      )}
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
  const trendData = periods.map((p, i) => ({
    period: p,
    Revenue: revenue[i] ?? 0,
    "Gross Profit": grossProfit[i] ?? 0,
    "Operating Income": operatingIncome[i] ?? 0,
    "Gross Margin %": (grossMargin[i] ?? 0) * 100,
    "Net Margin %": (netMargin[i] ?? 0) * 100,
  }));

  const marginData = periods.map((p, i) => ({
    period: p,
    "Gross Margin %": (grossMargin[i] ?? 0) * 100,
    "Operating Margin %": (operatingMargin[i] ?? 0) * 100,
    "Net Margin %": (netMargin[i] ?? 0) * 100,
  }));

  const hasComp = periods.length >= 2;
  const curRev    = revenue[0] ?? 0;
  const priorRev  = revenue[1] ?? 0;
  const curGP     = grossProfit[0] ?? 0;
  const priorGP   = grossProfit[1] ?? 0;
  const curEBITDA = ebitda[0] ?? 0;
  const priorEBITDA = ebitda[1] ?? 0;
  const curMargin   = netMargin[0] ?? 0;
  const priorMargin = netMargin[1] ?? 0;
  const compLabel   = periods[1] ?? "";

  const safePct = (a: number, b: number) => b !== 0 ? (a - b) / Math.abs(b) : 0;

  const pills = [
    { label: "Revenue",      value: formatCompact(curRev),    change: safePct(curRev, priorRev),       icon: <DollarSign className="h-5 w-5" />, color: C.navy,    bg: "#EFF6FF" },
    { label: "Gross Profit", value: formatCompact(curGP),     change: safePct(curGP, priorGP),         icon: <TrendingUp className="h-5 w-5" />, color: C.emerald, bg: "#ECFDF5" },
    { label: "EBITDA",       value: formatCompact(curEBITDA), change: safePct(curEBITDA, priorEBITDA), icon: <Zap className="h-5 w-5" />,        color: C.blue,    bg: "#EFF6FF" },
    { label: "Net Margin",   value: formatPercent(curMargin), change: curMargin - priorMargin,         icon: <Percent className="h-5 w-5" />,    color: C.purple,  bg: "#F5F3FF" },
  ];

  return (
    <div className="space-y-6">
      {/* CFO Commentary */}
      <CfoCommentary
        tone="positive"
        title="Q1 2026 — Strong Operating Performance with Significant Margin Expansion"
        body={
          <>
            North-Brook delivered a solid first quarter, recording revenue of <strong>GHS 17.04M</strong> against a comparable full-year FY2025 base of GHS 58.5M. Annualised, the Q1 revenue run-rate of <strong>GHS 68.2M exceeds full-year FY2025</strong>, confirming accelerating momentum. Gross margin expanded materially from <strong>18.6% (FY2025) to 39.5% (Q1 2026)</strong> — a 20.9 percentage-point improvement — driven by improved contract pricing on the De Simone engagement and tighter direct cost management. EBITDA of <strong>GHS 5.25M</strong> (vs. GHS 1.89M in FY2025) represents a <strong>177.8% increase</strong>, demonstrating significant operating leverage. Net Profit Before Tax of GHS 4.84M represents a near-doubling versus FY2025 PBT. The business is tracking ahead of prior-year performance across all key profitability measures.
          </>
        }
      />

      {/* Executive summary pills */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pills.map((p) => (
          <SummaryPill key={p.label} {...p} hasComparison={hasComp} compLabel={compLabel} />
        ))}
      </div>

      {/* Revenue & Profit Bridge — Bar + Margin Line */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Revenue & Profit Bridge</h3>
            <SectionNote>Revenue and Gross Profit bars (left axis) illustrate absolute scale growth across periods. Gross Margin and Net Margin lines (right axis) track the quality of that growth — rising lines confirm that profitability is improving, not just revenue volume.</SectionNote>
          </div>
          <span className="badge badge-info">
            <Activity className="h-3 w-3" /> Trend
          </span>
        </div>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 8, right: 48, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.navy} />
                  <stop offset="100%" stopColor="#2a5080" />
                </linearGradient>
                <linearGradient id="gpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.emerald} />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tickFormatter={formatYAxisMoney} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={56} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 65]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={44} />
              <Tooltip content={<ChartTooltipMoney />} cursor={{ fill: "#f8fafc" }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} iconType="circle" iconSize={8} />
              <Bar yAxisId="left" dataKey="Revenue" fill="url(#revGrad)" radius={[5, 5, 0, 0]} barSize={28} />
              <Bar yAxisId="left" dataKey="Gross Profit" fill="url(#gpGrad)" radius={[5, 5, 0, 0]} barSize={28} />
              <Line yAxisId="right" type="monotone" dataKey="Gross Margin %" stroke={C.amber} strokeWidth={2.5} dot={{ r: 4, fill: C.amber, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="Net Margin %" stroke={C.purple} strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4, fill: C.purple, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Margin Progression + EBITDA trend */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Margin Progression</h3>
            <SectionNote>All three margin lines moving upward from FY2023 to Q1 2026 confirms that the business is converting revenue into profit more efficiently over time. The widening gap between Gross Margin and Net Margin reflects operating cost absorption — management's focus should be on sustaining this trajectory.</SectionNote>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marginData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <defs>
                  <linearGradient id="gmFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.emerald} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={C.emerald} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="omFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.blue} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="nmFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.purple} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={44} />
                <Tooltip content={<ChartTooltipPercent />} cursor={{ fill: "#f8fafc" }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="Gross Margin %" stroke={C.emerald} fill="url(#gmFill)" strokeWidth={2} dot={{ r: 4, fill: C.emerald, stroke: "#fff", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Operating Margin %" stroke={C.blue} fill="url(#omFill)" strokeWidth={2} dot={{ r: 4, fill: C.blue, stroke: "#fff", strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Net Margin %" stroke={C.purple} fill="url(#nmFill)" strokeWidth={2} dot={{ r: 4, fill: C.purple, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Period-by-Period summary table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Period Summary</h3>
            <SectionNote>Period-over-period comparison of core income metrics. Colour coding indicates performance vs. standard thresholds — green denotes margins meeting or exceeding acceptable benchmarks; amber signals areas requiring management attention.</SectionNote>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Metric</th>
                  {periods.map((p) => <th key={p} className="text-right">{p}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Revenue", values: revenue, fmt: formatCompact, bold: true },
                  { label: "Gross Profit", values: grossProfit, fmt: formatCompact, bold: false },
                  { label: "EBITDA", values: ebitda, fmt: formatCompact, bold: false },
                  { label: "Operating Income", values: operatingIncome, fmt: formatCompact, bold: false },
                ].map(({ label, values, fmt, bold }) => (
                  <tr key={label}>
                    <td className={bold ? "font-semibold text-slate-900" : "text-slate-600"}>{label}</td>
                    {values.map((v, i) => (
                      <td key={i} className={`text-right ${bold ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>{fmt(v)}</td>
                    ))}
                  </tr>
                ))}
                <tr className="tbl-accent">
                  <td>Gross Margin</td>
                  {grossMargin.map((v, i) => (
                    <td key={i} className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${v >= 0.3 ? "bg-emerald-50 text-emerald-700" : v >= 0.15 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                        {formatPercent(v)}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="tbl-accent">
                  <td>Operating Margin</td>
                  {operatingMargin.map((v, i) => (
                    <td key={i} className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${v >= 0.15 ? "bg-emerald-50 text-emerald-700" : v >= 0.07 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                        {formatPercent(v)}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Insight callout */}
          <div className="mt-4 insight-card insight-card-good">
            <div className="flex items-start gap-3">
              <ArrowUpRight className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Strong Q1 margin expansion</p>
                <p className="text-xs text-slate-500 mt-0.5">
                {hasComp
                  ? <>Gross margin expanded from <strong>{formatPercent(grossMargin[1] ?? 0)}</strong> ({compLabel}) to <strong>{formatPercent(grossMargin[0] ?? 0)}</strong> ({periods[0]}) — a <strong>{formatPercent((grossMargin[0] ?? 0) - (grossMargin[1] ?? 0))}</strong> improvement. This indicates stronger contract pricing and tighter direct cost management. Sustaining margin above 35% should be a key management objective for the remainder of FY2026.</>
                  : <>Gross margin for {periods[0]} is <strong>{formatPercent(grossMargin[0] ?? 0)}</strong>. Select an additional period to view a comparison.</>
                }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
