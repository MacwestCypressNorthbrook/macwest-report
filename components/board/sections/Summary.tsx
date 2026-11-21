import type { DashboardData } from "@/types/dashboard";
import { formatMoney, formatPercent, formatPoints } from "@/lib/dashboard/format";
import { changePct, margin, pnlValue, positionColumns, varianceTone } from "@/lib/dashboard/metrics";
import { Panel, Section, StatTile } from "@/components/board/primitives";
import { FindingItem, RiskItem } from "@/components/board/Evidence";
import { ProfitBridge, type BridgeStep } from "@/components/board/insightCharts";

export function Summary({ data }: { data: DashboardData }) {
  const cur = "ytd_sep_2026" as const;
  const pri = "ytd_sep_2025" as const;
  const curLabel = data.periods.find((p) => p.id === cur)?.label ?? "";
  const priLabel = data.periods.find((p) => p.id === pri)?.label ?? "";

  const rev = [pnlValue(data, "revenue", cur), pnlValue(data, "revenue", pri)];
  const gm = [margin(data, "grossProfit", cur), margin(data, "grossProfit", pri)];
  const pat = [pnlValue(data, "pat", cur), pnlValue(data, "pat", pri)];
  const pos = positionColumns(data);
  const now = pos[pos.length - 1];
  const yearAgo = pos[0];
  const revPct = changePct(rev[0], rev[1]);

  const d = (k: Parameters<typeof pnlValue>[1]) => pnlValue(data, k, cur) - pnlValue(data, k, pri);
  const bridge: BridgeStep[] = [
    { label: priLabel, value: pat[1], kind: "total" },
    { label: "Revenue", value: d("revenue"), kind: "delta" },
    { label: "Direct cost", value: -d("directCost"), kind: "delta" },
    { label: "Overheads", value: -d("adminExpenses"), kind: "delta" },
    { label: "Net finance", value: d("financeIncome") - d("financeCost"), kind: "delta" },
    { label: "Tax & levy", value: d("tax") - d("levy"), kind: "delta" },
    { label: curLabel, value: pat[0], kind: "total" },
  ];

  const delta = (c: number, p: number) => `${c - p >= 0 ? "+" : "−"}${formatMoney(Math.abs(c - p))}`;

  return (
    <Section id="summary" index="01" title="Summary" lede={data.commentary.headline}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <StatTile
          label={`Revenue, ${curLabel}`}
          value={formatMoney(rev[0])}
          delta={revPct === null ? delta(rev[0], rev[1]) : `${revPct >= 0 ? "+" : ""}${formatPercent(revPct, 0)}`}
          tone={varianceTone(rev[0] - rev[1], "up-good")}
          comparison={`${priLabel}: ${formatMoney(rev[1])}`}
        />
        <StatTile
          label={`Gross margin, ${curLabel}`}
          value={gm[0] === null ? "n/m" : formatPercent(gm[0])}
          delta={gm[0] !== null && gm[1] !== null ? formatPoints(gm[0] - gm[1]) : undefined}
          tone={gm[0] !== null && gm[1] !== null ? varianceTone(gm[0] - gm[1], "up-good", 0.0005) : "flat"}
          comparison={`${priLabel}: ${gm[1] === null ? "n/m" : formatPercent(gm[1])}`}
        />
        <StatTile
          label={`Profit / (loss) after tax, ${curLabel}`}
          value={formatMoney(pat[0])}
          negative={pat[0] < 0}
          delta={delta(pat[0], pat[1])}
          tone={varianceTone(pat[0] - pat[1], "up-good")}
          comparison={`${priLabel}: ${formatMoney(pat[1])}`}
        />
        <StatTile
          label={`Cash and bank, ${now.label}`}
          value={formatMoney(now.cash)}
          delta={delta(now.cash, yearAgo.cash)}
          tone={varianceTone(now.cash - yearAgo.cash, "up-good")}
          comparison={`${yearAgo.label}: ${formatMoney(yearAgo.cash)}`}
        />
        <StatTile
          label={`Borrowings, ${now.label}`}
          value={formatMoney(now.borrowings)}
          delta={delta(now.borrowings, yearAgo.borrowings)}
          tone={varianceTone(now.borrowings - yearAgo.borrowings, "up-bad")}
          comparison={`${yearAgo.label}: ${formatMoney(yearAgo.borrowings)}`}
        />
        <StatTile
          label={`Total equity, ${now.label}`}
          value={formatMoney(now.equity)}
          negative={now.equity < 0}
          delta={delta(now.equity, yearAgo.equity)}
          tone={varianceTone(now.equity - yearAgo.equity, "up-good")}
          comparison={`${yearAgo.label}: ${formatMoney(yearAgo.equity)}`}
        />
      </div>

      <Panel
        title={`Why profit moved: ${priLabel} to ${curLabel}`}
        caption="Profit after tax, GH¢ millions. Each bar shows how much one line added to or took from profit."
      >
        <ProfitBridge steps={bridge} ariaLabel={`Bridge from ${priLabel} profit after tax to ${curLabel}`} />
      </Panel>

      <div>
        <h3 className="text-lg font-semibold text-ink">Key messages for the board</h3>
        <p className="mt-0.5 text-sm text-ink-3">Open &ldquo;Show figures&rdquo; on any message to see the numbers behind it and where they come from.</p>
        <ol className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {data.commentary.keyMessages.map((f, i) => (
            <FindingItem key={f.title} index={i + 1} finding={f} sources={data.meta.sources} />
          ))}
        </ol>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-ink">Risks requiring board attention</h3>
        <dl className="mt-1.5 flex flex-col gap-1 text-sm text-ink-3 sm:flex-row sm:flex-wrap sm:gap-x-6">
          {data.commentary.riskScale.map((r) => (
            <div key={r.level}>
              <dt className="inline font-medium text-ink-2">{r.level}: </dt>
              <dd className="inline">{r.meaning}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 min-[1600px]:grid-cols-4">
          {data.commentary.risks.map((r) => (
            <RiskItem key={r.area} risk={r} sources={data.meta.sources} />
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-3">Risk levels are the preparer&apos;s assessment against this scale.</p>
      </div>
    </Section>
  );
}
