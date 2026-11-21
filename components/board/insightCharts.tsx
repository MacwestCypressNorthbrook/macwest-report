"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAxisMillions, formatMoney, formatPercent } from "@/lib/dashboard/format";
import { niceTicks } from "@/lib/dashboard/ticks";

const axisTick = { fill: "var(--ink-3)", fontSize: 12 };
const MINUS = "−";

function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
      {items.map((s) => (
        <li key={s.name} className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
          {s.name}
        </li>
      ))}
    </ul>
  );
}

function Box({ title, rows }: { title?: string; rows: [string, string][] }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3.5 py-3 text-sm shadow-lg">
      {title && <p className="mb-1.5 font-semibold text-ink">{title}</p>}
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-6 py-0.5">
          <span className="text-ink-2">{k}</span>
          <span className="font-medium tabular-nums text-ink">{v}</span>
        </div>
      ))}
    </div>
  );
}

const signedM = (v: number) => `${v > 0 ? "+" : v < 0 ? MINUS : ""}${(Math.abs(v) / 1_000_000).toFixed(2)}`;

// ---- 1. Profit bridge ----------------------------------------------------

export interface BridgeStep {
  label: string;
  value: number;
  /** "total" bars start at zero; "delta" bars float from the running total. */
  kind: "total" | "delta";
}

export function ProfitBridge({ steps, ariaLabel }: { steps: BridgeStep[]; ariaLabel: string }) {
  // Running total after each step; a "total" step resets it.
  const ends = steps.reduce<number[]>((acc, s, i) => [...acc, s.kind === "total" ? s.value : (acc[i - 1] ?? 0) + s.value], []);
  const data = steps.map((s, i) => {
    const end = ends[i];
    const start = s.kind === "total" ? 0 : (ends[i - 1] ?? 0);
    return {
      label: s.label,
      range: [Math.min(start, end), Math.max(start, end)] as [number, number],
      value: s.value,
      kind: s.kind,
      end,
      text: s.kind === "total" ? (s.value < 0 ? `(${(Math.abs(s.value) / 1e6).toFixed(2)})` : (s.value / 1e6).toFixed(2)) : signedM(s.value),
    };
  });
  const axis = niceTicks(data.flatMap((d) => d.range));
  const fill = (d: (typeof data)[number]) =>
    d.kind === "total" ? "var(--chart-1)" : d.value >= 0 ? "var(--good)" : "var(--bad)";

  return (
    <figure aria-label={ariaLabel}>
      <Legend
        items={[
          { name: "Profit after tax", color: "var(--chart-1)" },
          { name: "Increased profit", color: "var(--good)" },
          { name: "Reduced profit", color: "var(--bad)" },
        ]}
      />
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 320 }}>
          <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke="var(--grid)" />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval={0} />
            <YAxis tickFormatter={formatAxisMillions} tick={axisTick} axisLine={false} tickLine={false} width={48} ticks={axis.ticks} domain={axis.domain} />
            <ReferenceLine y={0} stroke="var(--border-strong)" />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)" }}
              content={({ active, payload }) => {
                const d = active && payload?.[0]?.payload;
                if (!d) return null;
                return (
                  <Box
                    title={d.label}
                    rows={
                      d.kind === "total"
                        ? [["Profit / (loss) after tax", formatMoney(d.value)]]
                        : [
                            ["Effect on profit", `${d.value >= 0 ? "+" : MINUS}${formatMoney(Math.abs(d.value))}`],
                            ["Running total", formatMoney(d.end)],
                          ]
                    }
                  />
                );
              }}
            />
            <Bar dataKey="range" isAnimationActive={false} radius={3} maxBarSize={72}>
              {data.map((d) => (
                <Cell key={d.label} fill={fill(d)} />
              ))}
              <LabelList dataKey="text" position="top" fill="var(--ink-2)" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

// ---- 2. Mix as 100% stacked bars ----------------------------------------

export function MixBars({
  rows,
  categories,
  ariaLabel,
}: {
  rows: { label: string; values: Record<string, number> }[];
  categories: { key: string; color: string }[];
  ariaLabel: string;
}) {
  const data = rows.map((r) => {
    const total = categories.reduce((t, c) => t + Math.max(0, r.values[c.key] ?? 0), 0) || 1;
    const out: Record<string, string | number> = { label: r.label };
    for (const c of categories) {
      out[c.key] = Math.max(0, r.values[c.key] ?? 0) / total;
      out[`${c.key}__abs`] = r.values[c.key] ?? 0;
    }
    return out;
  });
  return (
    <figure aria-label={ariaLabel}>
      <Legend items={categories.map((c) => ({ name: c.key, color: c.color }))} />
      <div style={{ height: rows.length * 64 + 36 }}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: rows.length * 64 + 36 }}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
            <XAxis type="number" domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(v) => formatPercent(v, 0)} tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" tick={{ ...axisTick, fill: "var(--ink)" }} axisLine={false} tickLine={false} width={72} />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Box
                    title={String(label)}
                    rows={categories.map((c) => [
                      c.key,
                      `${formatPercent(Number(payload[0].payload[c.key]), 0)} · ${formatMoney(Number(payload[0].payload[`${c.key}__abs`]))}`,
                    ])}
                  />
                ) : null
              }
            />
            {categories.map((c) => (
              <Bar key={c.key} dataKey={c.key} stackId="mix" fill={c.color} isAnimationActive={false}>
                <LabelList
                  dataKey={c.key}
                  position="center"
                  fill="var(--surface)"
                  fontSize={12}
                  fontWeight={600}
                  formatter={(v: unknown) => (Number(v) >= 0.07 ? formatPercent(Number(v), 0) : "")}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

// ---- 4. Related-party balances by company -------------------------------

export function RelatedPartyBars({
  rows,
  ariaLabel,
}: {
  rows: { entity: string; dueFrom: number; dueTo: number }[];
  ariaLabel: string;
}) {
  const height = rows.length * 38 + 40;
  const axis = niceTicks(rows.flatMap((r) => [r.dueFrom, r.dueTo]));
  return (
    <figure aria-label={ariaLabel}>
      <Legend
        items={[
          { name: "Owed to MacWest", color: "var(--chart-1)" },
          { name: "Owed by MacWest", color: "var(--chart-3)" },
        ]}
      />
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height }}>
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barGap={2} barCategoryGap="20%">
            <CartesianGrid horizontal={false} stroke="var(--grid)" />
            <XAxis type="number" tickFormatter={formatAxisMillions} tick={axisTick} axisLine={false} tickLine={false} ticks={axis.ticks} domain={axis.domain} />
            <YAxis type="category" dataKey="entity" tick={{ ...axisTick, fill: "var(--ink)" }} axisLine={false} tickLine={false} width={104} interval={0} />
            <Tooltip
              cursor={{ fill: "var(--surface-muted)" }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <Box
                    title={String(label)}
                    rows={[
                      ["Owed to MacWest", formatMoney(payload[0].payload.dueFrom)],
                      ["Owed by MacWest", formatMoney(payload[0].payload.dueTo)],
                      ["Net", formatMoney(payload[0].payload.dueFrom - payload[0].payload.dueTo)],
                    ]}
                  />
                ) : null
              }
            />
            <Bar dataKey="dueFrom" name="Owed to MacWest" fill="var(--chart-1)" radius={[0, 3, 3, 0]} isAnimationActive={false}>
              <LabelList dataKey="dueFrom" position="right" fill="var(--ink-2)" fontSize={11} formatter={(v: unknown) => (Number(v) > 0 ? (Number(v) / 1e6).toFixed(2) : "")} />
            </Bar>
            <Bar dataKey="dueTo" name="Owed by MacWest" fill="var(--chart-3)" radius={[0, 3, 3, 0]} isAnimationActive={false}>
              <LabelList dataKey="dueTo" position="right" fill="var(--ink-2)" fontSize={11} formatter={(v: unknown) => (Number(v) > 0 ? (Number(v) / 1e6).toFixed(2) : "")} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
