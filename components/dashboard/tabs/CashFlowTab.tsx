"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";
import { formatCompact, formatDays, formatMoney, formatPercent, formatYAxisMoney } from "@/lib/dashboard/format";
import { RatioModel } from "@/types/dashboard";
import { TrendingUp, TrendingDown, Wallet, RefreshCcw, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { CfoCommentary, SectionNote } from "@/components/dashboard/CfoCommentary";

const C = { navy: "#1a1d1f", maroon: "#941c1c", blue: "#2f80ed", purple: "#7c3aed", amber: "#f2994a", red: "#eb5757" };

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
          <span className="font-medium text-slate-900">{formatCompact(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

function MetricBox({ icon, label, value, note, status }: { icon: React.ReactNode; label: string; value: string; note: string; status: "good" | "warn" | "bad" }) {
  const statusBadge = {
    good: { bg: "bg-teal-50", text: "text-teal-700", Icon: CheckCircle },
    warn: { bg: "bg-amber-50",   text: "text-amber-700",   Icon: AlertCircle },
    bad:  { bg: "bg-red-50",     text: "text-red-700",     Icon: AlertCircle },
  }[status];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-slate-400">{icon}</div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
          <statusBadge.Icon className="h-3 w-3" />
          {status === "good" ? "Healthy" : status === "warn" ? "Monitor" : "Critical"}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{note}</p>
    </div>
  );
}

export function CashFlowTab({
  periods,
  cashAtEnd,
  receivables,
  payables,
  ratios,
}: {
  periods: string[];
  cashAtEnd: number[];
  receivables: number[];
  payables: number[];
  ratios: RatioModel;
}) {
  /* ── Cash position area chart ── */
  const cashData = periods.map((p, i) => ({
    period: p,
    "Cash & Bank": cashAtEnd[i] ?? 0,
  }));

  /* ── Receivables vs Payables grouped bar ── */
  const recPayData = periods.map((p, i) => ({
    period: p,
    Receivables: receivables[i] ?? 0,
    "Current Liabilities": payables[i] ?? 0,
  }));

  /* ── Cash waterfall for latest period ── */
  const latestCash = cashAtEnd[0] ?? 0;
  const prevCash = cashAtEnd[1] ?? 0;
  const cashChange = latestCash - prevCash;
  const cashUp = cashChange > 0;

  return (
    <div className="space-y-5">
      <CfoCommentary
        tone="positive"
        title="Cash Flow & Working Capital — Strong Liquidity and Collections"
        body={
          <>
            Macwest's cash position grew significantly during Q1 2026, closing at <strong>GH¢ 5.76M</strong>. 
            This liquidity improvement is a direct result of efficient receivables management, with 
            <strong>Days Sales Outstanding (DSO)</strong> optimized to 44 days. The <strong>Cash Conversion 
            Cycle</strong> of 19 days remains structurally favorable, ensuring that the company can 
            convert its operational investments into cash rapidly to fund ongoing project delivery.
          </>
        }
      />

      {/* ── Row 1: Cash position summary ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricBox
          icon={<Wallet className="h-5 w-5" />}
          label="Cash & Bank Balance"
          value={formatCompact(latestCash)}
          note={`${periods[0] ?? ""} — end of period`}
          status={latestCash > 0 ? "good" : "bad"}
        />
        <MetricBox
          icon={<RefreshCcw className="h-5 w-5" />}
          label="Cash Conversion Cycle"
          value={`${ratios.ccc.toFixed(0)} days`}
          note={ratios.ccc < 0 ? "Negative CCC — cash received before suppliers paid" : "Positive cycle — working capital tied up"}
          status={ratios.ccc < 0 ? "good" : ratios.ccc < 60 ? "warn" : "bad"}
        />
        <MetricBox
          icon={<TrendingUp className="h-5 w-5" />}
          label="Net Working Capital"
          value={formatCompact(ratios.netWorkingCapital)}
          note="Current Assets minus Current Liabilities"
          status={ratios.netWorkingCapital > 0 ? "good" : "bad"}
        />
      </div>

      {/* ── Row 2: Cash position chart ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Cash Position Trend</h3>
            <SectionNote>Cash at bank at the end of each reporting period. The significant jump in Q1 2026 confirms the effectiveness of the recent collection drive. This liquidity provides a strong buffer for the planned marketing and business development activities in the upcoming quarters.</SectionNote>
          </div>
          <div className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${cashUp ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"}`}>
            {cashUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {cashUp ? "+" : ""}{formatCompact(cashChange)} vs prior
          </div>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={formatYAxisMoney} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="4 2" />
              <Area type="monotone" dataKey="Cash & Bank" stroke={C.teal} fill="url(#cashFill)" strokeWidth={3} dot={{ r: 5, fill: C.teal, stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 3: Receivables vs Payables ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Receivables vs Liabilities</h3>
            <SectionNote>Trade receivables (what clients owe the Company) compared against current liabilities (what the Company owes suppliers and others). The rapid growth in both reflects the scaling of operations. Management's objective should be to ensure receivables growth does not outpace collection speed — a rising DSO alongside growing receivables signals potential collection pressure.</SectionNote>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recPayData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatYAxisMoney} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} iconType="circle" iconSize={8} />
                <Bar dataKey="Receivables" fill={C.blue} radius={[5, 5, 0, 0]} barSize={28} />
                <Bar dataKey="Current Liabilities" fill={C.red} radius={[5, 5, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Working Capital Analysis</h3>
            <p className="text-sm text-slate-400 mt-0.5">Key collection & payment metrics</p>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Days Sales Outstanding (DSO)",
                value: formatDays(ratios.dso),
                detail: `GHS Receivables / Revenue × 91 days`,
                color: C.blue,
                status: ratios.dso <= 45 ? "good" : ratios.dso <= 75 ? "warn" : "bad" as "good" | "warn" | "bad",
                pct: Math.min(ratios.dso / 120, 1),
              },
              {
                label: "Days Payables Outstanding (DPO)",
                value: formatDays(ratios.dpo),
                detail: `AP / Direct Costs × 91 days — higher favours cash retention`,
                color: C.navy,
                status: "good" as "good" | "warn" | "bad",
                pct: Math.min(ratios.dpo / 300, 1),
              },
              {
                label: "Cash Conversion Cycle",
                value: `${ratios.ccc.toFixed(0)} days`,
                detail: `DSO − DPO = ${ratios.ccc < 0 ? "negative, cash received before payment due" : "positive, working capital tied up"}`,
                color: ratios.ccc < 0 ? C.teal : C.amber,
                status: ratios.ccc < 0 ? "good" : "warn" as "good" | "warn" | "bad",
                pct: Math.min(Math.abs(ratios.ccc) / 300, 1),
              },
            ].map(({ label, value, detail, color, status, pct }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-medium text-slate-700 max-w-[200px]">{label}</p>
                  <span className="text-lg font-bold text-slate-900 ml-2">{value}</span>
                </div>
                <div className="progress-track mb-2">
                  <div className="progress-fill" style={{ width: `${pct * 100}%`, background: color }} />
                </div>
                <p className="text-xs text-slate-400">{detail}</p>
              </div>
            ))}
          </div>

          {/* Receivables as % of assets */}
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-xs text-blue-800 font-medium">
              Receivables as % of Total Assets: <strong>{formatPercent((receivables[0] ?? 0) / ((receivables[0] ?? 0) + (payables[0] ?? 0) + Math.max(cashAtEnd[0] ?? 0, 0) + 1))}</strong>
            </p>
            <p className="text-xs text-blue-700 mt-0.5">Monitor receivables ageing — 64-day DSO requires active debtor management.</p>
          </div>
        </div>
      </div>

      {/* ── Row 4: Summary table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Cash & Working Capital Summary</h3>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Metric</th>
                {periods.map((p) => <th key={p} className="text-right">{p}</th>)}
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Cash & Bank Balance", values: cashAtEnd, fmt: formatMoney, note: "From Balance Sheet" },
                { label: "Receivables", values: receivables, fmt: formatMoney, note: "Trade debtors" },
                { label: "Current Liabilities", values: payables, fmt: formatMoney, note: "All current obligations" },
              ].map(({ label, values, fmt, note }) => (
                <tr key={label}>
                  <td className="font-medium text-slate-800">{label}</td>
                  {values.map((v, i) => (
                    <td key={i} className={`text-right tabular-nums font-semibold ${v < 0 ? "text-red-600" : "text-slate-900"}`}>{fmt(v)}</td>
                  ))}
                  <td className="text-slate-400 text-sm">{note}</td>
                </tr>
              ))}
              <tr className="tbl-accent">
                <td>Days Sales Outstanding</td>
                <td className="text-right font-bold">{formatDays(ratios.dso)}</td>
                {periods.slice(1).map((_, i) => <td key={i} className="text-right text-slate-400">—</td>)}
                <td className="text-slate-400 text-sm">AR / Revenue × 91</td>
              </tr>
              <tr className="tbl-accent">
                <td>Days Payables Outstanding</td>
                <td className="text-right font-bold">{formatDays(ratios.dpo)}</td>
                {periods.slice(1).map((_, i) => <td key={i} className="text-right text-slate-400">—</td>)}
                <td className="text-slate-400 text-sm">AP / COGS × 91</td>
              </tr>
              <tr className="tbl-accent">
                <td>Cash Conversion Cycle</td>
                <td className="text-right font-bold text-teal-700">{ratios.ccc.toFixed(0)} days</td>
                {periods.slice(1).map((_, i) => <td key={i} className="text-right text-slate-400">—</td>)}
                <td className="text-slate-400 text-sm">DSO − DPO</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
