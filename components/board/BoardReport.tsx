import Image from "next/image";
import type { DashboardData } from "@/types/dashboard";
import { ReportTabs } from "@/components/board/ReportTabs";
import { Summary } from "@/components/board/sections/Summary";
import { Quarterly } from "@/components/board/sections/Quarterly";
import { YearOnYear } from "@/components/board/sections/YearOnYear";
import { Position } from "@/components/board/sections/Position";
import { Notes } from "@/components/board/sections/Notes";


export function BoardReport({ data }: { data: DashboardData }) {
  const { meta } = data;
  return (
    <div className="min-h-screen bg-bg">


      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-6 px-4 py-8 md:flex-row md:items-end md:justify-between md:px-8 md:py-7 xl:px-12">
          <div>
            <Image src="/logo-macwest-new.png" alt={meta.company} width={152} height={36} priority className="h-7 w-auto dark:brightness-0 dark:invert" />
            <h1 className="mt-4 text-[clamp(1.75rem,3.5vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
              {meta.reportTitle}
            </h1>
            <p className="mt-2 text-base text-ink-2">
              {meta.periodLabel} · Period ended {meta.periodEnding} · Unaudited management accounts
            </p>
          </div>
        </div>
      </header>

      <ReportTabs
        tabs={[
          { id: "summary", label: "Summary", content: <Summary data={data} /> },
          { id: "quarterly", label: "Quarterly", content: <Quarterly data={data} /> },
          { id: "year-on-year", label: "Year on year", content: <YearOnYear data={data} /> },
          { id: "position", label: "Position & cash", content: <Position data={data} /> },
          { id: "notes", label: "Notes", content: <Notes data={data} /> },
        ]}
      />

      <footer className="border-t border-line py-6 text-center text-xs text-ink-3">
        {meta.company} · Confidential — prepared for the Board of Directors
      </footer>
    </div>
  );
}
