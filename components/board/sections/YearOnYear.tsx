import type { DashboardData, PeriodId } from "@/types/dashboard";
import { deltaCell, marginCell, moneyCell, pctCell, pointsCell } from "@/lib/dashboard/cells";
import { margin } from "@/lib/dashboard/metrics";
import { FigureTable, Panel, Section, type FigureRow } from "@/components/board/primitives";
import { RankedChangeBars } from "@/components/board/charts";
import { MixBars } from "@/components/board/insightCharts";
import { formatMillions, formatMoney, formatPercent } from "@/lib/dashboard/format";
import { changePct } from "@/lib/dashboard/metrics";

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
  const STREAM_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-prior)"];
  const mixRows = [pri, cur].map((p) => ({
    label: p.label,
    values: Object.fromEntries(data.revenueStreams.map((s) => [s.label, s.values[p.id] ?? 0])),
  }));
  const gaChanges = [
    ...ga.rows,
    { label: "All other lines", current: ga.total.current - listed[0], prior: ga.total.prior - listed[1] },
  ].map((r) => {
    const pct = changePct(r.current, r.prior);
    return {
      label: r.label,
      change: r.current - r.prior,
      detail: `${formatMillions(r.prior)} → ${formatMillions(r.current)} · ${pct === null ? "new" : `${pct >= 0 ? "+" : ""}${formatPercent(pct, 0)}`}`,
    };
  });
  const gaPct = changePct(ga.total.current, ga.total.prior);

  return (
    <Section id="year-on-year" index="03" title={`${cur.label} against ${pri.label}`} lede={data.commentary.yearOnYear} breakBefore>
      <div className="grid grid-cols-1 items-start gap-6 2xl:grid-cols-2">
        <Panel title="Income statement, nine months to 30 September">
          <FigureTable
            caption={`Income statement ${cur.label} compared with ${pri.label}`}
            columns={columns}
            rows={pnlRows}
            footnote="n/m: not meaningful, where the comparative is nil or the result changes between profit and loss. EBITDA is operating profit before depreciation."
          />
        </Panel>
        <div className="space-y-6">
          <Panel title="Revenue mix" caption="Share of revenue by stream">
            <MixBars
              ariaLabel={`Share of revenue by stream, ${pri.label} and ${cur.label}`}
              rows={mixRows}
              categories={data.revenueStreams.map((s, i) => ({ key: s.label, color: STREAM_COLORS[i % STREAM_COLORS.length] }))}
            />
            <p className="mt-4 text-sm text-ink-3">Hover a bar for amounts in GH¢.</p>
          </Panel>
          <Panel title="Direct cost by category">
            <FigureTable caption="Direct cost by category" columns={columns} rows={breakdownRows(data.directCosts, "up-bad")} />
          </Panel>
        </div>
      </div>

      <Panel
        title="Where overheads grew"
        caption={`General & administrative expenses: ${formatMoney(ga.total.prior)} in ${pri.label} → ${formatMoney(ga.total.current)} in ${cur.label}${gaPct === null ? "" : ` (${gaPct >= 0 ? "+" : ""}${formatPercent(gaPct, 0)})`}. Largest increases first; amounts in GH¢ millions, ${pri.label} → ${cur.label}.`}
      >
        <RankedChangeBars rows={gaChanges} direction="up-bad" />
      </Panel>
    </Section>
  );
}
