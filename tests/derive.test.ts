import data from "@/data/macwest-dashboard-data.json";
import { buildDashboardModel, deriveRatios } from "@/lib/dashboard/derive";
import { reconcileBenchmarks } from "@/lib/dashboard/validate";
import type { DashboardData } from "@/types/dashboard";

const typed = data as DashboardData;

describe("dashboard derivations", () => {
  it("computes key ratios", () => {
    const ratios = deriveRatios(typed);
    expect(ratios.currentRatio).toBeCloseTo(1.24, 2);
    expect(ratios.quickRatio).toBeCloseTo(0.54, 2);
    expect(ratios.debtToEquity).toBeCloseTo(3.14, 2);
    expect(ratios.dso).toBeCloseTo(64, 0);
    expect(ratios.dpo).toBeCloseTo(27, 0);
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
