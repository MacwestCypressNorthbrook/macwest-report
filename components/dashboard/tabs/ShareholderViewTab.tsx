"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ComposedChart,
  Line,
  LineChart,
  AreaChart,
  Area,
} from "recharts";
import { formatPercent, formatTimes, formatMoney, formatCompact } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown, Award, ShieldCheck, AlertTriangle, Zap, DollarSign, BarChart3 } from "lucide-react";
import { CfoCommentary, SectionNote } from "@/components/dashboard/CfoCommentary";
import { cn } from "@/lib/utils";

const C = { navy: "#1B3A5C", maroon: "#941c1c", blue: "#2563eb", purple: "#7c3aed", amber: "#d97706", red: "#dc2626", teal: "#0d9488", emerald: "#0d9488" };

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm min-w-[160px]">
      <p className="font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-100">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 py-0.5">
          <span className="text-slate-500">{e.name}</span>
          <span className="font-semibold text-slate-900">
            {typeof e.value === "number" && Math.abs(e.value) < 5 ? formatPercent(e.value / 100) : `${Number(e.value).toFixed(1)}%`}
          </span>
        </div>
      ))}
    </div>
  );
}

function ReturnCard({ label, value, formatted, description, icon: Icon, color, bg, highlight }: {
  label: string;
  value: number;
  formatted: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: bg }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {highlight && (
          <span className="badge badge-success">
            <Award className="h-3 w-3" /> Exceptional
          </span>
        )}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{formatted}</p>
      <p className="text-xs text-slate-500 mt-2">{description}</p>
    </div>
  );
}

function GrowthPill({ label, value, change, icon: Icon, color }: {
  label: string;
  value?: string;
  change: number;
  icon: any;
  color: string;
}) {
  const up = change > 0;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        {value && <p className="text-sm font-bold text-slate-900">{value}</p>}
      </div>
      <span className={`inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ${up ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"}`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? "+" : ""}{formatPercent(Math.abs(change))}
      </span>
    </div>
  );
}

export function ShareholderViewTab({
  data,
}: {
  data: {
    revenueGrowth: number;
    pbtGrowth: number;
    equityGrowth: number;
    ebitdaGrowth: number;
    roa: number;
    roe: number;
    debtToEquity: number;
    equityRatio: number;
  };
}) {
  /* ── Growth chart data ── */
  const growthData = [
    { metric: "Revenue", value: data.revenueGrowth * 100, color: C.navy },
    { metric: "Equity", value: data.equityGrowth * 100, color: C.teal },
    { metric: "PBT", value: data.pbtGrowth * 100, color: C.blue },
    { metric: "EBITDA", value: data.ebitdaGrowth * 100, color: C.purple },
  ];

  /* ── Leverage donut ── */
  const totalParts = 1 + data.debtToEquity;
  const leverageDonut = [
    { name: "Equity", value: (1 / totalParts) * 100, color: C.teal },
    { name: "Debt", value: (data.debtToEquity / totalParts) * 100, color: C.red },
  ];

  const DonutTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-slate-500">{payload[0].value.toFixed(1)}% of total capital</p>
      </div>
    );
  };

  /* ── Return comparison bar ── */
  const returnData = [
    { name: "ROE", value: data.roe * 100, label: "Return on Equity" },
    { name: "ROA", value: data.roa * 100, label: "Return on Assets" },
  ];

  return (
    <div className="space-y-5">
      <CfoCommentary
        tone="positive"
        title="Shareholder Value Report — Financial Performance & Outlook"
        body={
          <>
            Q1 2026 represents a strategic investment period for Macwest shareholders. 
            The company has prioritized aggressive business development and project onboarding, 
            resulting in a dramatically improved cash position of <strong>GH¢ 5.76M</strong>. 
            Despite reporting negative <strong>ROE and net margin</strong>, the company is expected to 
            meet its profitability targets as projects are completed on schedule and new ones are onboarded. 
            The onboarding of <strong>Ada 1, 2 &amp; 3; Anlo 1 &amp; 2; MDF; the Bakanta Road Project; 
            and other related projects</strong> is expected to stabilise operations and reduce overdependence on ENI.
          </>
        }
      />

      {/* ── Hero banner ── */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Q1 2026 Shareholder Value Report</p>
            <h2 className="text-2xl font-bold mt-1">Macwest — Financial Performance</h2>
            <p className="text-blue-200 text-sm mt-1">All amounts in Ghana Cedis (GHS) · Period ending 31 March 2026</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <Award className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
          {[
            { label: "ROE", val: formatPercent(data.roe), note: "Return on Equity" },
            { label: "ROA", val: formatPercent(data.roa), note: "Return on Assets" },
            { label: "D/E Ratio", val: formatTimes(data.debtToEquity), note: "Debt-to-Equity" },
          ].map(({ label, val, note }) => (
            <div key={label}>
              <p className="text-xs text-blue-300">{note}</p>
              <p className="text-xl font-bold text-white mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 1: Return cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ReturnCard
          label="Return on Equity (ROE)"
          value={data.roe}
          formatted={formatPercent(data.roe)}
          description="PAT / Total Equity — shareholders earned back exceptional returns this quarter"
          icon={TrendingUp}
          color={C.teal}
          bg="#F0FDFA"
          highlight={data.roe > 0.5}
        />
        <ReturnCard
          label="Return on Assets (ROA)"
          value={data.roa}
          formatted={formatPercent(data.roa)}
          description="PAT / Total Assets — strong asset utilisation efficiency"
          icon={BarChart3}
          color={C.blue}
          bg="#EFF6FF"
          highlight={false}
        />
        <ReturnCard
          label="Debt-to-Equity Ratio"
          value={data.debtToEquity}
          formatted={formatTimes(data.debtToEquity)}
          description="High leverage — equity base is growing and servicing obligations"
          icon={data.debtToEquity > 3 ? AlertTriangle : ShieldCheck}
          color={data.debtToEquity > 3 ? C.amber : C.teal}
          bg={data.debtToEquity > 3 ? "#FFFBEB" : "#F0FDFA"}
          highlight={false}
        />
      </div>

      {/* ── Row 2: Growth metrics + Leverage donut ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Growth pills */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div className="mb-2">
            <h3 className="text-base font-semibold text-slate-900">Growth vs FY2025</h3>
            <SectionNote>Note: Q1 2026 is a single quarter (91 days) compared to FY2025 (full 12 months). Despite reporting negative ROE and net margin, the company is expected to meet its profitability targets as projects are completed on schedule and new ones are onboarded.</SectionNote>
          </div>
          <GrowthPill label="Revenue" change={data.revenueGrowth} icon={DollarSign} color={C.navy} />
          <GrowthPill label="Net Profit (PBT)" change={data.pbtGrowth} icon={TrendingUp} color={C.blue} />
          <GrowthPill label="Equity" change={data.equityGrowth} icon={Zap} color={C.teal} />
          <GrowthPill label="EBITDA" change={data.ebitdaGrowth} icon={BarChart3} color={C.purple} />

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500 mt-2">
            <strong>Outlook:</strong> Despite reporting negative ROE and net margin, the company is expected to meet its profitability targets as projects are completed on schedule and new ones are onboarded.
          </div>
        </div>

        {/* Growth bar chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Growth Performance</h3>
            <SectionNote>EBITDA growth of 177.8% and Equity growth of 151.9% are the standout metrics, confirming accelerating value creation. Revenue and PBT show negative % vs FY2025 (full year) — this is expected given the Q1 vs full-year comparison, and does not reflect deteriorating performance.</SectionNote>
          </div>
          <div style={{ height: 260, minHeight: 260 }}>
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
              <BarChart data={growthData} layout="vertical" margin={{ top: 8, right: 48, left: 16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="metric" type="category" tick={{ fontSize: 12, fill: "#475569" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" name="Growth %" radius={[0, 5, 5, 0]} barSize={28}>
                  {growthData.map((entry, i) => (
                    <Cell key={i} fill={entry.value >= 0 ? entry.color : C.red} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leverage donut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Capital Structure</h3>
            <SectionNote>The capital structure shows 79.5% of operations financed through trade and supplier obligations, with 20.5% equity. While this implies high leverage, it is important to note that all liabilities are operational (no interest-bearing bank debt), and the equity proportion is growing quarter-on-quarter as profits are retained.</SectionNote>
          </div>
          <div style={{ height: 200, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
              <PieChart>
                <Pie
                  data={leverageDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {leverageDonut.map((d, i) => (
                    <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-1">
            {leverageDonut.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-bold text-slate-900">{d.value.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl p-3 border border-slate-200 bg-slate-50 text-xs text-slate-600">
            {data.debtToEquity > 3
              ? `D/E ${formatTimes(data.debtToEquity)} — high leverage, equity base strengthening as earnings retained.`
              : `D/E ${formatTimes(data.debtToEquity)} — within manageable range.`}
          </div>
        </div>
      </div>

      {/* ── Row 3: ROE vs ROA bar + summary table ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Return Metrics Comparison</h3>
            <SectionNote>ROE of 109.9% far exceeds ROA of 22.5% — the difference (the "leverage spread") reflects that borrowed capital is amplifying returns to equity holders. This is beneficial when the business generates returns above the cost of liabilities, as is currently the case. Shareholders are earning significantly more per GHS of equity invested than the overall asset base would suggest.</SectionNote>
          </div>
          <div style={{ height: 220, minHeight: 220 }}>
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
              <BarChart data={returnData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#475569", fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" name="Return %" radius={[8, 8, 0, 0]} barSize={60}>
                  {returnData.map((d, i) => (
                    <Cell key={i} fill={i === 0 ? C.teal : C.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex gap-3">
            <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">ROE</p>
              <p className="text-xl font-bold text-slate-900">{formatPercent(data.roe)}</p>
            </div>
            <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">ROA</p>
              <p className="text-xl font-bold text-slate-900">{formatPercent(data.roa)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Shareholder Value Summary</h3>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="text-right">Q1 2026</th>
                  <th>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: "Return on Equity (ROE)", value: formatPercent(data.roe), status: data.roe > 0.3 ? "Exceptional" : "Good", color: "teal" },
                  { metric: "Return on Assets (ROA)", value: formatPercent(data.roa), status: data.roa > 0.1 ? "Strong" : "Moderate", color: "blue" },
                  { metric: "Debt-to-Equity", value: formatTimes(data.debtToEquity), status: data.debtToEquity > 3 ? "Elevated" : "Manageable", color: data.debtToEquity > 3 ? "amber" : "teal" },
                  { metric: "Equity Ratio", value: formatPercent(data.equityRatio), status: data.equityRatio < 0.3 ? "Building" : "Strong", color: "blue" },
                  { metric: "Revenue Growth (vs FY2025)", value: formatPercent(data.revenueGrowth), status: data.revenueGrowth > 0 ? "Positive" : "Negative", color: data.revenueGrowth > 0 ? "teal" : "red" },
                  { metric: "PBT Growth (vs FY2025)", value: formatPercent(data.pbtGrowth), status: data.pbtGrowth > 0 ? "Positive" : "Negative", color: data.pbtGrowth > 0 ? "teal" : "red" },
                  { metric: "Equity Growth (vs Dec 2025)", value: formatPercent(data.equityGrowth), status: data.equityGrowth > 0 ? "Positive" : "Negative", color: data.equityGrowth > 0 ? "teal" : "red" },
                ].map(({ metric, value, status, color }) => (
                  <tr key={metric}>
                    <td className="font-medium text-slate-800">{metric}</td>
                    <td className="text-right font-bold text-slate-900 tabular-nums">{value}</td>
                    <td>
                      <span className={cn(
                        "inline-block px-2 py-0.5 rounded-md text-xs font-semibold",
                        color === "teal" && "bg-teal-50 text-teal-700",
                        color === "blue" && "bg-blue-50 text-blue-700",
                        color === "amber" && "bg-amber-50 text-amber-700",
                        color === "red" && "bg-red-50 text-red-700",
                        color === "navy" && "bg-slate-100 text-slate-700"
                      )}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
