"use client";

import { useEffect, useState, useRef } from "react";
import { KpiCard } from "@/types/dashboard";
import { formatMoney, formatPercent } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Percent, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const toneMap: Record<KpiCard["tone"], { Icon: LucideIcon; iconColor: string; iconBg: string; accentColor: string }> = {
  navy:   { Icon: DollarSign, iconColor: "text-blue-700",   iconBg: "bg-blue-100",   accentColor: "#2563eb" },
  green:  { Icon: TrendingUp, iconColor: "text-emerald-700", iconBg: "bg-emerald-100", accentColor: "#059669" },
  blue:   { Icon: Zap,        iconColor: "text-indigo-700",  iconBg: "bg-indigo-100",  accentColor: "#4f46e5" },
  purple: { Icon: Percent,    iconColor: "text-violet-700",  iconBg: "bg-violet-100",  accentColor: "#7c3aed" },
};

function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const raf = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const t0 = performance.now();
    const dur = 700;

    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (end - start) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else prev.current = end;
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);

  return <>{format(display)}</>;
}

function KpiCardItem({ kpi, index }: { kpi: KpiCard; index: number }) {
  const { Icon, iconColor, iconBg, accentColor } = toneMap[kpi.tone];
  const up = kpi.yoy > 0;
  const down = kpi.yoy < 0;

  return (
    <div
      className="stat-card card-hover animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Icon + badge row */}
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className={`kpi-chip ${up ? "bg-emerald-50 text-emerald-700" : down ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>
          {up && <TrendingUp className="h-3 w-3" />}
          {down && <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}
          {formatPercent(Math.abs(kpi.yoy))}
        </span>
      </div>

      {/* Label + value */}
      <div className="mt-4">
        <p className="section-label">{kpi.label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          <AnimatedNumber value={kpi.value} format={formatMoney} />
        </p>
      </div>

      {/* Prior period reference */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">FY 2025</span>
        <span className="text-xs font-semibold text-slate-700">{formatMoney(kpi.priorValue)}</span>
      </div>
    </div>
  );
}

export function KPIStrip({ kpis }: { kpis: KpiCard[] }) {
  return (
    <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key Performance Indicators">
      {kpis.map((kpi, i) => <KpiCardItem key={kpi.label} kpi={kpi} index={i} />)}
    </section>
  );
}
