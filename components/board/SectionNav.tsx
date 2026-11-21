"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";

/** Sticky in-page navigation with scroll-spy. */
export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const onScroll = () => {
      // The last section whose top has passed the nav bar is the current one.
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) current = s.id;
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = sections[sections.length - 1]?.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <nav
      aria-label="Report sections"
      className="no-print sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="mx-auto flex max-w-[1240px] items-center gap-4 px-4 md:px-8">
        <ul className="-mb-px flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
          {sections.map((s) => {
            const isActive = s.id === active;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={`flex h-14 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors duration-150 ${
                    isActive ? "border-brand text-ink" : "border-transparent text-ink-3 hover:text-ink"
                  }`}
                >
                  {s.label}
                </a>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => window.print()}
          className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-muted sm:inline-flex"
        >
          <Printer aria-hidden className="h-4 w-4" />
          Print / PDF
        </button>
      </div>
    </nav>
  );
}
