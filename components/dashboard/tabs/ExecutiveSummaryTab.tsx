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
import { DashboardModel } from "@/types/dashboard";
import { formatCompact, formatPercent, formatTimes } from "@/lib/dashboard/format";
import {
  TrendingUp, TrendingDown, CheckCircle, AlertTriangle, XCircle,
  ShieldAlert, BarChart3, Activity, Target,
} from "lucide-react";

const C = { navy: "#1B3A5C", maroon: "#941c1c", blue: "#2563eb", purple: "#7c3aed", amber: "#d97706", red: "#dc2626", teal: "#0d9488", emerald: "#0d9488" };

type RAG = "green" | "amber" | "red";

function ragConfig(r: RAG) {
  return {
    green: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", icon: <CheckCircle className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />, label: "On Track" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />, label: "Monitor" },
    red: { bg: "bg-red-50", border: "border-red-100", text: "text-red-700", icon: <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />, label: "Action Required" },
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
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${up ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"}`}>
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
  allGrossProfit: number[];
  allEBITDA: number[];
  allPBT: number[];
}

export function ExecutiveSummaryTab({ model, selectedPeriod, priorPeriod, allPeriods, allRevenue, allGrossProfit, allEBITDA, allPBT }: Props) {
  const r = model.incomeStatementSeries;
  const bs = model.balanceSheetSeries;
  const rt = model.ratios;

  const hasPrior = priorPeriod !== null;
  const safePct = (a: number, b: number) => b !== 0 ? (a - b) / Math.abs(b) : 0;

  /* ── Annualised FY projection ── */
  const isQ1 = selectedPeriod.startsWith("Q1");
  const annualisedRevenue = r.revenue[0] * 4;
  const annualisedGP = r.grossProfit[0] * 4;
  const annualisedEBITDA = r.ebitda[0] * 4;
  const annualisedPBT = r.pbt[0] * 4;

  /* FY actuals — last entry in the unshifted full-series arrays */
  const fyIdx = allPeriods.length - 1;
  const fyLabel = allPeriods[fyIdx] ?? "Prior FY";
  const fyRevenue = allRevenue[fyIdx] ?? 0;
  const fyGP = allGrossProfit[fyIdx] ?? 0;
  const fyEBITDA = allEBITDA[fyIdx] ?? 0;
  const fyPBT = allPBT[fyIdx] ?? 0;

  /* ── Revenue trend chart ── */
  const revTrendData = allPeriods.slice().reverse().map((p, i) => ({
    period: p,
    Revenue: allRevenue[allRevenue.length - 1 - i] ?? 0,
  }));

  /* ── Risk register from data ── */
  const risks = model.commentary.risks.map((r) => ({
    rag: (r.impact === "High" ? "red" : r.impact === "Medium" ? "amber" : "green") as RAG,
    title: r.area,
    detail: r.description,
  }));

  function TooltipFmt({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm font-['Inter']">
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
      {/* ── Summary Header ── */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#941c1c]/5 rounded-full -mr-32 -mt-32" />
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wider border border-teal-100">Performance Report</span>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-semibold text-slate-500">{selectedPeriod} Official Review</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">Executive Overview</h1>
            <p className="text-slate-500 mt-4 w-full text-base leading-relaxed">
              {model.commentary.executiveSummary}
            </p>
          </div>
        </div>
      </div>

      {/* ── Row 1: P&L Snapshot + Revenue Trend + Margins ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Revenue Trend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Revenue Growth Trajectory</h3>
          </div>
          <div style={{ height: 240, minHeight: 240 }}>
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
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
                <Area type="monotone" dataKey="Revenue" stroke="#941c1c" fill="url(#execRevFill)" strokeWidth={2.5} dot={{ r: 4, fill: "#941c1c", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance sheet snapshot */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Asset & Funding Mix</h3>
            {bs.periods[0] && <span className="text-xs text-slate-400 ml-auto">as at {bs.periods[0]}</span>}
          </div>
          {[
            { label: "Total Assets", value: formatCompact(bs.assets[0] ?? 0), change: hasPrior && bs.assets[1] ? safePct(bs.assets[0]!, bs.assets[1]) : undefined },
            { label: "Non-Current Assets", value: formatCompact(bs.nonCurrentAssets[0] ?? 0), change: undefined },
            { label: "Receivables", value: formatCompact(bs.receivables[0] ?? 0), change: undefined },
            { label: "Total Liabilities", value: formatCompact(bs.liabilities[0] ?? 0), change: hasPrior && bs.liabilities[1] ? safePct(bs.liabilities[0]!, bs.liabilities[1]) : undefined },
            { label: "Total Equity", value: formatCompact(bs.equity[0] ?? 0), change: hasPrior && bs.equity[1] ? safePct(bs.equity[0]!, bs.equity[1]) : undefined, color: C.emerald },
          ].map((row) => (
            <MetricRow key={row.label} {...row} hasPrior={hasPrior} />
          ))}
        </div>
      </div>
      {/* ── Row 2: Ratios + Risk Register ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Key Ratios */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Key Financial Ratios</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Current Ratio", value: formatTimes(rt.currentRatio), rag: rt.currentRatio >= 1.5 ? "green" : rt.currentRatio >= 1.0 ? "amber" : "red" as RAG, note: "Target > 1.5x" },
              { label: "Quick Ratio", value: formatTimes(rt.quickRatio), rag: rt.quickRatio >= 1.0 ? "green" : rt.quickRatio >= 0.5 ? "amber" : "red" as RAG, note: "Target > 1.0x" },
              { label: "Debt / Equity", value: formatTimes(rt.debtToEquity), rag: rt.debtToEquity <= 2 ? "green" : rt.debtToEquity <= 3.5 ? "amber" : "red" as RAG, note: "Target < 2.0x" },
              { label: "Equity Ratio", value: formatPercent(rt.equityRatio), rag: rt.equityRatio >= 0.4 ? "green" : rt.equityRatio >= 0.2 ? "amber" : "red" as RAG, note: "Target > 40%" },
              { label: "ROE", value: formatPercent(rt.roe), rag: rt.roe >= 0.15 ? "green" : rt.roe >= 0.08 ? "amber" : "red" as RAG, note: "Target > 15%" },
              { label: "ROA", value: formatPercent(rt.roa), rag: rt.roa >= 0.05 ? "green" : rt.roa >= 0.02 ? "amber" : "red" as RAG, note: "Target > 5%" },
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

        {/* Risk Register */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Board Risk Register</h3>
            <span className="ml-auto text-xs text-slate-400">RAG status</span>
          </div>
          <div className="grid gap-3">
            {risks.slice(0, 4).map((r, i) => <RagCard key={i} {...r} />)}
          </div>
        </div>
      </div>

      {/* ── Row 3: FY Projection ── */}
      {isQ1 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">FY2026 Annualised Projection</h3>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Q1 × 4 estimate</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Based on Q1 2026 run-rate. Assumes consistent performance for the remaining three quarters.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Revenue (FY2026E)", val: formatCompact(annualisedRevenue), vs: formatCompact(fyRevenue), color: C.navy },
              { label: "Gross Profit (FY2026E)", val: formatCompact(annualisedGP), vs: formatCompact(fyGP), color: C.teal },
              { label: "EBITDA (FY2026E)", val: formatCompact(annualisedEBITDA), vs: formatCompact(fyEBITDA), color: C.blue },
              { label: "Net PBT (FY2026E)", val: formatCompact(annualisedPBT), vs: formatCompact(fyPBT), color: C.purple },
            ].map(({ label, val, vs, color }) => (
              <div key={label} className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="text-xl font-bold mt-1" style={{ color }}>{val}</p>
                <p className="text-xs text-slate-400 mt-1">vs {vs} ({fyLabel} actual)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Row 4: All Periods Table ── */}
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
                { label: "Revenue", vals: r.revenue },
                { label: "Gross Profit", vals: r.grossProfit },
                { label: "EBITDA", vals: r.ebitda },
                { label: "Operating Income", vals: r.operatingIncome },
                { label: "Net Profit (PBT)", vals: r.pbt },
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
