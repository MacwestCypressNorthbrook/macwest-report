import { describe, expect, it } from "vitest";
import sample from "@/data/sample-dashboard-data.json";
import type { DashboardData } from "@/types/dashboard";
import { validateDashboardData } from "@/lib/dashboard/validate";
import { changePct, positionColumns, varianceTone } from "@/lib/dashboard/metrics";
import { formatMillions, formatMoney } from "@/lib/dashboard/format";

const data = sample as DashboardData;

describe("data validation", () => {
  it("accepts the committed sample file", () => {
    expect(() => validateDashboardData(data)).not.toThrow();
  });

  it("rejects a profit and loss that does not reconcile", () => {
    const broken = structuredClone(data);
    broken.pnl.find((l) => l.key === "grossProfit")!.values.q1_2026 += 10_000;
    expect(() => validateDashboardData(broken)).toThrow(/gross profit/);
  });
});

describe("variance helpers", () => {
  it("returns no percentage when the sign flips or the base is nil", () => {
    expect(changePct(-3, 2)).toBeNull();
    expect(changePct(5, 0)).toBeNull();
    expect(changePct(15, 10)).toBeCloseTo(0.5);
    expect(changePct(-15, -10)).toBeCloseTo(-0.5);
  });

  it("colours costs and income in opposite directions", () => {
    expect(varianceTone(100, "up-good")).toBe("good");
    expect(varianceTone(100, "up-bad")).toBe("bad");
    expect(varianceTone(0.001, "up-good", 0.0005)).toBe("good");
    expect(varianceTone(0.0001, "up-good", 0.0005)).toBe("flat");
  });
});

describe("financial position", () => {
  it("balances assets against liabilities plus equity", () => {
    for (const c of positionColumns(data)) {
      expect(c.totalAssets).toBeGreaterThan(0);
      expect(c.workingCapital).toBeCloseTo(c.currentAssets - c.currentLiabilities);
    }
  });
});

describe("formatting", () => {
  it("uses brackets for negatives in tables and a minus sign elsewhere", () => {
    expect(formatMillions(-1_250_000)).toBe("(1.25)");
    expect(formatMillions(0)).toBe("–");
    expect(formatMillions(900)).toBe("<0.01");
    expect(formatMoney(-1_500_000)).toBe("−GH¢ 1.50M");
  });
});
