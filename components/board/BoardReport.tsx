import Image from "next/image";
import type { DashboardData } from "@/types/dashboard";
import { SectionNav } from "@/components/board/SectionNav";
import { Summary } from "@/components/board/sections/Summary";
import { Quarterly } from "@/components/board/sections/Quarterly";
import { YearOnYear } from "@/components/board/sections/YearOnYear";
import { Position } from "@/components/board/sections/Position";
import { Notes } from "@/components/board/sections/Notes";

const SECTIONS = [
  { id: "summary", label: "Summary" },
  { id: "quarterly", label: "Quarterly" },
  { id: "year-on-year", label: "Year on year" },
  { id: "position", label: "Position & cash" },
  { id: "notes", label: "Notes" },
];

export function BoardReport({ data }: { data: DashboardData }) {
  const { meta } = data;
  return (
    <div className="min-h-screen bg-bg">
      {meta.isSample && (
        <div role="status" className="bg-warn-soft px-4 py-2 text-center text-sm font-medium text-warn">
          Sample data: these figures are synthetic and do not describe the company.
        </div>
      )}

      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-8 md:flex-row md:items-end md:justify-between md:px-8 md:py-10">
          <div>
            <Image src="/logo-macwest-new.png" alt={meta.company} width={152} height={36} priority className="h-9 w-auto dark:brightness-0 dark:invert" />
            <h1 className="mt-6 text-[clamp(1.875rem,4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
              {meta.reportTitle}
            </h1>
            <p className="mt-2 text-base text-ink-2">
              {meta.periodLabel} · Period ended {meta.periodEnding} · Unaudited management accounts
            </p>
          </div>
        </div>
      </header>

      <SectionNav sections={SECTIONS} />

      <main className="mx-auto max-w-[1240px] px-4 pb-24 md:px-8">
        <Summary data={data} />
        <Quarterly data={data} />
        <YearOnYear data={data} />
        <Position data={data} />
        <Notes data={data} />
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-3">
        {meta.company} · Confidential — prepared for the Board of Directors
      </footer>
    </div>
  );
}
