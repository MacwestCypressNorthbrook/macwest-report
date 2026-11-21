/** "up-good": an increase is favourable (revenue, profit).
 *  "up-bad": an increase is unfavourable (costs). */
export type VarianceDirection = "up-good" | "up-bad" | "neutral";

export type PeriodId =
  | "q1_2026"
  | "q2_2026"
  | "q3_2026"
  | "ytd_sep_2026"
  | "ytd_sep_2025"
  | "fy_2025";

export interface Period {
  id: PeriodId;
  label: string;
  range: string;
  kind: "quarter" | "ytd" | "year";
  /** True when the figure is the difference between two year-to-date packs. */
  derived?: boolean;
}

export type PnlKey =
  | "revenue"
  | "directCost"
  | "grossProfit"
  | "adminExpenses"
  | "ebit"
  | "financeIncome"
  | "financeCost"
  | "levy"
  | "pbt"
  | "tax"
  | "pat"
  | "ebitda";

export interface PnlLine {
  key: PnlKey;
  label: string;
  direction: VarianceDirection;
  emphasis?: "subtotal" | "total" | "memo";
  values: Record<PeriodId, number>;
}

export interface BreakdownLine {
  label: string;
  values: Partial<Record<PeriodId, number>>;
}

export type BalanceKey =
  | "ppe"
  | "deferredTaxAsset"
  | "prepayments"
  | "receivables"
  | "shortTermInvestment"
  | "dueFromRelated"
  | "currentTaxAsset"
  | "cash"
  | "payables"
  | "borrowings"
  | "taxation"
  | "dueToRelated"
  | "deferredTaxLiability"
  | "equity";

export interface DashboardData {
  meta: {
    company: string;
    reportTitle: string;
    periodLabel: string;
    periodEnding: string;
    currency: string;
    isSample: boolean;
    sources: { id: string; short: string; title: string }[];
  };
  periods: Period[];
  pnl: PnlLine[];
  revenueStreams: BreakdownLine[];
  directCosts: BreakdownLine[];
  adminExpenses: {
    current: PeriodId;
    prior: PeriodId;
    rows: { label: string; current: number; prior: number }[];
    total: { current: number; prior: number };
  };
  balanceSheet: {
    /** Chronological, oldest first. */
    columns: { id: string; label: string }[];
    values: Record<BalanceKey, number[]>;
  };
  cashFlow: {
    period: string;
    lines: { label: string; value: number }[];
    summary: {
      operating: number;
      investing: number;
      financing: number;
      net: number;
      opening: number;
      closing: number;
      borrowingProceeds: number;
      capex: number;
    };
  };
  relatedParties: {
    current: string;
    prior: string;
    rows: { entity: string; dueFrom: number; dueFromPrior: number; dueTo: number; dueToPrior: number }[];
  };
  commentary: {
    headline: string;
    keyMessages: Finding[];
    quarterly: string;
    yearOnYear: string;
    position: string;
    riskScale: { level: RiskLevel; meaning: string }[];
    risks: Risk[];
    dataNotes: string[];
  };
}

export type RiskLevel = "High" | "Medium" | "Low";

/** A figure that supports a statement, with where it comes from. */
export interface Evidence {
  label: string;
  value: number;
  format: "money" | "percent" | "points" | "ratio";
  /** Id into meta.sources. */
  source: string;
  /** Statement or note within the source, e.g. "Note 14". */
  ref: string;
}

export interface Finding {
  title: string;
  text: string;
  evidence: Evidence[];
}

export interface Risk {
  area: string;
  level: RiskLevel;
  /** Why this level was given, against the risk scale. */
  why: string;
  text: string;
  action: string;
  evidence: Evidence[];
}
