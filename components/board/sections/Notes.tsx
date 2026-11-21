import type { DashboardData } from "@/types/dashboard";
import { Panel, Section } from "@/components/board/primitives";

export function Notes({ data }: { data: DashboardData }) {
  return (
    <Section id="notes" index="05" title="Basis of preparation">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="How to read these figures">
          <ul className="list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-ink-2 marker:text-ink-3">
            {data.commentary.dataNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </Panel>
        <Panel title="Sources">
          {data.meta.sources.length ? (
            <ul className="list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-ink-2 marker:text-ink-3">
              {data.meta.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-2">No source documents: this build is running on sample data.</p>
          )}
          <p className="mt-4 text-sm text-ink-3">
            Unaudited management accounts. All amounts in Ghana cedis ({data.meta.currency}).
          </p>
        </Panel>
      </div>
    </Section>
  );
}
