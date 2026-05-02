"use client";

import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { RatioModel } from "@/types/dashboard";
import { formatDays, formatMoney, formatPercent, formatTimes } from "@/lib/dashboard/format";
import { CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import { CfoCommentary, SectionNote } from "@/components/dashboard/CfoCommentary";

const C = { navy: "#1a1d1f", maroon: "#941c1c", blue: "#2f80ed", purple: "#7c3aed", amber: "#f2994a", red: "#eb5757", teal: "#0d9488" };

type RatioStatus = "good" | "warn" | "bad";

function getStatus(value: number, good: number, bad: number, higherIsBetter = true): RatioStatus {
  if (higherIsBetter) {
    if (value >= good) return "good";
    if (value >= bad) return "warn";
    return "bad";
  } else {
    if (value <= good) return "good";
    if (value <= bad) return "warn";
    return "bad";
  }
}

const statusConfig = {
  good: { color: "#0d9488", bg: "bg-teal-50", text: "text-teal-700", label: "Healthy", Icon: CheckCircle },
  warn: { color: "#d97706", bg: "bg-amber-50", text: "text-amber-700", label: "Monitor", Icon: AlertCircle },
  bad:  { color: "#dc2626", bg: "bg-red-50", text: "text-red-700", label: "Below Benchmark", Icon: XCircle },
};

function GaugeCard({ label, value, formatted, status, benchmark, benchmarkLabel, fill }: {
  label: string;
  value: number;
  formatted: string;
  status: RatioStatus;
  benchmark: number;
  benchmarkLabel: string;
  fill: number; // 0–100 pct for the progress bar
}) {
  const cfg = statusConfig[status];
  const Icon = cfg.Icon;
  const clampedFill = Math.min(Math.max(fill, 0), 100);

  return (
    <div className="ratio-gauge-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
          <Icon className="h-3 w-3" />
          {cfg.label}
        </span>
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1">{formatted}</p>
      <div className="relative mt-3">
        {/* Track */}
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${clampedFill}%`, background: cfg.color }}
          />
        </div>
        {/* Benchmark tick */}
        <div
          className="absolute top-0 h-2 w-0.5 bg-slate-400"
          style={{ left: `${Math.min((benchmark / (benchmark * 2)) * 100, 95)}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
        <span>0</span>
        <span className="flex items-center gap-0.5"><Info className="h-3 w-3" /> Benchmark: {benchmarkLabel}</span>
      </div>
    </div>
  );
}

function RadarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl text-sm">
      <p className="font-semibold text-slate-900">{payload[0]?.payload?.metric}</p>
      <p className="text-slate-500">Score: {payload[0]?.value?.toFixed(0)}/100</p>
    </div>
  );
}

export function RatiosTab({ ratios }: { ratios: RatioModel }) {
  const gauges = [
    {
      label: "Current Ratio",
      value: ratios.currentRatio,
      formatted: formatTimes(ratios.currentRatio),
      status: getStatus(ratios.currentRatio, 1.5, 1.0),
      benchmark: 1.5,
      benchmarkLabel: "> 1.5x",
      fill: (ratios.currentRatio / 3) * 100,
    },
    {
      label: "Quick Ratio",
      value: ratios.quickRatio,
      formatted: formatTimes(ratios.quickRatio),
      status: getStatus(ratios.quickRatio, 1.0, 0.5),
      benchmark: 1.0,
      benchmarkLabel: "> 1.0x",
      fill: (ratios.quickRatio / 2) * 100,
    },
    {
      label: "Cash Ratio",
      value: ratios.cashRatio,
      formatted: formatTimes(ratios.cashRatio),
      status: getStatus(ratios.cashRatio, 0.5, 0.2),
      benchmark: 0.5,
      benchmarkLabel: "> 0.5x",
      fill: (ratios.cashRatio / 1) * 100,
    },
    {
      label: "Debt-to-Equity",
      value: ratios.debtToEquity,
      formatted: formatTimes(ratios.debtToEquity),
      status: getStatus(ratios.debtToEquity, 2.0, 3.5, false),
      benchmark: 2.0,
      benchmarkLabel: "< 2.0x",
      fill: Math.max(100 - (ratios.debtToEquity / 8) * 100, 0),
    },
    {
      label: "Return on Equity",
      value: ratios.roe,
      formatted: formatPercent(ratios.roe),
      status: getStatus(ratios.roe, 0.15, 0.08),
      benchmark: 0.15,
      benchmarkLabel: "> 15%",
      fill: Math.min(ratios.roe * 100, 100),
    },
    {
      label: "Net Margin (PAT)",
      value: ratios.netMarginPAT,
      formatted: formatPercent(ratios.netMarginPAT),
      status: getStatus(ratios.netMarginPAT, 0.1, 0.05),
      benchmark: 0.1,
      benchmarkLabel: "> 10%",
      fill: Math.min(ratios.netMarginPAT * 100, 100),
    },
  ];

  /* ── Radar data (normalised 0-100) ── */
  const radarData = [
    { metric: "Liquidity", value: Math.min((ratios.currentRatio / 2) * 100, 100) },
    { metric: "Quick\nCoverage", value: Math.min((ratios.quickRatio / 1.5) * 100, 100) },
    { metric: "Profitability", value: Math.min(ratios.netMarginPAT * 500, 100) }, // Scaled for visibility
    { metric: "ROE", value: Math.min((ratios.roe / 0.15) * 100, 100) },
    { metric: "Solvency", value: Math.max(100 - (ratios.debtToEquity / 5) * 100, 0) },
    { metric: "EBITDA\nMargin", value: Math.min(ratios.ebitdaMargin * 100, 100) },
  ];

  /* ── Working capital bar ── */
  const wcData = [
    { metric: "DSO (days)", value: ratios.dso, color: C.blue },
    { metric: "DPO (days)", value: ratios.dpo, color: C.navy },
    { metric: "NWC (GHS M)", value: ratios.netWorkingCapital / 1e6, color: C.teal },
  ];

  const tableRows = [
    { category: "Liquidity", metric: "Current Ratio", value: ratios.currentRatio, fmt: formatTimes, benchmark: "> 1.5x", status: getStatus(ratios.currentRatio, 1.5, 1.0) },
    { category: "Liquidity", metric: "Quick Ratio", value: ratios.quickRatio, fmt: formatTimes, benchmark: "> 1.0x", status: getStatus(ratios.quickRatio, 1.0, 0.5) },
    { category: "Liquidity", metric: "Cash Ratio", value: ratios.cashRatio, fmt: formatTimes, benchmark: "> 0.5x", status: getStatus(ratios.cashRatio, 0.5, 0.2) },
    { category: "Liquidity", metric: "Net Working Capital", value: ratios.netWorkingCapital, fmt: formatMoney, benchmark: "Positive", status: ratios.netWorkingCapital > 0 ? "good" : "bad" as RatioStatus },
    { category: "Leverage", metric: "Debt-to-Equity", value: ratios.debtToEquity, fmt: formatTimes, benchmark: "< 2.0x", status: getStatus(ratios.debtToEquity, 2.0, 3.5, false) },
    { category: "Leverage", metric: "Equity Ratio", value: ratios.equityRatio, fmt: formatPercent, benchmark: "> 40%", status: getStatus(ratios.equityRatio, 0.4, 0.2) },
    { category: "Leverage", metric: "Debt Ratio", value: ratios.debtRatio, fmt: formatPercent, benchmark: "< 60%", status: getStatus(ratios.debtRatio, 0.6, 0.8, false) },
    { category: "Profitability", metric: "Return on Equity", value: ratios.roe, fmt: formatPercent, benchmark: "> 15%", status: getStatus(ratios.roe, 0.15, 0.08) },
    { category: "Profitability", metric: "Return on Assets", value: ratios.roa, fmt: formatPercent, benchmark: "> 5%", status: getStatus(ratios.roa, 0.05, 0.02) },
    { category: "Profitability", metric: "Gross Margin", value: ratios.grossMargin, fmt: formatPercent, benchmark: "> 30%", status: getStatus(ratios.grossMargin, 0.3, 0.15) },
    { category: "Profitability", metric: "Operating Margin", value: ratios.operatingMargin, fmt: formatPercent, benchmark: "> 10%", status: getStatus(ratios.operatingMargin, 0.1, 0.05) },
    { category: "Efficiency", metric: "DSO", value: ratios.dso, fmt: formatDays, benchmark: "< 45 days", status: getStatus(ratios.dso, 45, 75, false) },
    { category: "Efficiency", metric: "DPO", value: ratios.dpo, fmt: formatDays, benchmark: "> 30 days", status: getStatus(ratios.dpo, 30, 15) },
    { category: "Efficiency", metric: "CCC", value: ratios.ccc, fmt: (v: number) => `${v.toFixed(0)} days`, benchmark: "Low is better", status: ratios.ccc < 0 ? "good" : ratios.ccc < 60 ? "warn" : "bad" as RatioStatus },
  ];

  const statusIcon: Record<RatioStatus, React.ReactNode> = {
    good: <CheckCircle className="h-4 w-4 text-teal-600" />,
    warn: <AlertCircle className="h-4 w-4 text-amber-600" />,
    bad: <XCircle className="h-4 w-4 text-red-600" />,
  };

  return (
    <div className="space-y-5">
      <CfoCommentary
        tone="positive"
        title="Key Financial Ratios — Liquidity Strength and Operational Efficiency"
        body={
          <>
            Macwest's Q1 2026 ratios reflect the current investment phase. Despite reporting negative 
            ROE and net margin, <strong>the company is expected to meet its profitability targets</strong> as 
            projects are completed on schedule and new ones are onboarded. The onboarding of Ada 1, 2 &amp; 3; 
            Anlo 1 &amp; 2; MDF; the Bakanta Road Project; and other related projects is expected to stabilise 
            operations and reduce overdependence on ENI. Liquidity remains healthy with a Current Ratio of 1.19x 
            and GH¢ 5.76M in cash reserves.
          </>
        }
      />

      {/* ── Row 1: Gauge cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {gauges.map((g) => (
          <GaugeCard key={g.label} {...g} />
        ))}
      </div>

      {/* ── Row 2: Radar + Working Capital bars ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Financial Health Radar</h3>
            <SectionNote>Normalised financial dimension scores. The current profile shows exceptional liquidity and efficiency (favourable DSO/CCC) but suppressed profitability scores — reflecting the GH¢ 5.45M marketing investment in Q1.</SectionNote>
          </div>
          <div style={{ height: 280, minHeight: 280 }}>
            <ResponsiveContainer width="100%" height="100%" debounce={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="value" stroke={C.navy} fill={C.navy} fillOpacity={0.25} strokeWidth={2} />
                <Tooltip content={<RadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Working Capital Cycle</h3>
            <SectionNote>DSO of 44 days confirms highly efficient collection processes. Macwest settles suppliers within 25 days (DPO) on average. The resulting 19-day Cash Conversion Cycle is well below sector averages, providing the company with significant liquidity to fund its strategic expansion.</SectionNote>
          </div>
          <div className="space-y-4 mt-2">
            {[
              { label: "Days Sales Outstanding (DSO)", value: ratios.dso, formatted: formatDays(ratios.dso), status: getStatus(ratios.dso, 45, 75, false), color: C.blue, note: "Target < 45 days" },
              { label: "Days Payables Outstanding (DPO)", value: ratios.dpo, formatted: formatDays(ratios.dpo), status: getStatus(ratios.dpo, 30, 15) as RatioStatus, color: C.navy, note: "Based on trade payables — target > 30 days to improve cash retention" },
              { label: "Cash Conversion Cycle (CCC)", value: Math.abs(ratios.ccc), formatted: `${ratios.ccc.toFixed(0)} days`, status: ratios.ccc < 30 ? "good" : "warn" as RatioStatus, color: ratios.ccc < 30 ? C.teal : C.amber, note: "Working capital gap — days between paying suppliers and receiving from clients. Lower is better." },
            ].map(({ label, value, formatted, status, color, note }) => {
              const cfg = statusConfig[status];
              return (
                <div key={label} className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <span className={`text-xl font-bold`} style={{ color }}>{formatted}</span>
                  </div>
                  <p className="text-xs text-slate-400">{note}</p>
                  <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    <cfg.Icon className="h-3 w-3" />
                    {cfg.label}
                  </div>
                </div>
              );
            })}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-600 font-semibold">Net Working Capital: <strong className="text-slate-900">{formatMoney(ratios.netWorkingCapital)}</strong></p>
              <p className="text-xs text-slate-500 mt-0.5">Positive NWC confirms current assets exceed current obligations — the Company can meet short-term liabilities as they fall due.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Full ratio table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Complete Ratio Analysis</h3>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Category</th>
                <th>Ratio</th>
                <th className="text-right">Q1 2026</th>
                <th>Benchmark</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => {
                const prevCategory = i > 0 ? tableRows[i - 1].category : null;
                const isNewCategory = row.category !== prevCategory;
                const cfg = statusConfig[row.status];
                return (
                  <tr key={row.metric} className={isNewCategory ? "border-t-2 border-slate-200" : ""}>
                    <td className="text-xs font-semibold uppercase tracking-wide text-slate-400">{isNewCategory ? row.category : ""}</td>
                    <td className="font-medium text-slate-800">{row.metric}</td>
                    <td className="text-right font-bold text-slate-900 tabular-nums">{row.fmt(row.value)}</td>
                    <td className="text-slate-500 text-sm">{row.benchmark}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                        {statusIcon[row.status]}
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
