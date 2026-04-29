"use client";

import { MessageSquareText, TrendingUp, AlertTriangle, Info, CheckCircle } from "lucide-react";

type Tone = "neutral" | "positive" | "warning" | "critical";

interface CfoCommentaryProps {
  title: string;
  body: string | React.ReactNode;
  tone?: Tone;
  className?: string;
}

const toneConfig: Record<Tone, { border: string; bg: string; icon: React.ReactNode; label: string; labelColor: string }> = {
  neutral:  { border: "border-blue-200",   bg: "bg-blue-50/60",   icon: <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />,       label: "CFO Commentary",     labelColor: "text-blue-700" },
  positive: { border: "border-emerald-200", bg: "bg-emerald-50/60", icon: <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />, label: "CFO Commentary",     labelColor: "text-emerald-700" },
  warning:  { border: "border-amber-200",   bg: "bg-amber-50/60",   icon: <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />, label: "Risk Observation",   labelColor: "text-amber-700" },
  critical: { border: "border-red-200",     bg: "bg-red-50/60",     icon: <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />,   label: "Critical Observation", labelColor: "text-red-700" },
};

export function CfoCommentary({ title, body, tone = "neutral", className = "" }: CfoCommentaryProps) {
  const cfg = toneConfig[tone];
  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} px-5 py-4 ${className}`}>
      <div className="flex items-start gap-3">
        {cfg.icon}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.labelColor}`}>{cfg.label}</span>
            <span className="h-px flex-1 bg-current opacity-20" style={{ color: cfg.labelColor.replace("text-", "") }} />
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">{title}</p>
          <div className="text-sm text-slate-600 leading-relaxed">{body}</div>
        </div>
      </div>
    </div>
  );
}

/** Inline section descriptor — smaller, no icon, used under chart titles */
export function SectionNote({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-slate-500 leading-relaxed mt-1 ${className}`}>{children}</p>
  );
}
