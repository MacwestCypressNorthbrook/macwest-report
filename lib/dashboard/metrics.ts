import type { BalanceKey, DashboardData, PeriodId, PnlKey, VarianceDirection } from "@/types/dashboard";

export const pnlValue = (data: DashboardData, key: PnlKey, period: PeriodId): number =>
  data.pnl.find((l) => l.key === key)?.values[period] ?? 0;

export const margin = (data: DashboardData, key: PnlKey, period: PeriodId): number | null => {
  const rev = pnlValue(data, "revenue", period);
  return rev > 0 ? pnlValue(data, key, period) / rev : null;
};

/** % change against the absolute prior. Null when the base is zero or the sign
 *  flips, where a percentage would mislead (e.g. profit turning into a loss). */
export const changePct = (current: number, prior: number): number | null => {
  if (prior === 0) return null;
  if (Math.sign(current) !== Math.sign(prior) && current !== 0) return null;
  return (current - prior) / Math.abs(prior);
};

export type Tone = "good" | "bad" | "flat";

/** `epsilon` is the smallest movement worth colouring: GH¢1 for money,
 *  pass a small value (e.g. 0.0005) for ratios and margins. */
export const varianceTone = (delta: number, direction: VarianceDirection = "up-good", epsilon = 1): Tone => {
  if (direction === "neutral" || Math.abs(delta) < epsilon) return "flat";
  return (direction === "up-good" ? delta > 0 : delta < 0) ? "good" : "bad";
};

export interface PositionColumn {
  label: string;
  totalAssets: number;
  currentAssets: number;
  currentLiabilities: number;
  totalLiabilities: number;
  cash: number;
  borrowings: number;
  equity: number;
  netRelated: number;
  workingCapital: number;
  currentRatio: number;
}

const CURRENT_ASSETS: BalanceKey[] = [
  "prepayments",
  "receivables",
  "shortTermInvestment",
  "dueFromRelated",
  "currentTaxAsset",
  "cash",
];
const NON_CURRENT_ASSETS: BalanceKey[] = ["ppe", "deferredTaxAsset"];
const CURRENT_LIABILITIES: BalanceKey[] = ["payables", "borrowings", "taxation", "dueToRelated"];

export const positionColumns = (data: DashboardData): PositionColumn[] => {
  const v = data.balanceSheet.values;
  const sum = (keys: BalanceKey[], i: number) => keys.reduce((s, k) => s + v[k][i], 0);
  return data.balanceSheet.columns.map((c, i) => {
    const currentAssets = sum(CURRENT_ASSETS, i);
    const currentLiabilities = sum(CURRENT_LIABILITIES, i);
    return {
      label: c.label,
      currentAssets,
      totalAssets: currentAssets + sum(NON_CURRENT_ASSETS, i),
      currentLiabilities,
      totalLiabilities: currentLiabilities + v.deferredTaxLiability[i],
      cash: v.cash[i],
      borrowings: v.borrowings[i],
      equity: v.equity[i],
      netRelated: v.dueFromRelated[i] - v.dueToRelated[i],
      workingCapital: currentAssets - currentLiabilities,
      currentRatio: currentLiabilities ? currentAssets / currentLiabilities : 0,
    };
  });
};
