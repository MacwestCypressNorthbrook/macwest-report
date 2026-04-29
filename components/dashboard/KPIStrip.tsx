"use client";

import { useEffect, useState, useRef } from "react";
import { KpiCard } from "@/types/dashboard";
import { formatMoney, formatPercent } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown, DollarSign, Zap, Percent } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const toneMap: Record<KpiCard["tone"], { Icon: LucideIcon; iconColor: string; iconBg: string; sparkColor: string }> = {
  navy:   { Icon: DollarSign, iconColor: "text-blue-700",    iconBg: "bg-blue-100",    sparkColor: "#2563eb" },
  green:  { Icon: TrendingUp, iconColor: "text-emerald-700", iconBg: "bg-emerald-100", sparkColor: "#059669" },
  blue:   { Icon: Zap,        iconColor: "text-indigo-700",  iconBg: "bg-indigo-100",  sparkColor: "#4f46e5" },
  purple: { Icon: Percent,    iconColor: "text-violet-700",  iconBg: "bg-violet-100",  sparkColor: "#7c3aed" },
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const W = 72, H = 28;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 4) - 2,
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={W} height={H} className="overflow-visible shrink-0">
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
    </svg>
  );
}

function AnimatedNumber({ value, format }: { value: number; format: (v: number) => string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  const raf  = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = prev.current, end = value, t0 = performance.now(), dur = 700;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setDisplay(start + (end - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf.current = requestAnimationFrame(tick); else prev.current = end;
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [value]);

  return <>{format(display)}</>;
}

function KpiCardItem({ kpi, index }: { kpi: KpiCard; index: number }) {
  const { Icon, iconColor, iconBg, sparkColor } = toneMap[kpi.tone];
  const up = kpi.yoy > 0;
  const dn = kpi.yoy < 0;
  const hasPrior = kpi.priorValue !== 0 && kpi.priorValue !== undefined;

  return (
    <div className="stat-card card-hover animate-fade-in" style={{ animationDelay: `${index * 80}ms` }}>
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-4.5 w-4.5 ${iconColor}`} />
        </div>
        {hasPrior && (
          <span className={`kpi-chip ${up ? "bg-emerald-50 text-emerald-700" : dn ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-600"}`}>
            {up && <TrendingUp className="h-3 w-3" />}
            {dn && <TrendingDown className="h-3 w-3" />}
            {up ? "+" : ""}{formatPercent(Math.abs(kpi.yoy))}
          </span>
        )}
      </div>

      {/* Label + value */}
      <div className="mt-3">
        <p className="section-label">{kpi.label}</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
          <AnimatedNumber value={kpi.value} format={formatMoney} />
        </p>
      </div>

      {/* Sparkline + prior */}
      <div className="mt-3 flex items-end justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-[10px] text-slate-400 mb-0.5">Prior period</p>
          <p className="text-xs font-semibold text-slate-600">
            {hasPrior ? formatMoney(kpi.priorValue) : "—"}
          </p>
        </div>
        <Sparkline data={kpi.sparkline} color={sparkColor} />
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
