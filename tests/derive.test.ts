import data from "@/data/macwest-dashboard-data.json";
import { buildDashboardModel, deriveRatios } from "@/lib/dashboard/derive";
import { reconcileBenchmarks } from "@/lib/dashboard/validate";
import type { DashboardData } from "@/types/dashboard";

const typed = data as DashboardData;

describe("dashboard derivations", () => {
  it("computes key ratios with Q2 2026 data", () => {
    const ratios = deriveRatios(typed);
    expect(ratios.currentRatio).toBeCloseTo(0.58, 1);
    expect(ratios.quickRatio).toBeCloseTo(0.37, 1);
    expect(ratios.debtToEquity).toBeCloseTo(-4.32, 1);
    expect(ratios.dso).toBeCloseTo(59, 0);
    expect(ratios.dpo).toBeCloseTo(26, 0);
  });

  it("builds dashboard view model", () => {
    const model = buildDashboardModel(typed);
    expect(model.kpis).toHaveLength(4);
    expect(model.margins).toHaveLength(3);
    expect(model.revenueByCustomer.length).toBeGreaterThan(0);
  });

  it("reconciles benchmark metrics", () => {
    expect(reconcileBenchmarks(typed)).toHaveLength(0);
  });
});
