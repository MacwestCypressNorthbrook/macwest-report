import type { DashboardData } from "@/types/dashboard";
import { formatMoney, formatPercent, formatPoints } from "@/lib/dashboard/format";
import { changePct, margin, pnlValue, positionColumns, varianceTone } from "@/lib/dashboard/metrics";
import { LevelBadge, Panel, Section, StatTile } from "@/components/board/primitives";

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

  const delta = (c: number, p: number) => `${c - p >= 0 ? "+" : "−"}${formatMoney(Math.abs(c - p))}`;

  return (
    <Section id="summary" index="01" title="Summary" lede={data.commentary.headline}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Panel title="Key messages for the board" className="lg:col-span-3">
          <ol className="space-y-4">
            {data.commentary.keyMessages.map((m, i) => (
              <li key={i} className="grid grid-cols-[1.75rem_1fr] text-[0.95rem] leading-relaxed text-ink-2">
                <span className="font-semibold tabular-nums text-ink-3">{i + 1}.</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="Risks requiring board attention" className="lg:col-span-2">
          <ul className="divide-y divide-line">
            {data.commentary.risks.map((r) => (
              <li key={r.area} className="py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{r.area}</p>
                  <LevelBadge level={r.level} />
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{r.text}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </Section>
  );
}
