import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import path from "node:path";
import type { DashboardData } from "@/types/dashboard";
import { validateDashboardData } from "@/lib/dashboard/validate";

/** Where the figures come from, in order of preference:
 *  1. DASHBOARD_DATA environment variable (used on Vercel; never in git)
 *  2. data/macwest-dashboard-data.json (local, gitignored)
 *  3. data/sample-dashboard-data.json (committed, synthetic) */
const ENV_VAR = "DASHBOARD_DATA";
const GZ_PREFIX = "gz:";
const REAL = path.join(process.cwd(), "data", "macwest-dashboard-data.json");
const SAMPLE = path.join(process.cwd(), "data", "sample-dashboard-data.json");

/** Accepts plain JSON, or "gz:" + base64 of gzipped JSON (what `yarn data:env` prints). */
export function decodeDashboardData(raw: string): DashboardData {
  const text = raw.trim();
  const json = text.startsWith(GZ_PREFIX)
    ? gunzipSync(Buffer.from(text.slice(GZ_PREFIX.length), "base64")).toString("utf8")
    : text;
  const data = JSON.parse(json) as DashboardData;
  validateDashboardData(data);
  return data;
}

export function loadDashboardData(): DashboardData {
  const fromEnv = process.env[ENV_VAR];
  if (fromEnv) {
    try {
      return decodeDashboardData(fromEnv);
    } catch (e) {
      // Fail the build rather than silently publishing sample figures.
      throw new Error(`${ENV_VAR} is set but could not be read: ${(e as Error).message}`);
    }
  }
  return decodeDashboardData(readFileSync(existsSync(REAL) ? REAL : SAMPLE, "utf8"));
}
