import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { DashboardData } from "@/types/dashboard";
import { validateDashboardData } from "@/lib/dashboard/validate";

/** The real figures live in a gitignored file. Builds without it fall back to
 *  the committed synthetic sample, which the UI labels as sample data. */
const REAL = path.join(process.cwd(), "data", "macwest-dashboard-data.json");
const SAMPLE = path.join(process.cwd(), "data", "sample-dashboard-data.json");

export function loadDashboardData(): DashboardData {
  const file = existsSync(REAL) ? REAL : SAMPLE;
  const data = JSON.parse(readFileSync(file, "utf8")) as DashboardData;
  validateDashboardData(data);
  return data;
}
