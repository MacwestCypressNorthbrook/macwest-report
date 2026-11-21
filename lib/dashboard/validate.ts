import type { DashboardData, PnlKey } from "@/types/dashboard";

const TOLERANCE = 2; // GH¢ — source packs are rounded to the cedi in places

/** Throws if the data file is malformed or its subtotals do not reconcile. */
export function validateDashboardData(data: DashboardData): void {
  const line = (k: PnlKey) => data.pnl.find((l) => l.key === k);
  for (const p of data.periods) {
    const v = (k: PnlKey) => {
      const n = line(k)?.values[p.id];
      if (typeof n !== "number" || !Number.isFinite(n)) {
        throw new Error(`Missing ${k} for ${p.id}`);
      }
      return n;
    };
    const checks: [string, number, number][] = [
      ["gross profit", v("revenue") - v("directCost"), v("grossProfit")],
      ["operating profit", v("grossProfit") - v("adminExpenses"), v("ebit")],
      ["profit before tax", v("ebit") + v("financeIncome") - v("financeCost") - v("levy"), v("pbt")],
      ["profit after tax", v("pbt") + v("tax"), v("pat")],
    ];
    for (const [name, computed, stated] of checks) {
      if (Math.abs(computed - stated) > TOLERANCE) {
        throw new Error(`${p.id}: ${name} does not reconcile (${computed} vs ${stated})`);
      }
    }
  }

  const n = data.balanceSheet.columns.length;
  for (const [key, series] of Object.entries(data.balanceSheet.values)) {
    if (series.length !== n) throw new Error(`Balance sheet ${key} has ${series.length} values, expected ${n}`);
  }
}
