"use client";

import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { DashboardData } from "@/types/dashboard";
import { buildDashboardModel } from "@/lib/dashboard/derive";
import { Header } from "@/components/dashboard/Header";

const ExecutiveSummaryTab = dynamic(
  () => import("@/components/dashboard/tabs/ExecutiveSummaryTab").then((m) => m.ExecutiveSummaryTab),
  { ssr: false }
);
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
const CashFlowTab = dynamic(
  () => import("@/components/dashboard/tabs/CashFlowTab").then((m) => m.CashFlowTab),
  { ssr: false }
);
const RatiosTab = dynamic(
  () => import("@/components/dashboard/tabs/RatiosTab").then((m) => m.RatiosTab),
  { ssr: false }
);
const ShareholderViewTab = dynamic(
  () => import("@/components/dashboard/tabs/ShareholderViewTab").then((m) => m.ShareholderViewTab),
  { ssr: false }
);

type DashboardTab = "Overview" | "Income" | "Revenue" | "Balance Sheet" | "Cash Flow" | "Ratios" | "Shareholders";

const tabs: { key: DashboardTab; label: string }[] = [
  { key: "Overview", label: "Overview" },
  { key: "Income", label: "Income" },
  { key: "Revenue", label: "Revenue" },
  { key: "Balance Sheet", label: "Balance Sheet" },
  { key: "Cash Flow", label: "Cash Flow" },
  { key: "Ratios", label: "Ratios" },
  { key: "Shareholders", label: "Shareholders" },
];

const PNL_TO_BS_START: Record<number, number> = {
  0: 0,  // Q2 2026 → H1 2026 BS (30 Jun)
  1: 1,  // Q1 2026 → Q1 2026 BS (31 Mar)
  2: 0,  // H1 2026 → H1 2026 BS (30 Jun)
  3: 2,  // FY 2025 → FY 2025 BS
  4: 3,  // FY 2024 → FY 2024 BS
  5: 4,  // FY 2023 → FY 2023 BS
};

export function DashboardPortal({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("Overview");
  const [selectedPeriodIdx, setSelectedPeriodIdx] = useState(0);

  const handleChangePeriod = useCallback((period: string) => {
    const idx = data.pnl.periods.indexOf(period);
    if (idx !== -1) setSelectedPeriodIdx(idx);
  }, [data.pnl.periods]);

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

  const model = useMemo(() => buildDashboardModel(shiftedData), [shiftedData]);

  const topCustomer = model.revenueByCustomer.reduce(
    (a, b) => (a.value > b.value ? a : b),
    { name: "", value: 0 }
  );
  const concentration = topCustomer.value / (model.incomeStatementSeries.revenue[0] ?? 1);

  const selectedPeriodLabel = data.pnl.periods[selectedPeriodIdx];
  const priorPeriodLabel = data.pnl.periods[selectedPeriodIdx + 1] ?? null;

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <main className="mx-auto max-w-[1400px] px-4 md:px-8 pb-12 pt-6">
        <Header
          meta={model.meta}
          periods={data.pnl.periods}
          selectedPeriod={selectedPeriodLabel}
          onChangePeriod={handleChangePeriod}
        />

        <div className="mb-6 border-b border-slate-200">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map(({ key, label }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-3 text-sm font-semibold transition-all relative whitespace-nowrap ${
                    isActive ? "text-[#941c1c]" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {label}
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#941c1c] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "Overview" && (
          <ExecutiveSummaryTab
            model={model}
            selectedPeriod={selectedPeriodLabel}
            priorPeriod={priorPeriodLabel}
          />
        )}
        {activeTab === "Income" && (
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
        {activeTab === "Revenue" && (
          <RevenueTab
            customers={model.revenueByCustomer}
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
          />
        )}
        {activeTab === "Cash Flow" && (
          <CashFlowTab
            periods={model.cashFlow.periodLabels}
            cashAtEnd={model.cashFlow.cashAtEnd}
            ratios={model.ratios}
          />
        )}
        {activeTab === "Ratios" && <RatiosTab ratios={model.ratios} />}
        {activeTab === "Shareholders" && (
          <ShareholderViewTab data={model.shareholderView} />
        )}
      </main>
    </div>
  );
}
