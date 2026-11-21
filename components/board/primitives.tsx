import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Tone } from "@/lib/dashboard/metrics";

const toneText: Record<Tone, string> = {
  good: "text-good",
  bad: "text-bad",
  flat: "text-ink-3",
};

export function Section({
  id,
  index,
  title,
  lede,
  children,
  breakBefore,
}: {
  id: string;
  index: string;
  title: string;
  lede?: string;
  children: ReactNode;
  breakBefore?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`pt-8 ${breakBefore ? "print-break" : ""}`}>
      <header className="mb-6 max-w-3xl">
        <p className="text-sm font-medium text-ink-3 tabular-nums">{index}</p>
        <h2 id={`${id}-title`} className="mt-1 text-[1.75rem] font-semibold tracking-[-0.02em] text-ink leading-tight">
          {title}
        </h2>
        {lede && <p className="mt-3 text-base leading-relaxed text-ink-2">{lede}</p>}
      </header>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function Panel({
  title,
  caption,
  children,
  className = "",
  action,
}: {
  title?: string;
  caption?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`avoid-break rounded-2xl border border-line bg-surface p-5 md:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-ink">{title}</h3>}
            {caption && <p className="mt-0.5 text-sm text-ink-3">{caption}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/** Direction arrow + text, so the meaning never relies on colour alone. */
export function Delta({ tone, children }: { tone: Tone; children: ReactNode }) {
  const Icon = tone === "flat" ? Minus : tone === "good" ? ArrowUpRight : ArrowDownRight;
  const label = tone === "good" ? "Favourable" : tone === "bad" ? "Adverse" : "No change";
  return (
    <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${toneText[tone]}`}>
      <Icon aria-hidden className="h-4 w-4 shrink-0" />
      <span className="sr-only">{label}: </span>
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  negative,
  comparison,
  delta,
  tone = "flat",
}: {
  label: string;
  value: string;
  negative?: boolean;
  comparison: string;
  delta?: string;
  tone?: Tone;
}) {
  return (
    <div className="avoid-break flex flex-col rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm font-medium text-ink-2">{label}</p>
      <p className={`mt-2 text-[1.75rem] font-semibold tracking-[-0.02em] tabular-nums leading-none ${negative ? "text-bad" : "text-ink"}`}>
        {value}
      </p>
      <div className="mt-auto pt-4 text-sm text-ink-3">
        {delta && (
          <div className="mb-0.5">
            <Delta tone={tone}>{delta}</Delta>
          </div>
        )}
        <span className="tabular-nums">{comparison}</span>
      </div>
    </div>
  );
}

export function Callout({ title, children, tone = "warn" }: { title: string; children: ReactNode; tone?: "warn" | "info" }) {
  return (
    <div
      role="note"
      className={`avoid-break rounded-2xl border p-5 ${
        tone === "warn" ? "border-warn/30 bg-warn-soft" : "border-line bg-surface-muted"
      }`}
    >
      <p className={`text-sm font-semibold ${tone === "warn" ? "text-warn" : "text-ink"}`}>{title}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-ink-2">{children}</div>
    </div>
  );
}

export function LevelBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const styles = {
    High: "bg-brand-soft text-brand",
    Medium: "bg-warn-soft text-warn",
    Low: "bg-surface-muted text-ink-2",
  }[level];
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>{level}</span>;
}

// ---- Figures table ------------------------------------------------------

export interface FigureCell {
  text: string;
  tone?: Tone;
  negative?: boolean;
}

export interface FigureRow {
  label: string;
  cells: FigureCell[];
  emphasis?: "subtotal" | "total" | "memo";
}

export interface FigureColumn {
  label: string;
  sub?: string;
  /** Visually separates comparison columns from period columns. */
  divider?: boolean;
}

export function FigureTable({
  caption,
  unit = "GH¢ millions",
  columns,
  rows,
  footnote,
}: {
  caption: string;
  unit?: string;
  columns: FigureColumn[];
  rows: FigureRow[];
  footnote?: ReactNode;
}) {
  return (
    <div>
      <div className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line-strong">
              <th scope="col" className="py-2.5 pr-4 text-left text-xs font-medium text-ink-3">
                {unit}
              </th>
              {columns.map((c) => (
                <th
                  key={c.label}
                  scope="col"
                  className={`py-2.5 pl-4 text-right align-bottom font-semibold text-ink whitespace-nowrap ${
                    c.divider ? "border-l border-line" : ""
                  }`}
                >
                  {c.label}
                  {c.sub && <span className="block text-xs font-normal text-ink-3">{c.sub}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const strong = r.emphasis === "subtotal" || r.emphasis === "total";
              return (
                <tr
                  key={r.label}
                  className={`border-b border-line last:border-0 ${r.emphasis === "total" ? "border-t-2 border-t-line-strong" : ""}`}
                >
                  <th
                    scope="row"
                    className={`py-2.5 pr-4 text-left ${
                      strong ? "font-semibold text-ink" : r.emphasis === "memo" ? "font-normal italic text-ink-3" : "font-normal text-ink-2"
                    }`}
                  >
                    {r.label}
                  </th>
                  {r.cells.map((cell, i) => (
                    <td
                      key={i}
                      className={`py-2.5 pl-4 text-right tabular-nums whitespace-nowrap ${
                        columns[i]?.divider ? "border-l border-line" : ""
                      } ${strong ? "font-semibold" : ""} ${
                        cell.tone ? toneText[cell.tone] : cell.negative ? "text-bad" : strong ? "text-ink" : "text-ink-2"
                      }`}
                    >
                      {cell.text}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {footnote && <p className="mt-3 text-xs leading-relaxed text-ink-3">{footnote}</p>}
    </div>
  );
}
