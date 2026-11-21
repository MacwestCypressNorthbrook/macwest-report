import type { DashboardData, PeriodId } from "@/types/dashboard";
import { deltaCell, marginCell, moneyCell, pctCell, pointsCell } from "@/lib/dashboard/cells";
import { margin } from "@/lib/dashboard/metrics";
import { FigureTable, Panel, Section, type FigureRow } from "@/components/board/primitives";
import { GroupedBarChart } from "@/components/board/charts";

const CUR: PeriodId = "ytd_sep_2026";
const PRI: PeriodId = "ytd_sep_2025";

export function YearOnYear({ data }: { data: DashboardData }) {
  const cur = data.periods.find((p) => p.id === CUR)!;
  const pri = data.periods.find((p) => p.id === PRI)!;
  const columns = [
    { label: cur.label, sub: cur.range },
    { label: pri.label, sub: pri.range },
    { label: "Change", sub: "GH¢ M", divider: true },
    { label: "Change", sub: "%" },
  ];

  const pnlRows: FigureRow[] = data.pnl.map((l) => ({
    label: l.label,
    emphasis: l.emphasis,
    cells: [
      moneyCell(l.values[CUR]),
      moneyCell(l.values[PRI]),
      deltaCell(l.values[CUR], l.values[PRI], l.direction),
      pctCell(l.values[CUR], l.values[PRI], l.direction),
    ],
  }));
  const gm = [margin(data, "grossProfit", CUR), margin(data, "grossProfit", PRI)] as const;
  pnlRows.push({
    label: "Gross margin",
    emphasis: "memo",
    cells: [marginCell(gm[0]), marginCell(gm[1]), { text: "" }, pointsCell(gm[0], gm[1])],
  });

  const breakdownRows = (lines: DashboardData["directCosts"], direction: "up-good" | "up-bad"): FigureRow[] => {
    const rows = lines.map((s) => {
      const c = s.values[CUR] ?? 0;
      const p = s.values[PRI] ?? 0;
      return { label: s.label, cells: [moneyCell(c), moneyCell(p), deltaCell(c, p, direction), pctCell(c, p, direction)] };
    });
    const c = lines.reduce((t, s) => t + (s.values[CUR] ?? 0), 0);
    const p = lines.reduce((t, s) => t + (s.values[PRI] ?? 0), 0);
    rows.push({ label: "Total", cells: [moneyCell(c), moneyCell(p), deltaCell(c, p, direction), pctCell(c, p, direction)], emphasis: "total" } as FigureRow);
    return rows;
  };

  const ga = data.adminExpenses;
  const listed = ga.rows.reduce((t, r) => [t[0] + r.current, t[1] + r.prior], [0, 0]);
  const gaRows: FigureRow[] = [
    ...ga.rows.map((r) => ({
      label: r.label,
      cells: [moneyCell(r.current), moneyCell(r.prior), deltaCell(r.current, r.prior, "up-bad"), pctCell(r.current, r.prior, "up-bad")],
    })),
    {
      label: "All other lines",
      cells: [
        moneyCell(ga.total.current - listed[0]),
        moneyCell(ga.total.prior - listed[1]),
        deltaCell(ga.total.current - listed[0], ga.total.prior - listed[1], "up-bad"),
        pctCell(ga.total.current - listed[0], ga.total.prior - listed[1], "up-bad"),
      ],
    },
    {
      label: "Total G&A expenses",
      emphasis: "total",
      cells: [moneyCell(ga.total.current), moneyCell(ga.total.prior), deltaCell(ga.total.current, ga.total.prior, "up-bad"), pctCell(ga.total.current, ga.total.prior, "up-bad")],
    },
  ];

  const streamChart = data.revenueStreams.map((s) => ({
    label: s.label,
    current: s.values[CUR] ?? 0,
    prior: s.values[PRI] ?? 0,
  }));

  return (
    <Section id="year-on-year" index="03" title={`${cur.label} against ${pri.label}`} lede={data.commentary.yearOnYear} breakBefore>
      <Panel title="Income statement, nine months to 30 September">
        <FigureTable
          caption={`Income statement ${cur.label} compared with ${pri.label}`}
          columns={columns}
          rows={pnlRows}
          footnote="n/m: not meaningful, where the comparative is nil or the result changes between profit and loss. EBITDA is operating profit before depreciation."
        />
      </Panel>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Panel title="Revenue by stream" caption={`${cur.label} against ${pri.label}`} className="xl:col-span-2">
          <GroupedBarChart
            ariaLabel={`Revenue by stream, ${cur.label} compared with ${pri.label}`}
            data={streamChart}
            height={260}
            series={[
              { key: "prior", name: pri.label, color: "var(--chart-prior)" },
              { key: "current", name: cur.label, color: "var(--chart-1)" },
            ]}
          />
        </Panel>
        <Panel title="Direct cost by category" className="xl:col-span-3">
          <FigureTable caption="Direct cost by category" columns={columns} rows={breakdownRows(data.directCosts, "up-bad")} />
        </Panel>
      </div>

      <Panel title="General & administrative expenses — largest lines" caption={`Ten largest lines in ${cur.label}`}>
        <FigureTable caption="Largest general and administrative expense lines" columns={columns} rows={gaRows} />
      </Panel>
    </Section>
  );
}
