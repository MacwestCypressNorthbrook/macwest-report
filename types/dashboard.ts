export type PeriodSeries = string[];

export interface PnlData {
  periods: PeriodSeries;
  revenue: number[];
  directCosts: number[];
  grossProfit: number[];
  opex: number[];
  operatingIncome: number[];
  otherIncome: number[];
  otherExpenses: number[];
  pbt: number[];
  pat: number[];
  ebitda: number[];
}

export interface MarginData {
  grossMargin: number[];
  operatingMargin: number[];
  netMarginPbt: number[];
  netMarginPat: number[];
}

export interface CustomerRevenueItem {
  name: string;
  q1_2026: number;
  fy_2025: number;
}

export interface SegmentRevenueItem {
  name: string;
  q1_2026: number;
  fy_2025: number;
}

export interface BalanceSheetData {
  periods: string[];
  currentAssets: number[];
  cashAndBank: number[];
  receivables: number[];
  otherCurrentAssets: number[];
  nonCurrentAssets: number[];
  totalAssets: number[];
  tradePayables: number[];
  otherCurrentLiabilities: number[];
  currentLiabilities: number[];
  payables: number[];
  totalLiabilities: number[];
  retainedEarnings: number[];
  currentYearEarnings: number[];
  totalEquity: number[];
}

export interface DashboardData {
  meta: {
    company: string;
    period: string;
    periodEnding: string;
    currency: string;
  };
  pnl: PnlData;
  margins: MarginData;
  customerRevenue: { customers: CustomerRevenueItem[] };
  segmentRevenue: { segments: SegmentRevenueItem[] };
  balanceSheet: BalanceSheetData;
  benchmarks: {
    topCustomerShare: number;
    revenueQ12026: number;
    grossProfitQ12026: number;
    operatingIncomeQ12026: number;
    pbtQ12026: number;
  };
  commentary: {
    executiveSummary: string;
    pnlAnalysis: string;
    balanceSheetAnalysis: string;
    risks: { area: string; impact: string; description: string }[];
  };
}

export interface KpiCard {
  label: string;
  value: number;
  priorValue: number;
  yoy: number;
  tone: "navy" | "green" | "blue" | "purple";
  unit?: "money" | "percent";
  sparkline: number[]; // full series, oldest → newest
}

export interface MarginCard {
  label: string;
  current: number;
  prior: number;
}

export interface RatioModel {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  debtToEquity: number;
  equityRatio: number;
  debtRatio: number;
  roe: number;
  roa: number;
  grossMargin: number;
  operatingMargin: number;
  netMarginPAT: number;
  dso: number;
  dpo: number;
  ccc: number;
  netWorkingCapital: number;
  ebitdaMargin: number;
}

export interface DashboardModel {
  meta: DashboardData["meta"];
  kpis: KpiCard[];
  margins: MarginCard[];
  commentary: DashboardData["commentary"];
  incomeStatementSeries: {
    periods: string[];
    revenue: number[];
    grossProfit: number[];
    opex: number[];
    operatingIncome: number[];
    pbt: number[];
    pat: number[];
    ebitda: number[];
  };
  revenueByCustomer: { name: string; value: number }[];
  revenueBySegment: { name: string; q1: number; fy25: number }[];
  balanceSheetSeries: {
    periods: string[];
    assets: number[];
    liabilities: number[];
    equity: number[];
    currentAssets: number[];
    nonCurrentAssets: number[];
    cashAndBank: number[];
    receivables: number[];
    otherCurrentAssets: number[];
    tradePayables: number[];
    otherCurrentLiabilities: number[];
  };
  ratios: RatioModel;
  cashFlow: {
    cashAtEnd: number[];
    periodLabels: string[];
    receivables: number[];
    payables: number[];
  };
  shareholderView: {
    revenueGrowth: number;
    pbtGrowth: number;
    equityGrowth: number;
    ebitdaGrowth: number;
    roa: number;
    roe: number;
    debtToEquity: number;
    equityRatio: number;
  };
}
