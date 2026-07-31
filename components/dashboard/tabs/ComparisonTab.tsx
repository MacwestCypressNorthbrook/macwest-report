"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
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
import { formatCompact } from "@/lib/dashboard/format";
import {
  ComparisonBreakdown,
  ComparisonRow,
  PeriodComparison,
  VarianceDirection,
} from "@/types/dashboard";

const C = {
  prior: "#cbd5e1",
  current: "#1a1d1f",
  good: "#0d9488",
  bad: "#eb5757",
  muted: "#94a3b8",
};

/** Percentage change against the absolute prior value, so sign flips read correctly.
 *  Returns null when there is no meaningful base to grow from. */
const variancePct = (current: number, prior: number): number | null => {
  if (prior === 0) return null;
  return (current - prior) / Math.abs(prior);
};

const formatVariancePct = (pct: number | null): string => {
  if (pct === null) return "n/m";
  const capped = Math.abs(pct) >= 100;
  return `${pct >= 0 ? "+" : "-"}${capped ? "> 10,000" : (Math.abs(pct) * 100).toFixed(1)}%`;
};

const formatPts = (current: number, prior: number): string => {
  const pts = (current - prior) * 100;
  return `${pts >= 0 ? "+" : ""}${pts.toFixed(1)} pts`;
};

/** Favourability of a movement, used only for colour. */
const varianceTone = (
  delta: number,
  direction: VarianceDirection = "up-good"
): "good" | "bad" | "flat" => {
  if (direction === "neutral" || delta === 0) return "flat";
  const favourable = direction === "up-good" ? delta > 0 : delta < 0;
  return favourable ? "good" : "bad";
};

const toneClass = (tone: "good" | "bad" | "flat"): string =>
  tone === "good"
    ? "text-teal-600"
    : tone === "bad"
    ? "text-red-500"
    : "text-slate-500";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-sm">
      <p className="font-semibold text-slate-900 mb-2 pb-2 border-b border-slate-100">
        {label}
      </p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-6 py-0.5">
          <span className="text-slate-500">{e.name}</span>
          <span className="font-medium text-slate-900 tabular-nums">
            {formatCompact(e.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function VarianceCard({
  row,
  priorLabel,
  currentLabel,
}: {
  row: ComparisonRow;
  priorLabel: string;
  currentLabel: string;
}) {
  const delta = row.current - row.prior;
  const tone = varianceTone(delta, row.direction);
  const pct = variancePct(row.current, row.prior);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {row.label}
      </p>
      <p
        className={`mt-2 text-xl font-bold tabular-nums ${
          row.current < 0 ? "text-red-500" : "text-slate-900"
        }`}
      >
        {formatCompact(row.current)}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-400 tabular-nums">
        {currentLabel} · from {formatCompact(row.prior)} in {priorLabel}
      </p>
      <div className="mt-3 flex items-baseline gap-2 border-t border-slate-100 pt-2">
        <span className={`text-sm font-bold tabular-nums ${toneClass(tone)}`}>
          {formatVariancePct(pct)}
        </span>
        <span className="text-[11px] text-slate-400 tabular-nums">
          {delta >= 0 ? "+" : "-"}
          {formatCompact(Math.abs(delta)).replace("-", "")}
        </span>
      </div>
    </div>
  );
}

function VarianceTable({
  rows,
  priorLabel,
  currentLabel,
  defaultDirection = "up-good",
  labelHeader = "Line Item",
}: {
  rows: ComparisonRow[];
  priorLabel: string;
  currentLabel: string;
  defaultDirection?: VarianceDirection;
  labelHeader?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 pr-4 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {labelHeader}
            </th>
            <th className="text-right py-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
              {priorLabel}
            </th>
            <th className="text-right py-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
              {currentLabel}
            </th>
            <th className="text-right py-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Variance
            </th>
            <th className="text-right py-2 pl-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              %
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const delta = row.current - row.prior;
            const tone = varianceTone(delta, row.direction ?? defaultDirection);
            const isTotal = row.emphasis === "total";
            const isSubtotal = row.emphasis === "subtotal";
            return (
              <tr
                key={row.label}
                className={`border-b border-slate-100 ${
                  isTotal
                    ? "bg-slate-100"
                    : isSubtotal
                    ? "bg-slate-50"
                    : ""
                }`}
              >
                <td
                  className={`py-2 pr-4 text-sm ${
                    isTotal || isSubtotal
                      ? "font-bold text-slate-900"
                      : "font-medium text-slate-700"
                  }`}
                >
                  {row.label}
                </td>
                <td className="text-right py-2 px-3 text-sm tabular-nums text-slate-500">
                  {formatCompact(row.prior)}
                </td>
                <td
                  className={`text-right py-2 px-3 text-sm font-semibold tabular-nums ${
                    row.current < 0 ? "text-red-500" : "text-slate-900"
                  }`}
                >
                  {formatCompact(row.current)}
                </td>
                <td
                  className={`text-right py-2 px-3 text-sm font-semibold tabular-nums ${toneClass(
                    tone
                  )}`}
                >
                  {delta >= 0 ? "+" : "-"}
                  {formatCompact(Math.abs(delta)).replace("-", "")}
                </td>
                <td
                  className={`text-right py-2 pl-3 text-sm font-semibold tabular-nums ${toneClass(
                    tone
                  )}`}
                >
                  {formatVariancePct(variancePct(row.current, row.prior))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BreakdownCard({
  breakdown,
  priorLabel,
  currentLabel,
}: {
  breakdown: ComparisonBreakdown;
  priorLabel: string;
  currentLabel: string;
}) {
  const total = breakdown.rows.reduce(
    (acc, r) => ({ prior: acc.prior + r.prior, current: acc.current + r.current }),
    { prior: 0, current: 0 }
  );
  const showsTotal = breakdown.direction !== "neutral";
  const rows = showsTotal
    ? [
        ...breakdown.rows,
        {
          label: breakdown.totalLabel ?? "Total",
          prior: total.prior,
          current: total.current,
          direction: breakdown.direction,
          emphasis: "total" as const,
        },
      ]
    : breakdown.rows;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-base font-bold text-slate-900 mb-3">{breakdown.title}</h3>
      <VarianceTable
        rows={rows}
        priorLabel={priorLabel}
        currentLabel={currentLabel}
        defaultDirection={breakdown.direction}
        labelHeader="Category"
      />
      {breakdown.footnote && (
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-400">
          {breakdown.footnote}
        </p>
      )}
    </div>
  );
}

function InsightCard({
  tone,
  title,
  body,
}: {
  tone: "critical" | "warning" | "neutral";
  title: string;
  body: string;
}) {
  const styles = {
    critical: { bar: "bg-red-500", chip: "bg-red-50 text-red-700", label: "Critical" },
    warning: { bar: "bg-amber-500", chip: "bg-amber-50 text-amber-700", label: "Watch" },
    neutral: { bar: "bg-slate-300", chip: "bg-slate-100 text-slate-600", label: "Context" },
  }[tone];

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 pl-6">
      <span className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.chip}`}
        >
          {styles.label}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

export function ComparisonTab({ comparisons }: { comparisons: PeriodComparison[] }) {
  const [activeId, setActiveId] = useState(comparisons[0]?.id ?? "");
  const active = comparisons.find((c) => c.id === activeId) ?? comparisons[0];

  const headlineRows = useMemo(() => {
    if (!active) return [];
    const wanted = ["Revenue", "Gross Profit", "EBITDA", "Profit After Tax"];
    return wanted
      .map((label) => active.pnl.find((r) => r.label === label))
      .filter((r): r is ComparisonRow => Boolean(r));
  }, [active]);

  const chartData = useMemo(() => {
    if (!active) return [];
    const wanted = [
      "Revenue",
      "Direct Cost",
      "Gross Profit",
      "General & Administrative Expenses",
      "Profit Before Tax",
    ];
    const shortLabel: Record<string, string> = {
      "General & Administrative Expenses": "G&A",
      "Profit Before Tax": "PBT",
    };
    return wanted
      .map((label) => {
        const row = active.pnl.find((r) => r.label === label);
        if (!row) return null;
        return {
          line: shortLabel[label] ?? label,
          [active.priorLabel]: row.prior,
          [active.currentLabel]: row.current,
        };
      })
      .filter(Boolean) as Record<string, string | number>[];
  }, [active]);

  if (!active) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No period comparisons are configured.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Comparison selector */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Comparison
        </span>
        {comparisons.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
              c.id === active.id
                ? "bg-[#941c1c] text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-900">{active.title}</h2>
        <p className="mt-0.5 text-sm text-slate-500">{active.subtitle}</p>
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-400">
          <span className="font-semibold uppercase tracking-wide">Basis</span> ·{" "}
          {active.sourceNote}
        </p>
      </div>

      {/* Headline variance cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {headlineRows.map((row) => (
          <VarianceCard
            key={row.label}
            row={row}
            priorLabel={active.priorLabel}
            currentLabel={active.currentLabel}
          />
        ))}
      </div>

      {/* Side-by-side chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          {active.priorLabel} vs {active.currentLabel} — Key Lines
        </h2>
        <div style={{ height: 300, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" debounce={200}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="line"
                tick={{ fontSize: 12, fill: C.muted }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  Math.abs(v) >= 1e6
                    ? `${(v / 1e6).toFixed(0)}M`
                    : `${(v / 1e3).toFixed(0)}K`
                }
                tick={{ fontSize: 11, fill: C.muted }}
                tickLine={false}
                axisLine={false}
                width={50}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <ReferenceLine y={0} stroke="#cbd5e1" />
              <Bar dataKey={active.priorLabel} fill={C.prior} radius={[4, 4, 0, 0]} barSize={26} />
              <Bar dataKey={active.currentLabel} radius={[4, 4, 0, 0]} barSize={26}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={(d[active.currentLabel] as number) < 0 ? C.bad : C.current}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full P&L variance */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-bold text-slate-900 mb-3">
          Statement of Comprehensive Income
        </h2>
        <VarianceTable
          rows={active.pnl}
          priorLabel={active.priorLabel}
          currentLabel={active.currentLabel}
        />
      </div>

      {/* Margins */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-base font-bold text-slate-900 mb-3">Margin Movement</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-4 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Margin
                </th>
                <th className="text-right py-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                  {active.priorLabel}
                </th>
                <th className="text-right py-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                  {active.currentLabel}
                </th>
                <th className="text-right py-2 pl-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {active.margins.map((m) => {
                const tone = varianceTone(m.current - m.prior, "up-good");
                const chip = (v: number) =>
                  v >= 0.15
                    ? "bg-teal-50 text-teal-700"
                    : v >= 0
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-700";
                return (
                  <tr key={m.label} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-sm font-medium text-slate-700">
                      {m.label}
                    </td>
                    <td className="text-right py-2 px-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold tabular-nums ${chip(
                          m.prior
                        )}`}
                      >
                        {(m.prior * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right py-2 px-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold tabular-nums ${chip(
                          m.current
                        )}`}
                      >
                        {(m.current * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td
                      className={`text-right py-2 pl-3 text-sm font-semibold tabular-nums ${toneClass(
                        tone
                      )}`}
                    >
                      {formatPts(m.current, m.prior)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdowns */}
      {active.breakdowns.map((b) => (
        <BreakdownCard
          key={b.title}
          breakdown={b}
          priorLabel={active.priorLabel}
          currentLabel={active.currentLabel}
        />
      ))}

      {/* Insights */}
      <div>
        <h2 className="mb-3 text-base font-bold text-slate-900">
          What the Numbers Say
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {active.insights.map((i) => (
            <InsightCard key={i.title} tone={i.tone} title={i.title} body={i.body} />
          ))}
        </div>
      </div>
    </div>
  );
}
