"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,

  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAxisMillions, formatMoney } from "@/lib/dashboard/format";

export interface SeriesDef {
  key: string;
  name: string;
  color: string;
}

const axisTick = { fill: "var(--ink-3)", fontSize: 12 };

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-3 text-sm shadow-lg">
      <p className="mb-1.5 font-semibold text-ink">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-6 py-0.5">
          <span className="flex items-center gap-2 text-ink-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium tabular-nums text-ink">{formatMoney(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function LegendRow({ series }: { series: SeriesDef[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
          {s.name}
        </li>
      ))}
    </ul>
  );
}

export function GroupedBarChart({
  data,
  series,
  height = 300,
  ariaLabel,
}: {
  data: Record<string, string | number>[];
  series: SeriesDef[];
  height?: number;
  ariaLabel: string;
}) {
  return (
    <figure aria-label={ariaLabel}>
      <LegendRow series={series} />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height }}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatAxisMillions} tick={axisTick} axisLine={false} tickLine={false} width={48} tickCount={6} allowDecimals={false} />
            <ReferenceLine y={0} stroke="var(--border-strong)" />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--surface-muted)" }} />
            {series.map((s) => (
              <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function TrendLineChart({
  data,
  series,
  height = 280,
  ariaLabel,
}: {
  data: Record<string, string | number>[];
  series: SeriesDef[];
  height?: number;
  ariaLabel: string;
}) {
  return (
    <figure aria-label={ariaLabel}>
      <LegendRow series={series} />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height }}>
          <LineChart data={data} margin={{ top: 8, right: 28, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval={0} />
            <YAxis tickFormatter={formatAxisMillions} tick={axisTick} axisLine={false} tickLine={false} width={48} tickCount={6} allowDecimals={false} />
            <ReferenceLine y={0} stroke="var(--border-strong)" />
            <Tooltip content={<ChartTooltip />} />
            {series.map((s) => (
              <Line
                key={s.key}
                type="linear"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: s.color, strokeWidth: 0 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

/** Horizontal bars: diverging list for a cash-flow style bridge. Pure CSS so it prints crisply. */
export function DivergingBars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => {
        const w = `${(Math.abs(r.value) / max) * 50}%`;
        const neg = r.value < 0;
        return (
          <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] items-center gap-3 text-sm">
            <span className="text-ink-2">{r.label}</span>
            <span className="relative h-3 rounded-sm bg-surface-muted" aria-hidden>
              <span className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
              <span
                className={`absolute inset-y-0 rounded-sm ${neg ? "bg-bad/70" : "bg-good/70"}`}
                style={neg ? { right: "50%", width: w } : { left: "50%", width: w }}
              />
            </span>
            <span className={`w-24 text-right font-medium tabular-nums ${neg ? "text-bad" : "text-ink"}`}>{formatMoney(r.value)}</span>
          </li>
        );
      })}
    </ul>
  );
}
