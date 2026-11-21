import type { FigureCell } from "@/components/board/primitives";
import type { VarianceDirection } from "@/types/dashboard";
import { formatMillions, formatPercent, formatPoints } from "@/lib/dashboard/format";
import { changePct, varianceTone } from "@/lib/dashboard/metrics";

export const moneyCell = (v: number | undefined): FigureCell =>
  v === undefined ? { text: "n/a" } : { text: formatMillions(v), negative: v < 0 };

export const deltaCell = (current: number, prior: number, direction: VarianceDirection): FigureCell => {
  const d = current - prior;
  const text = Math.abs(d) < 1 ? "–" : `${d > 0 ? "+" : "−"}${formatMillions(Math.abs(d))}`;
  return { text, tone: varianceTone(d, direction) };
};

/** "n/m" (not meaningful) where the base is zero or the sign flips. */
export const pctCell = (current: number, prior: number, direction: VarianceDirection): FigureCell => {
  const p = changePct(current, prior);
  if (p === null) return { text: "n/m", tone: "flat" };
  return { text: `${p > 0 ? "+" : ""}${formatPercent(p, 0)}`, tone: varianceTone(current - prior, direction) };
};

export const marginCell = (v: number | null): FigureCell =>
  v === null ? { text: "n/m" } : { text: formatPercent(v), negative: v < 0 };

export const pointsCell = (current: number | null, prior: number | null): FigureCell =>
  current === null || prior === null
    ? { text: "n/m", tone: "flat" }
    : { text: formatPoints(current - prior), tone: varianceTone(current - prior, "up-good", 0.0005) };
