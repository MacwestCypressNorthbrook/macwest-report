"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { formatCompact, formatMoney, formatPercent, formatYAxisMoney } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import { CfoCommentary, SectionNote } from "@/components/dashboard/CfoCommentary";

const C = {
  navy: "#1B3A5C",
  blue: "#2563eb",
  purple: "#7c3aed",
  emerald: "#059669",
  amber: "#d97706",
  red: "#dc2626",
  teal: "#0891b2",
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
          <span className="font-medium text-slate-900">{formatCompact(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

function DonutTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-900">{d.name}</p>
      <p className="text-slate-500">{formatCompact(d.value)}</p>
      <p className="text-slate-400 text-xs">{formatPercent(d.value / (payload[0]?.payload?.total ?? d.value))}</p>
    </div>
  );
}

function MetricSummaryCard({ label, current, prior, currentLabel, priorLabel, color }: {
  label: string;
  current: number;
  prior?: number;
  currentLabel: string;
  priorLabel: string;
  color: string;
}) {
  const hasComp = prior !== undefined;
  const change = hasComp && prior !== 0 ? (current - prior) / Math.abs(prior) : 0;
  const up = change > 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{formatCompact(current)}</p>
      <p className="text-xs text-slate-400 mt-0.5">{currentLabel}</p>
      {hasComp && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}{formatPercent(Math.abs(change))}
          </span>
          <span className="text-xs text-slate-400">vs {formatCompact(prior!)} ({priorLabel})</span>
        </div>
      )}
    </div>
  );
}

export function BalanceSheetTab({
  periods,
  assets,
  liabilities,
  equity,
  currentAssets,
  nonCurrentAssets,
  cashAndBank,
  receivables,
  otherCurrentAssets,
  tradePayables,
  otherCurrentLiabilities,
}: {
  periods: string[];
  assets: number[];
  liabilities: number[];
  equity: number[];
  currentAssets: number[];
  nonCurrentAssets: number[];
  cashAndBank: number[];
  receivables: number[];
  otherCurrentAssets: number[];
  tradePayables: number[];
  otherCurrentLiabilities: number[];
}) {
  /* ── Grouped bar per period ── */
  const groupedData = periods.map((p, i) => ({
    period: p,
    Assets: assets[i] ?? 0,
    Liabilities: liabilities[i] ?? 0,
    Equity: equity[i] ?? 0,
  }));

  /* ── Asset composition donut (Mar 2026) ── */
  const totalAsset = assets[0] ?? 1;
  const assetDonut = [
    { name: "Cash & Bank", value: Math.max(cashAndBank[0] ?? 0, 0), color: C.navy, total: totalAsset },
    { name: "Receivables", value: receivables[0] ?? 0, color: C.blue, total: totalAsset },
    { name: "Other Current", value: otherCurrentAssets[0] ?? 0, color: C.teal, total: totalAsset },
    { name: "Non-Current", value: nonCurrentAssets[0] ?? 0, color: C.slate, total: totalAsset },
  ].filter((d) => d.value > 0).map((d) => ({ ...d, pct: d.value / totalAsset }));

  type AssetEntry = typeof assetDonut[number];

  /* ── Funding structure donut (Mar 2026) ── */
  const totalFunding = (liabilities[0] ?? 0) + (equity[0] ?? 0);
  const fundingDonut = [
    { name: "Trade Payables", value: tradePayables[0] ?? 0, color: C.red },
    { name: "Other Liabilities", value: otherCurrentLiabilities[0] ?? 0, color: C.amber },
    { name: "Total Equity", value: equity[0] ?? 0, color: C.emerald },
  ].filter((d) => d.value > 0).map((d) => ({ ...d, pct: d.value / totalFunding }));

  type FundingEntry = typeof fundingDonut[number];

  const renderInnerLabel = (cx: number, cy: number, title: string, value: number) => (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="700">{formatCompact(value)}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#94a3b8" fontSize="10">{title}</text>
    </g>
  );

  const renderPctLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.06) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight="600">
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  const slate = "#94a3b8";

  return (
    <div className="space-y-5">
      <CfoCommentary
        tone="neutral"
        title="Balance Sheet as at 31 March 2026 — Strengthening Equity Position on a Leveraged Base"
        body={
          <>
            Total assets grew to <strong>GHS 39.25M</strong> at quarter-end (Dec 2025: GHS 32.72M; Mar 2025: GHS 3.78M), reflecting significant balance sheet expansion driven by increased contract activity. Current assets of <strong>GHS 38.82M</strong> (98.9% of total assets) dominate the structure — comprising cash of GHS 4.76M, trade receivables of GHS 11.99M, and other current assets of GHS 22.08M (largely prepayments and contract assets). The equity base strengthened materially from <strong>GHS 3.19M (Dec 2025) to GHS 8.05M (Mar 2026)</strong>, a GHS 4.85M increase attributable to retained Q1 earnings — reflecting the Board's decision to reinvest profits for growth. Total liabilities of <strong>GHS 31.20M</strong> are entirely current in nature; the Company carries no long-term debt. While the leverage position remains elevated (Debt/Equity: 3.88x), the trajectory of equity accumulation is positive and the balance sheet is expected to strengthen progressively as earnings are retained.
          </>
        }
      />

      {/* ── Row 1: Summary metric cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricSummaryCard label="Total Assets" current={assets[0] ?? 0} prior={assets[1]} currentLabel={periods[0] ?? ""} priorLabel={periods[1] ?? ""} color={C.navy} />
        <MetricSummaryCard label="Total Liabilities" current={liabilities[0] ?? 0} prior={liabilities[1]} currentLabel={periods[0] ?? ""} priorLabel={periods[1] ?? ""} color={C.red} />
        <MetricSummaryCard label="Total Equity" current={equity[0] ?? 0} prior={equity[1]} currentLabel={periods[0] ?? ""} priorLabel={periods[1] ?? ""} color={C.emerald} />
      </div>

      {/* ── Row 2: Composition donuts ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Asset composition */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Asset Composition</h3>
            <SectionNote>Illustrates how the Company's GHS 39.25M asset base is deployed. A highly current-asset-weighted structure (98.9%) is typical for a services business — assets are held primarily as receivables and working capital, rather than fixed plant or equipment. The critical management focus is ensuring receivables (GHS 11.99M) are collected promptly to maintain liquidity.</SectionNote>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-full sm:w-[220px] h-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={assetDonut} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={2} dataKey="value" labelLine={false} label={renderPctLabel}>
                    {assetDonut.map((d: AssetEntry, i: number) => <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {assetDonut.map((d: AssetEntry) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{formatPercent(d.pct)}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${d.pct * 100}%`, background: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Funding structure */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">Funding Structure</h3>
            <SectionNote>Shows how the Company's operations are funded. Equity (GHS 8.05M, 20.5%) provides the ownership buffer; the remaining 79.5% is funded by trade and other payables. As earnings are retained and the equity base builds, this ratio will improve. No bank debt is currently outstanding — all liabilities represent operational obligations.</SectionNote>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="w-full sm:w-[220px] h-[200px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={fundingDonut} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={2} dataKey="value" labelLine={false} label={renderPctLabel}>
                    {fundingDonut.map((d: FundingEntry, i: number) => <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {fundingDonut.map((d: FundingEntry) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{formatPercent(d.pct)}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${d.pct * 100}%`, background: d.color }} />
                  </div>
                </div>
              ))}
              <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs text-slate-600 font-medium">
                  Debt ratio: <strong className="text-slate-900">{formatPercent((liabilities[0] ?? 0) / (assets[0] ?? 1))}</strong> — leveraged funding structure. Equity base is strengthening as Q1 earnings are retained.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Period grouped bar ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">Balance Sheet — Period Comparison</h3>
          <SectionNote>Three-period comparison tracks balance sheet growth from Mar 2025 through Dec 2025 to Mar 2026. The rapid expansion of the asset base (from GHS 3.78M to GHS 39.25M in 12 months) reflects the scale of contract activity secured. The corresponding growth in equity from GHS 1.72M to GHS 8.05M demonstrates that shareholders' value is increasing alongside the balance sheet expansion.</SectionNote>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={groupedData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 12, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={formatYAxisMoney} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} iconType="circle" iconSize={8} />
              <Bar dataKey="Assets" fill={C.navy} radius={[5, 5, 0, 0]} barSize={28} />
              <Bar dataKey="Liabilities" fill={C.red} radius={[5, 5, 0, 0]} barSize={28} />
              <Bar dataKey="Equity" fill={C.emerald} radius={[5, 5, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Row 4: Condensed BS table ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-4">Condensed Balance Sheet</h3>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th className="w-56">Line Item</th>
                {periods.map((p) => <th key={p} className="text-right">{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Current Assets", values: currentAssets, bold: false, indent: 1 },
                { label: "  — Cash & Bank", values: cashAndBank, bold: false, indent: 2 },
                { label: "  — Receivables", values: receivables, bold: false, indent: 2 },
                { label: "  — Other Current Assets", values: otherCurrentAssets, bold: false, indent: 2 },
                { label: "Non-Current Assets", values: nonCurrentAssets, bold: false, indent: 1 },
                { label: "TOTAL ASSETS", values: assets, bold: true, indent: 0 },
                { label: "Trade Payables", values: tradePayables, bold: false, indent: 1 },
                { label: "Other Current Liabilities", values: otherCurrentLiabilities, bold: false, indent: 1 },
                { label: "TOTAL LIABILITIES", values: liabilities, bold: true, indent: 0 },
                { label: "TOTAL EQUITY", values: equity, bold: true, indent: 0 },
              ].map(({ label, values, bold, indent }) => (
                <tr key={label} className={bold ? "tbl-accent" : ""}>
                  <td className={`${bold ? "font-bold text-slate-900" : "text-slate-600"} ${indent >= 2 ? "pl-8" : indent === 1 ? "pl-4" : ""}`}>{label}</td>
                  {values.map((v, i) => (
                    <td key={i} className={`text-right tabular-nums ${bold ? "font-bold text-slate-900" : "text-slate-700"} ${v < 0 ? "text-red-600" : ""}`}>
                      {formatMoney(v)}
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
