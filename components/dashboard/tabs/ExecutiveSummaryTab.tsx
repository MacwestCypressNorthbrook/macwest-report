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
  Cell,
} from "recharts";
import { DashboardModel } from "@/types/dashboard";
import { formatCompact, formatMoney, formatPercent, formatTimes } from "@/lib/dashboard/format";
import {
  TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle,
  ShieldAlert, BarChart3, DollarSign, Activity, Target, Layers,
} from "lucide-react";

const C = { navy: "#1B3A5C", emerald: "#059669", blue: "#2563eb", purple: "#7c3aed", amber: "#d97706", red: "#dc2626" };

type RAG = "green" | "amber" | "red";

function ragConfig(r: RAG) {
  return {
    green: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />, label: "On Track" },
    amber: { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   icon: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />,  label: "Monitor" },
    red:   { bg: "bg-red-50",     border: "border-red-100",     text: "text-red-700",     icon: <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />,        label: "Action Required" },
  }[r];
}

function MetricRow({ label, value, change, hasPrior, color }: {
  label: string; value: string; change?: number; hasPrior: boolean; color?: string;
}) {
  const up = (change ?? 0) > 0;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-900" style={{ color }}>{value}</span>
        {hasPrior && change !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
            {up ? "+" : ""}{formatPercent(Math.abs(change))}
          </span>
        )}
      </div>
    </div>
  );
}

function RagCard({ rag, title, detail }: { rag: RAG; title: string; detail: string }) {
  const cfg = ragConfig(rag);
  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-start gap-2.5">
        {cfg.icon}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{detail}</p>
        </div>
      </div>
    </div>
  );
}

interface Props {
  model: DashboardModel;
  selectedPeriod: string;
  priorPeriod: string | null;
  allPeriods: string[];
  allRevenue: number[];
}

export function ExecutiveSummaryTab({ model, selectedPeriod, priorPeriod, allPeriods, allRevenue }: Props) {
  const r  = model.incomeStatementSeries;
  const bs = model.balanceSheetSeries;
  const rt = model.ratios;
  const sv = model.shareholderView;

  const hasPrior = priorPeriod !== null;
  const safePct  = (a: number, b: number) => b !== 0 ? (a - b) / Math.abs(b) : 0;

  /* ── Annualised FY projection (only meaningful for Q1) ── */
  const isQ1 = selectedPeriod.startsWith("Q1");
  const annualisedRevenue  = r.revenue[0] * 4;
  const annualisedGP       = r.grossProfit[0] * 4;
  const annualisedEBITDA   = r.ebitda[0] * 4;
  const annualisedPBT      = r.pbt[0] * 4;

  /* ── Revenue trend chart ── */
  const revTrendData = allPeriods.slice().reverse().map((p, i) => ({
    period: p.replace("FY ", ""),
    Revenue: allRevenue[allRevenue.length - 1 - i] ?? 0,
  }));

  /* ── Margin bars ── */
  const margins = [
    { label: "Gross Margin",     value: rt.grossMargin,    color: C.emerald, benchmark: 0.30 },
    { label: "Operating Margin", value: rt.operatingMargin,color: C.blue,    benchmark: 0.10 },
    { label: "Net Margin (PAT)", value: rt.netMarginPAT,   color: C.purple,  benchmark: 0.05 },
    { label: "EBITDA Margin",    value: rt.ebitdaMargin,   color: C.navy,    benchmark: 0.15 },
  ];

  /* ── P&L snapshot rows ── */
  const pnlRows = [
    { label: "Revenue",               value: formatCompact(r.revenue[0]),        change: hasPrior ? safePct(r.revenue[0], r.revenue[1]) : undefined },
    { label: "Gross Profit",          value: formatCompact(r.grossProfit[0]),     change: hasPrior ? safePct(r.grossProfit[0], r.grossProfit[1]) : undefined },
    { label: "EBITDA",                value: formatCompact(r.ebitda[0]),          change: hasPrior ? safePct(r.ebitda[0], r.ebitda[1]) : undefined },
    { label: "Operating Income",      value: formatCompact(r.operatingIncome[0]), change: hasPrior ? safePct(r.operatingIncome[0], r.operatingIncome[1]) : undefined },
    { label: "Net Profit Before Tax", value: formatCompact(r.pbt[0]),             change: hasPrior ? safePct(r.pbt[0], r.pbt[1]) : undefined },
  ];

  /* ── Risk register ── */
  const concentration = model.revenueByCustomer.reduce((a, b) => a.value > b.value ? a : b, { name: "", value: 0 });
  const concPct = concentration.value / (r.revenue[0] || 1);
  const risks = [
    {
      rag: concPct > 0.8 ? "red" as RAG : "amber" as RAG,
      title: `Customer Concentration — ${concentration.name}`,
      detail: `${formatPercent(concPct)} of revenue from one client. Immediate diversification strategy required. Board action item.`,
    },
    {
      rag: rt.debtToEquity > 3.5 ? "amber" as RAG : "green" as RAG,
      title: `Financial Leverage — D/E ${formatTimes(rt.debtToEquity)}`,
      detail: `Leverage above the 2.0x benchmark. All liabilities are operational (no bank debt). Equity base growing — target D/E below 2.5x by FY2026 year-end.`,
    },
    {
      rag: rt.currentRatio >= 1.5 ? "green" as RAG : rt.currentRatio >= 1.0 ? "amber" as RAG : "red" as RAG,
      title: `Liquidity — Current Ratio ${formatTimes(rt.currentRatio)}`,
      detail: `Below the 1.5x optimal threshold. Net Working Capital is positive at ${formatCompact(rt.netWorkingCapital)}. Accelerate receivables collection to improve cash buffer.`,
    },
    {
      rag: rt.grossMargin >= 0.3 ? "green" as RAG : "amber" as RAG,
      title: `Gross Margin — ${formatPercent(rt.grossMargin)}`,
      detail: `Margin ${rt.grossMargin >= 0.3 ? "meets" : "below"} the 30% benchmark. ${rt.grossMargin >= 0.3 ? "Pricing discipline is holding." : "Review contract pricing and direct cost recovery."}`,
    },
  ];

  function TooltipFmt({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm">
        <p className="font-semibold text-slate-900 mb-1">{label}</p>
        {payload.map((e: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-slate-500">{e.name}:</span>
            <span className="font-bold text-slate-900">{formatCompact(e.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Board Report Banner ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1B3A5C] to-[#2a5080] px-5 md:px-8 py-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div>
            <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-1">Board Management Report</p>
            <h1 className="text-xl md:text-2xl font-bold">{model.meta.company} — {selectedPeriod}</h1>
            <p className="text-blue-200 text-xs md:text-sm mt-1">All amounts in {model.meta.currency} · Prepared for Board of Directors</p>
          </div>
          <div className="md:text-right border-l-2 md:border-l-0 md:border-r-2 border-blue-400/30 pl-3 md:pl-0 md:pr-3">
            <p className="text-[10px] text-blue-300 uppercase tracking-wide">Reporting Period</p>
            <p className="text-base md:text-lg font-bold">{model.meta.periodEnding}</p>
            {hasPrior && <p className="text-[10px] text-blue-300 mt-0.5">Vs: {priorPeriod}</p>}
          </div>
        </div>
        {/* Quick headline numbers */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/20 pt-5">
          {[
            { label: "Revenue",      val: formatCompact(r.revenue[0]) },
            { label: "Gross Profit", val: formatCompact(r.grossProfit[0]) },
            { label: "EBITDA",       val: formatCompact(r.ebitda[0]) },
            { label: "Net PBT",      val: formatCompact(r.pbt[0]) },
          ].map(({ label, val }) => (
            <div key={label}>
              <p className="text-[10px] md:text-xs text-blue-300">{label}</p>
              <p className="text-lg md:text-xl font-bold text-white mt-0.5">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 1: P&L Snapshot + Revenue Trend + Margins ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* P&L Snapshot */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">P&L Snapshot</h3>
            {hasPrior && <span className="text-xs text-slate-400 ml-auto">vs {priorPeriod}</span>}
          </div>
          {pnlRows.map((row) => (
            <MetricRow key={row.label} {...row} hasPrior={hasPrior} />
          ))}
        </div>

        {/* Revenue Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Revenue Trend</h3>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revTrendData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <defs>
                  <linearGradient id="execRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.navy} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.navy} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : `${(v / 1e3).toFixed(0)}K`} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={40} />
                <Tooltip content={<TooltipFmt />} cursor={{ fill: "#f8fafc" }} />
                <Area type="monotone" dataKey="Revenue" stroke={C.navy} fill="url(#execRevFill)" strokeWidth={2.5} dot={{ r: 4, fill: C.navy, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Margin Dashboard */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Margin Performance</h3>
          </div>
          <div className="space-y-4">
            {margins.map(({ label, value, color, benchmark }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-600 font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">bench {formatPercent(benchmark)}</span>
                    <span className="text-sm font-bold text-slate-900" style={{ color }}>{formatPercent(value)}</span>
                  </div>
                </div>
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(value * 100, 100)}%`, background: color }} />
                  {/* Benchmark tick */}
                  <div className="absolute top-0 h-full w-0.5 bg-slate-400/50" style={{ left: `${Math.min(benchmark * 100, 99)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Balance Sheet + Ratios ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Balance sheet snapshot */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Balance Sheet Snapshot</h3>
            {bs.periods[0] && <span className="text-xs text-slate-400 ml-auto">as at {bs.periods[0]}</span>}
          </div>
          {[
            { label: "Total Assets",       value: formatCompact(bs.assets[0] ?? 0),      change: hasPrior && bs.assets[1]       ? safePct(bs.assets[0]!, bs.assets[1])             : undefined },
            { label: "Current Assets",     value: formatCompact(bs.currentAssets[0] ?? 0), change: undefined },
            { label: "Cash & Bank",        value: formatCompact(bs.cashAndBank[0] ?? 0),  change: hasPrior && bs.cashAndBank[1]  ? safePct(bs.cashAndBank[0]!, bs.cashAndBank[1])   : undefined },
            { label: "Receivables",        value: formatCompact(bs.receivables[0] ?? 0),  change: undefined },
            { label: "Total Liabilities",  value: formatCompact(bs.liabilities[0] ?? 0),  change: hasPrior && bs.liabilities[1]  ? safePct(bs.liabilities[0]!, bs.liabilities[1])   : undefined },
            { label: "Total Equity",       value: formatCompact(bs.equity[0] ?? 0),        change: hasPrior && bs.equity[1]       ? safePct(bs.equity[0]!, bs.equity[1])             : undefined, color: C.emerald },
          ].map((row) => (
            <MetricRow key={row.label} {...row} hasPrior={hasPrior} />
          ))}
        </div>

        {/* Key Ratios */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Key Financial Ratios</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Current Ratio",  value: formatTimes(rt.currentRatio),  rag: rt.currentRatio >= 1.5 ? "green" : rt.currentRatio >= 1.0 ? "amber" : "red" as RAG, note: "Target > 1.5x" },
              { label: "Quick Ratio",    value: formatTimes(rt.quickRatio),     rag: rt.quickRatio >= 1.0 ? "green" : rt.quickRatio >= 0.5 ? "amber" : "red" as RAG,     note: "Target > 1.0x" },
              { label: "Debt / Equity",  value: formatTimes(rt.debtToEquity),   rag: rt.debtToEquity <= 2 ? "green" : rt.debtToEquity <= 3.5 ? "amber" : "red" as RAG,  note: "Target < 2.0x" },
              { label: "Equity Ratio",   value: formatPercent(rt.equityRatio),  rag: rt.equityRatio >= 0.4 ? "green" : rt.equityRatio >= 0.2 ? "amber" : "red" as RAG,  note: "Target > 40%" },
              { label: "ROE",            value: formatPercent(rt.roe),          rag: rt.roe >= 0.15 ? "green" : rt.roe >= 0.08 ? "amber" : "red" as RAG,                note: "Target > 15%" },
              { label: "ROA",            value: formatPercent(rt.roa),          rag: rt.roa >= 0.05 ? "green" : rt.roa >= 0.02 ? "amber" : "red" as RAG,                note: "Target > 5%" },
            ].map(({ label, value, rag, note }) => {
              const cfg = ragConfig(rag as RAG);
              return (
                <div key={label} className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3`}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${cfg.text}`}>{value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Risk Register ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-900">Board Risk Register</h3>
          <span className="ml-auto text-xs text-slate-400">RAG status for {selectedPeriod}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {risks.map((r, i) => <RagCard key={i} {...r} />)}
        </div>
      </div>

      {/* ── Row 4: FY Projection (Q1 only) ── */}
      {isQ1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">FY2026 Annualised Projection</h3>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Q1 × 4 estimate</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Based on Q1 2026 run-rate. Assumes consistent performance for the remaining three quarters. Subject to contract renewal and pipeline execution.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Revenue (FY2026E)",      val: formatCompact(annualisedRevenue),  vs: formatCompact(58545664.29), vsLabel: "FY2025 actual", color: C.navy    },
              { label: "Gross Profit (FY2026E)", val: formatCompact(annualisedGP),       vs: formatCompact(10923149.5),  vsLabel: "FY2025 actual", color: C.emerald },
              { label: "EBITDA (FY2026E)",       val: formatCompact(annualisedEBITDA),   vs: formatCompact(1890000),     vsLabel: "FY2025 actual", color: C.blue    },
              { label: "Net PBT (FY2026E)",      val: formatCompact(annualisedPBT),      vs: formatCompact(2422322.56),  vsLabel: "FY2025 actual", color: C.purple  },
            ].map(({ label, val, vs, vsLabel, color }) => (
              <div key={label} className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="text-xl font-bold mt-1" style={{ color }}>{val}</p>
                <p className="text-xs text-slate-400 mt-1">vs {vs}</p>
                <p className="text-[10px] text-slate-300">{vsLabel}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 5: Period Comparison Table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Condensed P&L — All Periods</h3>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th className="text-left">Metric</th>
                {r.periods.map((p) => <th key={p} className="text-right">{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Revenue",         vals: r.revenue },
                { label: "Gross Profit",    vals: r.grossProfit },
                { label: "EBITDA",          vals: r.ebitda },
                { label: "Operating Income",vals: r.operatingIncome },
                { label: "Net Profit (PBT)",vals: r.pbt },
              ].map(({ label, vals }) => (
                <tr key={label}>
                  <td className="font-medium text-slate-800">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="text-right tabular-nums font-semibold text-slate-900">
                      {formatCompact(v)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="tbl-accent">
                <td>Gross Margin %</td>
                {r.grossProfit.map((gp, i) => (
                  <td key={i} className="text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${r.revenue[i] && gp / r.revenue[i] >= 0.3 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {r.revenue[i] ? formatPercent(gp / r.revenue[i]) : "—"}
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
