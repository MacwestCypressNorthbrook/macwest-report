import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { decodeDashboardData, loadDashboardData } from "@/lib/dashboard/load";

const SAMPLE = "data/sample-dashboard-data.json";
const sampleText = readFileSync(SAMPLE, "utf8");
const encoded = execFileSync("node", ["scripts/encode-dashboard-data.mjs", SAMPLE], { encoding: "utf8" });

describe("dashboard data loading", () => {
  afterEach(() => {
    delete process.env.DASHBOARD_DATA;
  });

  it("decodes the gzip+base64 value printed by data:env", () => {
    expect(encoded.startsWith("gz:")).toBe(true);
    expect(decodeDashboardData(encoded)).toEqual(JSON.parse(sampleText));
  });

  it("accepts plain JSON too", () => {
    expect(decodeDashboardData(sampleText).meta.company).toBe(JSON.parse(sampleText).meta.company);
  });

  it("prefers the environment variable over files", () => {
    process.env.DASHBOARD_DATA = encoded;
    expect(loadDashboardData()).toEqual(JSON.parse(sampleText));
  });

  it("fails loudly instead of falling back when the variable is malformed", () => {
    process.env.DASHBOARD_DATA = "gz:not-valid";
    expect(() => loadDashboardData()).toThrow(/DASHBOARD_DATA is set but could not be read/);
  });
});
