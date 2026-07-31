"use client";

import { DashboardModel } from "@/types/dashboard";
import { formatCompact, formatPercent } from "@/lib/dashboard/format";
import { TrendingUp, TrendingDown, AlertTriangle, ShieldAlert } from "lucide-react";

type RAG = "green" | "amber" | "red";

function RagBadge({ rag }: { rag: RAG }) {
  const c = {
    green: "bg-teal-50 text-teal-700 border-teal-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }[rag];
  const label = { green: "On Track", amber: "Monitor", red: "Action Required" }[rag];
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c}`}>{label}</span>;
}

function KpiCard({ label, value, prior, yoy }: { label: string; value: string; prior: string; yoy: number }) {
  const up = yoy > 0;
  const neg = value.startsWith("-GH¢");
  return (
    <div className={`bg-white rounded-xl border p-5 ${neg ? "border-red-200 bg-red-50" : "border-slate-200"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${neg ? "text-red-700" : "text-slate-900"}`}>{value}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          up ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
        }`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(yoy * 100).toFixed(1)}%
        </span>
        <span className="text-xs text-slate-400">vs prior</span>
      </div>
    </div>
  );
}

function MarginCard({ label, current, prior }: { label: string; current: number; prior: number }) {
  const neg = current < 0;
  return (
    <div className={`rounded-xl border p-4 ${neg ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-lg font-bold mt-1 ${neg ? "text-red-700" : "text-slate-900"}`}>{formatPercent(current)}</p>
      <p className="text-xs text-slate-400 mt-0.5">vs prior: {formatPercent(prior)}</p>
    </div>
  );
}

interface Props {
  model: DashboardModel;
  selectedPeriod: string;
  priorPeriod: string | null;
}

export function ExecutiveSummaryTab({ model, selectedPeriod, priorPeriod }: Props) {
  const k = model.kpis;
  const risks = model.commentary.risks.map((r) => ({
    rag: (r.impact === "Critical" || r.impact === "High" ? "red" : r.impact === "Medium" ? "amber" : "green") as RAG,
    title: r.area,
    detail: r.description,
  }));

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border p-6 ${
        k[3].value < 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedPeriod} Report</span>
          {k[3].value < 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">Loss-making period</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Executive Overview</h1>
        <p className="text-sm text-slate-600 leading-relaxed">{model.commentary.executiveSummary}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Revenue" value={formatCompact(k[0].value)} prior={formatCompact(k[0].priorValue)} yoy={k[0].yoy} />
        <KpiCard label="Gross Profit" value={formatCompact(k[1].value)} prior={formatCompact(k[1].priorValue)} yoy={k[1].yoy} />
        <KpiCard label="EBITDA" value={formatCompact(k[2].value)} prior={formatCompact(k[2].priorValue)} yoy={k[2].yoy} />
        <KpiCard label="Net Profit (PBT)" value={formatCompact(k[3].value)} prior={formatCompact(k[3].priorValue)} yoy={k[3].yoy} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {model.margins.map((m) => (
          <MarginCard key={m.label} label={m.label} current={m.current} prior={m.prior} />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-bold text-slate-900">Board Risk Register</h2>
        </div>
        <div className="grid gap-3">
          {risks.map((r, i) => (
            <div key={i} className={`rounded-xl border p-4 ${
              r.rag === "red" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
            }`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${r.rag === "red" ? "text-red-600" : "text-amber-600"}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900">{r.title}</p>
                    <RagBadge rag={r.rag} />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{r.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
