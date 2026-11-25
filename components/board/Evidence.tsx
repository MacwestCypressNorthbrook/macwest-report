import type { DashboardData, Evidence, Finding, Risk } from "@/types/dashboard";
import { formatMoney, formatPercent, formatPoints, formatRatio } from "@/lib/dashboard/format";
import { ChevronRight } from "lucide-react";
import { LevelBadge } from "@/components/board/primitives";

const formatEvidence = (e: Evidence): string => {
  switch (e.format) {
    case "percent":
      return formatPercent(e.value);
    case "points":
      return formatPoints(e.value);
    case "ratio":
      return formatRatio(e.value);
    default:
      return formatMoney(e.value);
  }
};

/** The figures behind a statement, each with its source document and note. */
export function EvidenceTable({ items, sources }: { items: Evidence[]; sources: DashboardData["meta"]["sources"] }) {
  const short = (id: string) => sources.find((s) => s.id === id)?.short ?? id;
  return (
    <div className="rounded-xl border border-line bg-surface-muted/60 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-3">Supporting figures</p>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Supporting figures and their sources</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Figure</th>
            <th scope="col">Amount</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.label} className="border-t border-line first:border-0 align-top">
              <th scope="row" className="py-1.5 pr-3 text-left font-normal text-ink-2">
                {e.label}
                <span className="block text-xs text-ink-3">
                  {short(e.source)}
                  {e.ref ? ` · ${e.ref}` : ""}
                </span>
              </th>
              <td className={`py-1.5 text-right font-semibold tabular-nums whitespace-nowrap ${e.value < 0 ? "text-bad" : "text-ink"}`}>
                {formatEvidence(e)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Figures are collapsed by default to keep the page short; printing expands them. */
function FiguresToggle({ items, sources }: { items: Evidence[]; sources: DashboardData["meta"]["sources"] }) {
  return (
    <details className="group mt-4">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
        <ChevronRight aria-hidden className="h-4 w-4 transition-transform duration-150 group-open:rotate-90" />
        <span className="group-open:hidden">Show figures ({items.length})</span>
        <span className="hidden group-open:inline">Hide figures</span>
      </summary>
      <div className="mt-3">
        <EvidenceTable items={items} sources={sources} />
      </div>
    </details>
  );
}

export function FindingItem({ index, finding, sources }: { index: number; finding: Finding; sources: DashboardData["meta"]["sources"] }) {
  return (
    <li className="avoid-break flex flex-col rounded-2xl border border-line bg-surface p-5">
      <h4 className="flex gap-2 font-semibold text-ink">
        <span className="tabular-nums text-ink-3">{index}.</span>
        {finding.title}
      </h4>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{finding.text}</p>
      <div className="mt-auto">
        <FiguresToggle items={finding.evidence} sources={sources} />
      </div>
    </li>
  );
}

export function RiskItem({ risk, sources }: { risk: Risk; sources: DashboardData["meta"]["sources"] }) {
  return (
    <li className="avoid-break flex flex-col rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-ink">{risk.area}</h4>
        <LevelBadge level={risk.level} />
      </div>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{risk.text}</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div>
          <dt className="inline font-semibold text-ink">Why {risk.level.toLowerCase()}: </dt>
          <dd className="inline text-ink-2">{risk.why}</dd>
        </div>
        {risk.action && (
          <div>
            <dt className="inline font-semibold text-ink">Suggested action: </dt>
            <dd className="inline text-ink-2">{risk.action}</dd>
          </div>
        )}
      </dl>
      <div className="mt-auto">
        <FiguresToggle items={risk.evidence} sources={sources} />
      </div>
    </li>
  );
}
