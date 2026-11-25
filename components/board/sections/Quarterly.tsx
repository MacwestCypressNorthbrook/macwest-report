import type { DashboardData, PeriodId, PnlKey } from "@/types/dashboard";
import { deltaCell, marginCell, moneyCell, pointsCell } from "@/lib/dashboard/cells";
import { margin, pnlValue } from "@/lib/dashboard/metrics";
import { FigureTable, Panel, Section, type FigureRow } from "@/components/board/primitives";
import { GroupedBarChart } from "@/components/board/charts";

const QUARTERS: PeriodId[] = ["q1_2026", "q2_2026", "q3_2026"];
const YTD: PeriodId = "ytd_sep_2026";
const SHOWN: PnlKey[] = ["revenue", "directCost", "grossProfit", "adminExpenses", "ebit", "financeIncome", "financeCost", "pbt", "tax", "pat"];

export function Quarterly({ data }: { data: DashboardData }) {
  const period = (id: PeriodId) => data.periods.find((p) => p.id === id)!;
  const [q1, q2, q3] = QUARTERS.map(period);
  const ytd = period(YTD);

  const chartData = QUARTERS.map((id) => ({
    label: period(id).label,
    revenue: pnlValue(data, "revenue", id),
    grossProfit: pnlValue(data, "grossProfit", id),
    pat: pnlValue(data, "pat", id),
  }));

  const rows: FigureRow[] = data.pnl
    .filter((l) => SHOWN.includes(l.key))
    .map((l) => ({
      label: l.label,
      emphasis: l.emphasis === "memo" ? undefined : l.emphasis,
      cells: [
        ...QUARTERS.map((id) => moneyCell(l.values[id])),
        deltaCell(l.values.q3_2026, l.values.q2_2026, l.direction),
        moneyCell(l.values[YTD]),
      ],
    }));

  const marginRows: FigureRow[] = (
    [
      ["Gross margin", "grossProfit"],
      ["Operating margin", "ebit"],
      ["Net margin (after tax)", "pat"],
    ] as const
  ).map(([label, key]) => ({
    label,
    cells: [
      ...QUARTERS.map((id) => marginCell(margin(data, key, id))),
      pointsCell(margin(data, key, "q3_2026"), margin(data, key, "q2_2026")),
      marginCell(margin(data, key, YTD)),
    ],
  }));

  const streamRows: FigureRow[] = data.revenueStreams.map((s) => ({
    label: s.label,
    cells: [
      ...QUARTERS.map((id) => moneyCell(s.values[id])),
      deltaCell(s.values.q3_2026 ?? 0, s.values.q2_2026 ?? 0, "up-good"),
      moneyCell(s.values[YTD]),
    ],
  }));

  const columns = [
    { label: q1.label, sub: q1.range },
    { label: `${q2.label}†`, sub: q2.range },
    { label: `${q3.label}†`, sub: q3.range },
    { label: "Q3 vs Q2", sub: "change", divider: true },
    { label: ytd.label, sub: "year to date", divider: true },
  ];


  return (
    <Section
      id="quarterly"
      index="02"
      title="Quarter by quarter, 2026"
      lede={data.commentary.quarterly}
      breakBefore
    >
      <div className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-2">
        <div className="space-y-6">
        <Panel title="Revenue, gross profit and profit after tax by quarter" caption="GH¢, each quarter on its own">
          <GroupedBarChart
            ariaLabel="Revenue, gross profit and profit after tax for Q1, Q2 and Q3 2026"
            data={chartData}
            series={[
              { key: "revenue", name: "Revenue", color: "var(--chart-1)" },
              { key: "grossProfit", name: "Gross profit", color: "var(--chart-2)" },
              { key: "pat", name: "Profit after tax", color: "var(--chart-3)" },
            ]}
          />
        </Panel>

          <Panel title="Revenue by stream">
            <FigureTable caption="Revenue by stream by quarter" columns={columns} rows={streamRows} />
          </Panel>
        </div>
        <div className="space-y-6">
        <Panel title="Income statement by quarter">
          <FigureTable
            caption="Income statement for each quarter of 2026"
            columns={columns}
            rows={rows}
            footnote="† Derived: the year-to-date accounts at the quarter end less those at the previous quarter end. Brackets show losses or negative amounts."
          />
        </Panel>

          <Panel title="Margins">
            <FigureTable caption="Margins by quarter" unit="% of revenue" columns={columns} rows={marginRows} />
          </Panel>
        </div>
      </div>
    </Section>
  );
}
