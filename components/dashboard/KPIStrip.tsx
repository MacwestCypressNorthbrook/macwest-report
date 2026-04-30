"use client";

import { useEffect, useState, useRef } from "react";
import { KpiCard } from "@/types/dashboard";
import { formatMoney } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown, DollarSign, Zap, Percent } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneMap: Record<KpiCard["tone"], { Icon: LucideIcon; iconColor: string; iconBg: string; sparkColor: string }> = {
  navy:   { Icon: DollarSign, iconColor: "text-[#941c1c]",    iconBg: "bg-red-50",    sparkColor: "#941c1c" },
  green:  { Icon: TrendingUp, iconColor: "text-teal-700", iconBg: "bg-teal-50", sparkColor: "#0d9488" },
  blue:   { Icon: Zap,        iconColor: "text-blue-700",  iconBg: "bg-blue-50",  sparkColor: "#2563eb" },
  purple: { Icon: Percent,    iconColor: "text-purple-700",  iconBg: "bg-purple-50",  sparkColor: "#7c3aed" },
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
  const { Icon, iconColor, iconBg } = toneMap[kpi.tone];

  return (
    <div className="stat-card animate-fade-in flex flex-col justify-between" style={{ animationDelay: `${index * 80}ms` }}>
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
          <Sparkline data={kpi.sparkline} color={toneMap[kpi.tone].sparkColor} />
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-2xl font-bold text-slate-900">
            <AnimatedNumber value={kpi.value} format={formatMoney} />
          </p>
          {kpi.yoy !== undefined && (
            <span className={cn(
              "text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5",
              kpi.yoy >= 0 ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
            )}>
              {kpi.yoy >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
              {Math.abs(kpi.yoy * 100).toFixed(1)}%
            </span>
          )}
        </div>
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
