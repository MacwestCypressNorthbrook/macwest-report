import { DashboardData, DashboardModel, KpiCard, MarginCard, RatioModel } from "@/types/dashboard";

const safeDivide = (numerator: number, denominator: number): number => {
  if (denominator === 0) return 0;
  return numerator / denominator;
};

const buildKpis = (data: DashboardData): KpiCard[] => {
  const r = data.pnl;
  return [
    { label: "Revenue", value: r.revenue[0], priorValue: r.revenue[1], yoy: safeDivide(r.revenue[0] - r.revenue[1], Math.abs(r.revenue[1])), tone: "navy" },
    { label: "Gross Profit", value: r.grossProfit[0], priorValue: r.grossProfit[1], yoy: safeDivide(r.grossProfit[0] - r.grossProfit[1], Math.abs(r.grossProfit[1])), tone: "green" },
    { label: "EBITDA", value: r.ebitda[0], priorValue: r.ebitda[1], yoy: safeDivide(r.ebitda[0] - r.ebitda[1], Math.abs(r.ebitda[1])), tone: "blue" },
    { label: "Net Profit (PBT)", value: r.pbt[0], priorValue: r.pbt[1], yoy: safeDivide(r.pbt[0] - r.pbt[1], Math.abs(r.pbt[1])), tone: "purple" },
  ];
};

const buildMargins = (data: DashboardData): MarginCard[] => {
  return [
    {
      label: "Gross Margin",
      current: safeDivide(data.pnl.grossProfit[0], data.pnl.revenue[0]),
      prior: safeDivide(data.pnl.grossProfit[1], data.pnl.revenue[1]),
    },
    {
      label: "Operating Margin",
      current: safeDivide(data.pnl.operatingIncome[0], data.pnl.revenue[0]),
      prior: safeDivide(data.pnl.operatingIncome[1], data.pnl.revenue[1]),
    },
    {
      label: "Net Margin (PBT)",
      current: safeDivide(data.pnl.pbt[0], data.pnl.revenue[0]),
      prior: safeDivide(data.pnl.pbt[1], data.pnl.revenue[1]),
    },
  ];
};

export const deriveRatios = (data: DashboardData): RatioModel => {
  const bs = data.balanceSheet;
  const r = data.pnl;

  const currentRatio = safeDivide(bs.currentAssets[0], bs.currentLiabilities[0]);
  const quickRatio = safeDivide(bs.cashAndBank[0] + bs.receivables[0], bs.currentLiabilities[0]);
  const cashRatio = safeDivide(bs.cashAndBank[0], bs.currentLiabilities[0]);
  const debtToEquity = safeDivide(bs.totalLiabilities[0], bs.totalEquity[0]);
  const equityRatio = safeDivide(bs.totalEquity[0], bs.totalAssets[0]);
  const debtRatio = safeDivide(bs.totalLiabilities[0], bs.totalAssets[0]);
  const dso = safeDivide(bs.receivables[0], r.revenue[0]) * 91;
  const dpo = safeDivide(bs.payables[0], r.directCosts[0]) * 91;
  const ccc = dso - dpo;
  const netMarginPAT = safeDivide(r.pat[0], r.revenue[0]);
  const grossMargin = safeDivide(r.grossProfit[0], r.revenue[0]);
  const operatingMargin = safeDivide(r.operatingIncome[0], r.revenue[0]);
  const roe = safeDivide(r.pat[0], bs.totalEquity[0]);
  const roa = safeDivide(r.pat[0], bs.totalAssets[0]);
  const netWorkingCapital = bs.currentAssets[0] - bs.currentLiabilities[0];
  const ebitdaMargin = safeDivide(r.ebitda[0], r.revenue[0]);

  return {
    currentRatio, quickRatio, cashRatio,
    debtToEquity, equityRatio, debtRatio,
    roe, roa, grossMargin, operatingMargin, netMarginPAT,
    dso, dpo, ccc, netWorkingCapital, ebitdaMargin,
  };
};

export const buildDashboardModel = (data: DashboardData): DashboardModel => {
  const ratios = deriveRatios(data);
  const growth = (curr: number, prev: number): number => safeDivide(curr - prev, Math.abs(prev));

  return {
    meta: data.meta,
    kpis: buildKpis(data),
    margins: buildMargins(data),
    incomeStatementSeries: {
      periods: data.pnl.periods,
      revenue: data.pnl.revenue,
      grossProfit: data.pnl.grossProfit,
      opex: data.pnl.opex,
      operatingIncome: data.pnl.operatingIncome,
      pbt: data.pnl.pbt,
      pat: data.pnl.pat,
      ebitda: data.pnl.ebitda,
    },
    revenueByCustomer: data.customerRevenue.customers.map((c) => ({ name: c.name, value: c.q1_2026 })),
    revenueBySegment: data.segmentRevenue.segments.map((s) => ({ name: s.name, q1: s.q1_2026, fy25: s.fy_2025 })),
    balanceSheetSeries: {
      periods: data.balanceSheet.periods,
      assets: data.balanceSheet.totalAssets,
      liabilities: data.balanceSheet.totalLiabilities,
      equity: data.balanceSheet.totalEquity,
      currentAssets: data.balanceSheet.currentAssets,
      nonCurrentAssets: data.balanceSheet.nonCurrentAssets,
      cashAndBank: data.balanceSheet.cashAndBank,
      receivables: data.balanceSheet.receivables,
      otherCurrentAssets: data.balanceSheet.otherCurrentAssets,
      tradePayables: data.balanceSheet.tradePayables,
      otherCurrentLiabilities: data.balanceSheet.otherCurrentLiabilities,
    },
    ratios,
    cashFlow: {
      cashAtEnd: data.balanceSheet.cashAndBank,
      periodLabels: data.balanceSheet.periods,
      receivables: data.balanceSheet.receivables,
      payables: data.balanceSheet.currentLiabilities,
    },
    shareholderView: {
      revenueGrowth: growth(data.pnl.revenue[0], data.pnl.revenue[1]),
      pbtGrowth: growth(data.pnl.pbt[0], data.pnl.pbt[1]),
      equityGrowth: growth(data.balanceSheet.totalEquity[0], data.balanceSheet.totalEquity[1]),
      ebitdaGrowth: growth(data.pnl.ebitda[0], data.pnl.ebitda[1]),
      roa: ratios.roa,
      roe: ratios.roe,
      debtToEquity: ratios.debtToEquity,
      equityRatio: ratios.equityRatio,
    },
  };
};
