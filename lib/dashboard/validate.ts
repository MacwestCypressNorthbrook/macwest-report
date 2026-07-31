import { DashboardData } from "@/types/dashboard";

const hasPositiveNumbers = (arr: number[]): boolean => arr.every((x) => Number.isFinite(x));

export const validateDashboardData = (data: DashboardData): void => {
  const required = [
    data.pnl.revenue,
    data.pnl.grossProfit,
    data.pnl.operatingIncome,
    data.pnl.pbt,
    data.balanceSheet.totalAssets,
    data.balanceSheet.totalLiabilities,
    data.balanceSheet.totalEquity,
  ];

  if (!required.every(hasPositiveNumbers)) {
    throw new Error("Dashboard data contains invalid numeric values.");
  }

  if (!data.customerRevenue.customers.length || !data.segmentRevenue.segments.length) {
    throw new Error("Revenue distribution data is missing.");
  }
};

export const reconcileBenchmarks = (data: DashboardData): string[] => {
  const diffs: string[] = [];
  const epsilon = 1;

  if (Math.abs(data.pnl.revenue[0] - data.benchmarks.revenueQ22026) > epsilon) {
    diffs.push("Revenue mismatch");
  }
  if (Math.abs(data.pnl.grossProfit[0] - data.benchmarks.grossProfitQ22026) > epsilon) {
    diffs.push("Gross Profit mismatch");
  }
  if (Math.abs(data.pnl.operatingIncome[0] - data.benchmarks.operatingIncomeQ22026) > epsilon) {
    diffs.push("Operating Income mismatch");
  }
  if (Math.abs(data.pnl.pbt[0] - data.benchmarks.pbtQ22026) > epsilon) {
    diffs.push("PBT mismatch");
  }

  return diffs;
};
