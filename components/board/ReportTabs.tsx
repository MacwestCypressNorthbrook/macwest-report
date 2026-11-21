"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Printer } from "lucide-react";

export interface ReportTab {
  id: string;
  label: string;
  content: ReactNode;
}

/** One section on screen at a time; every section prints. The active tab is kept in the URL hash. */
export function ReportTabs({ tabs }: { tabs: ReportTab[] }) {
  const [active, setActive] = useState(tabs[0].id);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (tabs.some((t) => t.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    // Expand every "Show figures" panel when printing, then restore.
    const opened: HTMLDetailsElement[] = [];
    const before = () => {
      document.querySelectorAll<HTMLDetailsElement>("details:not([open])").forEach((d) => {
        d.open = true;
        opened.push(d);
      });
    };
    const after = () => opened.splice(0).forEach((d) => (d.open = false));
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [tabs]);

  const select = (id: string, focus = false) => {
    setActive(id);
    history.replaceState(null, "", `#${id}`);
    if (focus) tabRefs.current[id]?.focus();
    window.scrollTo({ top: 0 });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === active);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length].id, true);
  };

  return (
    <>
      <nav className="no-print sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 md:px-8 xl:px-12">
          <div role="tablist" aria-label="Report sections" onKeyDown={onKeyDown} className="-mb-px flex flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
            {tabs.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[t.id] = el;
                  }}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => select(t.id)}
                  className={`flex h-14 items-center whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors duration-150 ${
                    isActive ? "border-brand text-ink" : "border-transparent text-ink-3 hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-muted sm:inline-flex"
          >
            <Printer aria-hidden className="h-4 w-4" />
            Print all / PDF
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-[1600px] px-4 pb-20 md:px-8 xl:px-12">
        {tabs.map((t) => (
          <div
            key={t.id}
            role="tabpanel"
            id={`panel-${t.id}`}
            aria-labelledby={`tab-${t.id}`}
            className={t.id === active ? "" : "hidden print:block"}
          >
            {t.content}
          </div>
        ))}
      </main>
    </>
  );
}
