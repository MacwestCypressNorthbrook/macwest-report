"use client";

import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { DashboardData } from "@/types/dashboard";
import { buildDashboardModel } from "@/lib/dashboard/derive";
import { Header } from "@/components/dashboard/Header";
import { KPIStrip } from "@/components/dashboard/KPIStrip";
import { MarginBand } from "@/components/dashboard/MarginBand";
import { RatiosTab } from "@/components/dashboard/tabs/RatiosTab";
import { FinancialsTab } from "@/components/dashboard/tabs/FinancialsTab";
import { CashFlowTab } from "@/components/dashboard/tabs/CashFlowTab";
import { ShareholderViewTab } from "@/components/dashboard/tabs/ShareholderViewTab";
import { ExecutiveSummaryTab } from "@/components/dashboard/tabs/ExecutiveSummaryTab";
import { DashboardSidebar, DashboardTab } from "@/components/dashboard/DashboardSidebar";
import { formatPercent, formatTimes } from "@/lib/dashboard/format";

const IncomeStatementTab = dynamic(
  () => import("@/components/dashboard/tabs/IncomeStatementTab").then((m) => m.IncomeStatementTab),
  { ssr: false }
);
const RevenueTab = dynamic(
  () => import("@/components/dashboard/tabs/RevenueTab").then((m) => m.RevenueTab),
  { ssr: false }
);
const BalanceSheetTab = dynamic(
  () => import("@/components/dashboard/tabs/BalanceSheetTab").then((m) => m.BalanceSheetTab),
  { ssr: false }
);

const tabMeta: Record<DashboardTab, { title: string; subtitle: string }> = {
  "Executive Summary": { title: "Executive Summary", subtitle: "Board-level one-page overview — financial highlights, risk register, margin performance and FY projection." },
  "Income Statement": { title: "Income Statement", subtitle: "Revenue, Gross Profit, EBITDA and Net Profit trend — selected period vs prior periods." },
  "Revenue": { title: "Revenue Deep Dive", subtitle: "Client revenue distribution, service-line breakdown and customer concentration risk analysis." },
  "Balance Sheet": { title: "Balance Sheet", subtitle: "Asset composition, funding structure and capital adequacy across reporting periods. Equity position and leverage trajectory." },
  "Cash Flow": { title: "Cash Flow & Working Capital", subtitle: "Cash position, receivables/payables cycle, DSO, DPO and Cash Conversion Cycle." },
  "Ratios": { title: "Financial Ratios Dashboard", subtitle: "Liquidity, leverage, profitability and efficiency diagnostics — computed for the selected reporting period." },
  "Shareholder View": { title: "Shareholder Value Report", subtitle: "ROE, ROA, equity growth and capital structure — assessed for the selected reporting period." },
};

/**
 * Maps P&L period index → the Balance Sheet start index that best represents
 * that period. BS periods: [Mar 2026, Dec 2025, Mar 2025]
 */
const PNL_TO_BS_START: Record<number, number> = {
  0: 0, // Q1 2026  → start at Mar 2026
  1: 1, // FY 2025  → start at Dec 2025
  2: 2, // FY 2024  → start at Mar 2025 (closest available)
  3: 2, // FY 2023  → start at Mar 2025 (only available historical BS)
};

export function DashboardPortal({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("Executive Summary");

  /* ── Selected period index (0 = most recent = Q1 2026) ── */
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(0);

  const handleChangePeriod = useCallback((period: string) => {
    const idx = data.pnl.periods.indexOf(period);
    if (idx !== -1) setSelectedPeriodIdx(idx);
  }, [data.pnl.periods]);

  /* ── Shift both P&L and BS arrays so selected period is always [0] ── */
  const shiftedData = useMemo((): DashboardData => {
    const pi = selectedPeriodIdx;
    const bi = PNL_TO_BS_START[pi] ?? 0;
    const bs = data.balanceSheet;

    return {
      ...data,
      pnl: {
        ...data.pnl,
        periods: data.pnl.periods.slice(pi),
        revenue: data.pnl.revenue.slice(pi),
        directCosts: data.pnl.directCosts.slice(pi),
        grossProfit: data.pnl.grossProfit.slice(pi),
        opex: data.pnl.opex.slice(pi),
        operatingIncome: data.pnl.operatingIncome.slice(pi),
        otherIncome: data.pnl.otherIncome.slice(pi),
        otherExpenses: data.pnl.otherExpenses.slice(pi),
        pbt: data.pnl.pbt.slice(pi),
        pat: data.pnl.pat.slice(pi),
        ebitda: data.pnl.ebitda.slice(pi),
      },
      margins: {
        grossMargin: data.margins.grossMargin.slice(pi),
        operatingMargin: data.margins.operatingMargin.slice(pi),
        netMarginPbt: data.margins.netMarginPbt.slice(pi),
        netMarginPat: data.margins.netMarginPat.slice(pi),
      },
      balanceSheet: {
        ...bs,
        periods: bs.periods.slice(bi),
        currentAssets: bs.currentAssets.slice(bi),
        cashAndBank: bs.cashAndBank.slice(bi),
        receivables: bs.receivables.slice(bi),
        otherCurrentAssets: bs.otherCurrentAssets.slice(bi),
        nonCurrentAssets: bs.nonCurrentAssets.slice(bi),
        totalAssets: bs.totalAssets.slice(bi),
        tradePayables: bs.tradePayables.slice(bi),
        otherCurrentLiabilities: bs.otherCurrentLiabilities.slice(bi),
        currentLiabilities: bs.currentLiabilities.slice(bi),
        payables: bs.payables.slice(bi),
        totalLiabilities: bs.totalLiabilities.slice(bi),
        retainedEarnings: bs.retainedEarnings.slice(bi),
        currentYearEarnings: bs.currentYearEarnings.slice(bi),
        totalEquity: bs.totalEquity.slice(bi),
      },
    };
  }, [data, selectedPeriodIdx]);

  /* ── Build the full model from the shifted data — every tab reads from this ── */
  const model = useMemo(() => buildDashboardModel(shiftedData), [shiftedData]);

  const topCustomer = model.revenueByCustomer.reduce(
    (a, b) => (a.value > b.value ? a : b),
    { name: "", value: 0 }
  );
  const concentration = topCustomer.value / (model.incomeStatementSeries.revenue[0] ?? 1);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { title, subtitle } = tabMeta[activeTab];
  const selectedPeriodLabel = data.pnl.periods[selectedPeriodIdx];
  const priorPeriodLabel = data.pnl.periods[selectedPeriodIdx + 1] ?? null;

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
      <DashboardSidebar
        activeTab={activeTab}
        onChange={setActiveTab}
        model={model}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Mobile Top Bar */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="relative h-6 w-32">
          <Image
            src="/logo-nb.png"
            alt="Northbrook Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      <main className="flex-1 overflow-auto min-w-0">
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 pb-8 pt-4 md:pt-6">

          {/* Header with central period selector */}
          <Header
            meta={model.meta}
            periods={data.pnl.periods}
            selectedPeriod={selectedPeriodLabel}
            onChangePeriod={handleChangePeriod}
          />

          {/* Period context banner */}
          <div className="mb-4 flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm">
            <span className="font-semibold text-slate-700">
              Reporting period: <span className="text-blue-700">{selectedPeriodLabel}</span>
            </span>
            {priorPeriodLabel && (
              <>
                <span className="text-slate-300 hidden md:inline">·</span>
                <span className="text-slate-400">
                  Compared against: <span className="text-slate-600">{priorPeriodLabel}</span>
                </span>
              </>
            )}
            {!priorPeriodLabel && (
              <>
                <span className="text-slate-300 hidden md:inline">·</span>
                <span className="text-slate-400 italic">No prior period available</span>
              </>
            )}
          </div>

          <KPIStrip kpis={model.kpis} />
          <MarginBand margins={model.margins} />

          {/* Tab content card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 ml-4">
                <span className="badge badge-success">ROE {formatPercent(model.shareholderView.roe)}</span>
                <span className={`badge ${model.shareholderView.debtToEquity > 3 ? "badge-warning" : "badge-neutral"}`}>
                  D/E {formatTimes(model.shareholderView.debtToEquity)}
                </span>
                {concentration > 0.85 && (
                  <span className="badge badge-warning">⚠ Conc. {formatPercent(concentration)}</span>
                )}
              </div>
            </div>

            <div className="px-6 py-6">
              {activeTab === "Executive Summary" && (
                <ExecutiveSummaryTab
                  model={model}
                  selectedPeriod={selectedPeriodLabel}
                  priorPeriod={priorPeriodLabel}
                  allPeriods={data.pnl.periods}
                  allRevenue={data.pnl.revenue}
                />
              )}
              {activeTab === "Income Statement" && (
                <IncomeStatementTab
                  periods={model.incomeStatementSeries.periods}
                  revenue={model.incomeStatementSeries.revenue}
                  grossProfit={model.incomeStatementSeries.grossProfit}
                  operatingIncome={model.incomeStatementSeries.operatingIncome}
                  ebitda={model.incomeStatementSeries.ebitda}
                  netMargin={shiftedData.margins.netMarginPbt}
                  grossMargin={shiftedData.margins.grossMargin}
                  operatingMargin={shiftedData.margins.operatingMargin}
                />
              )}
              {/* {activeTab === "Financials" && (
                <FinancialsTab
                  periods={model.incomeStatementSeries.periods}
                  revenue={shiftedData.pnl.revenue}
                  directCosts={shiftedData.pnl.directCosts}
                  grossProfit={shiftedData.pnl.grossProfit}
                  opex={shiftedData.pnl.opex}
                  operatingIncome={shiftedData.pnl.operatingIncome}
                  pbt={shiftedData.pnl.pbt}
                  pat={shiftedData.pnl.pat}
                />
              )} */}
              {activeTab === "Revenue" && (
                <RevenueTab
                  customers={model.revenueByCustomer}
                  segments={model.revenueBySegment}
                  concentration={concentration}
                />
              )}
              {activeTab === "Balance Sheet" && (
                <BalanceSheetTab
                  periods={model.balanceSheetSeries.periods}
                  assets={model.balanceSheetSeries.assets}
                  liabilities={model.balanceSheetSeries.liabilities}
                  equity={model.balanceSheetSeries.equity}
                  currentAssets={model.balanceSheetSeries.currentAssets}
                  nonCurrentAssets={model.balanceSheetSeries.nonCurrentAssets}
                  cashAndBank={model.balanceSheetSeries.cashAndBank}
                  receivables={model.balanceSheetSeries.receivables}
                  otherCurrentAssets={model.balanceSheetSeries.otherCurrentAssets}
                  tradePayables={model.balanceSheetSeries.tradePayables}
                  otherCurrentLiabilities={model.balanceSheetSeries.otherCurrentLiabilities}
                />
              )}
              {activeTab === "Cash Flow" && (
                <CashFlowTab
                  periods={model.cashFlow.periodLabels}
                  cashAtEnd={model.cashFlow.cashAtEnd}
                  receivables={model.cashFlow.receivables}
                  payables={model.cashFlow.payables}
                  ratios={model.ratios}
                />
              )}
              {activeTab === "Ratios" && <RatiosTab ratios={model.ratios} />}
              {activeTab === "Shareholder View" && (
                <ShareholderViewTab data={model.shareholderView} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
