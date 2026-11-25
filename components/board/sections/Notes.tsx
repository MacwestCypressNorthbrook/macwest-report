import type { DashboardData } from "@/types/dashboard";
import { Panel, Section } from "@/components/board/primitives";

export function Notes({ data }: { data: DashboardData }) {
  return (
    <Section id="notes" index="05" title="Basis of preparation">
      <div className="max-w-3xl">
        <Panel title="Sources">
          {data.meta.sources.length ? (
            <ul className="list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-ink-2 marker:text-ink-3">
              {data.meta.sources.map((s) => (
                <li key={s.id}>
                  <span className="font-medium text-ink">{s.short}</span>: {s.title}
                </li>
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
