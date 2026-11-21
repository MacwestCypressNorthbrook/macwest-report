import type { BalanceKey, DashboardData } from "@/types/dashboard";
import { formatMoney, formatRatio } from "@/lib/dashboard/format";
import { moneyCell } from "@/lib/dashboard/cells";
import { positionColumns, varianceTone } from "@/lib/dashboard/metrics";
import { FigureTable, Panel, Section, StatTile, type FigureRow } from "@/components/board/primitives";
import { DivergingBars, TrendLineChart } from "@/components/board/charts";

const ASSETS: [BalanceKey, string][] = [
  ["ppe", "Property, plant & equipment"],
  ["deferredTaxAsset", "Deferred tax asset"],
  ["dueFromRelated", "Due from related parties"],
  ["prepayments", "Prepayments"],
  ["receivables", "Trade & other receivables"],
  ["shortTermInvestment", "Short-term investment"],
  ["currentTaxAsset", "Current tax asset"],
  ["cash", "Cash and bank"],
];
const LIABILITIES: [BalanceKey, string][] = [
  ["borrowings", "Borrowings"],
  ["payables", "Trade & other payables"],
  ["dueToRelated", "Due to related parties"],
  ["taxation", "Taxation"],
  ["deferredTaxLiability", "Deferred tax"],
];

export function Position({ data }: { data: DashboardData }) {
  const pos = positionColumns(data);
  const now = pos[pos.length - 1];
  const yearAgo = pos[0];
  const v = data.balanceSheet.values;
  const cf = data.cashFlow;

  const line = (key: BalanceKey, label: string): FigureRow => ({ label, cells: v[key].map(moneyCell) });
  const rows: FigureRow[] = [
    ...ASSETS.map(([k, l]) => line(k, l)),
    { label: "Total assets", emphasis: "subtotal", cells: pos.map((p) => moneyCell(p.totalAssets)) },
    ...LIABILITIES.map(([k, l]) => line(k, l)),
    { label: "Total liabilities", emphasis: "subtotal", cells: pos.map((p) => moneyCell(p.totalLiabilities)) },
    { label: "Total equity", emphasis: "total", cells: v.equity.map(moneyCell) },
  ];

  const ratioRows: FigureRow[] = [
    { label: "Current ratio", cells: pos.map((p) => ({ text: formatRatio(p.currentRatio), negative: p.currentRatio < 1 })) },
    { label: "Net working capital", cells: pos.map((p) => moneyCell(p.workingCapital)) },
    { label: "Net due from related parties", cells: pos.map((p) => moneyCell(p.netRelated)) },
  ];

  const signed = (c: number, p: number) => `${c - p >= 0 ? "+" : "−"}${formatMoney(Math.abs(c - p))}`;

  return (
    <Section id="position" index="04" title="Financial position and cash" lede={data.commentary.position} breakBefore>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label={`Current ratio, ${now.label}`}
          value={formatRatio(now.currentRatio)}
          negative={now.currentRatio < 1}
          delta={`${now.currentRatio - yearAgo.currentRatio >= 0 ? "+" : "−"}${Math.abs(now.currentRatio - yearAgo.currentRatio).toFixed(2)}x`}
          tone={varianceTone(now.currentRatio - yearAgo.currentRatio, "up-good", 0.005)}
          comparison={`${yearAgo.label}: ${formatRatio(yearAgo.currentRatio)}`}
        />
        <StatTile
          label="Net working capital"
          value={formatMoney(now.workingCapital)}
          negative={now.workingCapital < 0}
          delta={signed(now.workingCapital, yearAgo.workingCapital)}
          tone={varianceTone(now.workingCapital - yearAgo.workingCapital, "up-good")}
          comparison={`${yearAgo.label}: ${formatMoney(yearAgo.workingCapital)}`}
        />
        <StatTile
          label={`Cash used in operations, ${cf.period}`}
          value={formatMoney(cf.summary.operating)}
          negative={cf.summary.operating < 0}
          comparison={`Funded by ${formatMoney(cf.summary.borrowingProceeds)} of new borrowing`}
        />
        <StatTile
          label="Net due from related parties"
          value={formatMoney(now.netRelated)}
          delta={signed(now.netRelated, yearAgo.netRelated)}
          tone={varianceTone(now.netRelated - yearAgo.netRelated, "up-bad")}
          comparison={`${formatMoney(v.dueFromRelated.at(-1)!)} due from, ${formatMoney(v.dueToRelated.at(-1)!)} due to`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Cash, borrowings and equity" caption="Balance at each reporting date">
          <TrendLineChart
            ariaLabel="Cash, borrowings and equity at each reporting date"
            data={pos.map((p) => ({ label: p.label.replace(/^\d+ (\w+) 20(\d\d)$/, "$1 ’$2"), cash: p.cash, borrowings: p.borrowings, equity: p.equity }))}
            series={[
              { key: "borrowings", name: "Borrowings", color: "var(--chart-3)" },
              { key: "equity", name: "Total equity", color: "var(--chart-2)" },
              { key: "cash", name: "Cash and bank", color: "var(--chart-1)" },
            ]}
          />
        </Panel>
        <Panel title={`Where the cash went, ${cf.period}`} caption="Operating cash flow, main movements">
          <DivergingBars rows={cf.lines} />
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-4 text-sm sm:grid-cols-3">
            {(
              [
                ["Operating", cf.summary.operating],
                ["Investing", cf.summary.investing],
                ["Financing", cf.summary.financing],
                ["Opening cash", cf.summary.opening],
                ["Net change", cf.summary.net],
                ["Closing cash", cf.summary.closing],
              ] as const
            ).map(([l, n]) => (
              <div key={l}>
                <dt className="text-ink-3">{l}</dt>
                <dd className={`mt-0.5 text-base font-semibold tabular-nums ${n < 0 ? "text-bad" : "text-ink"}`}>{formatMoney(n)}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <Panel title="Statement of financial position">
        <FigureTable
          caption="Condensed statement of financial position at each reporting date"
          columns={data.balanceSheet.columns.map((c, i) => ({ label: c.label, divider: i === data.balanceSheet.columns.length - 1 }))}
          rows={[...rows, ...ratioRows.map((r) => ({ ...r, emphasis: "memo" as const }))]}
          footnote="31 December 2025 is the restated comparative from the September 2026 accounts. The June 2026 deferred tax figure is a net asset shown within liabilities, as in the source accounts."
        />
      </Panel>
    </Section>
  );
}
