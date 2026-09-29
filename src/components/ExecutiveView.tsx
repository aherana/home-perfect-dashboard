"use client";

import { useState } from "react";
import { KpiCard } from "./KpiCard";
import { PeriodToggle } from "./PeriodToggle";
import { AgingBar } from "./AgingBar";
import { CarrierItem } from "./CarrierItem";
import { AiInsightPanel } from "./AiInsightPanel";
import { NoteModal } from "./NoteModal";
import { CarrierDetailModal } from "./CarrierDetailModal";
import { computeCustomRangeClosing } from "@/lib/dashboard-logic";
import type { AgingSegment, AiInsight, CarrierAging, Period, PeriodSelection, PeriodStat } from "@/lib/types";

const PERIODS: { id: PeriodSelection; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "custom", label: "Custom" },
];

interface ExecutiveViewProps {
  totalAr: { value: string; sub: string; tag?: string; dso: { value: string; target: string } };
  criticalAr: { value: string; sub: string; tag?: string };
  periodStats: Record<Period, PeriodStat>;
  referralPending: { total: number; count: number };
  agingSegments: AgingSegment[];
  agingNote: string;
  carriers: CarrierAging[];
  carrierInsight?: AiInsight;
}

export function ExecutiveView({
  totalAr,
  criticalAr,
  periodStats,
  referralPending,
  agingSegments,
  agingNote,
  carriers,
  carrierInsight,
}: ExecutiveViewProps) {
  const [period, setPeriod] = useState<PeriodSelection>("month");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [customStat, setCustomStat] = useState<PeriodStat | null>(null);
  const [carrierInsightCopied, setCarrierInsightCopied] = useState(false);
  const [editingCarrierInsight, setEditingCarrierInsight] = useState(false);
  const [viewingCarrier, setViewingCarrier] = useState<CarrierAging | null>(null);

  const closing = period === "custom" ? (customStat ?? { value: "—", sub: "Choose a range and Apply" }) : periodStats[period];

  return (
    <div>
      <PeriodToggle periods={PERIODS} active={period} onChange={setPeriod} />
      <p className="mb-4.5 text-[11.5px] text-fg-muted">
        Period applies to Closing Rate below (it&apos;s a rolling count). AR totals, aging, and DSO are balances —
        always shown as of today.
      </p>

      {period === "custom" && (
        <div className="mb-4.5 -mt-1 flex flex-wrap items-center gap-2 text-[12.5px]">
          <label htmlFor="rangeFrom" className="text-fg-muted">
            From
          </label>
          <input
            id="rangeFrom"
            type="date"
            value={rangeFrom}
            onChange={(e) => setRangeFrom(e.target.value)}
            className="min-h-9 rounded border border-card-line bg-card px-2.5 py-1.5 text-fg"
          />
          <label htmlFor="rangeTo" className="text-fg-muted">
            to
          </label>
          <input
            id="rangeTo"
            type="date"
            value={rangeTo}
            onChange={(e) => setRangeTo(e.target.value)}
            className="min-h-9 rounded border border-card-line bg-card px-2.5 py-1.5 text-fg"
          />
          <button
            type="button"
            onClick={() => setCustomStat(computeCustomRangeClosing(rangeFrom, rangeTo))}
            className="min-h-9 rounded border border-card-line px-3.5 py-1.5 font-semibold text-fg"
          >
            Apply
          </button>
        </div>
      )}

      <div className="mb-5.5 grid grid-cols-2 gap-3.5 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <KpiCard label="Total Outstanding AR" value={totalAr.value} sub={totalAr.sub} tag={totalAr.tag} dso={totalAr.dso} hero />
        <KpiCard label="Critical AR (60+ / 90+)" value={criticalAr.value} sub={criticalAr.sub} tag={criticalAr.tag} />
        <KpiCard label="Closing Rate" value={closing.value} sub={closing.sub} tag="by period" />
        <KpiCard
          label="Pending Referral Payouts"
          value={`$${referralPending.total.toLocaleString()}`}
          sub={`${referralPending.count} spiffs due`}
          tag="as of today"
        />
      </div>

      <div className="mb-4 rounded-card border border-card-line bg-card p-4.5">
        <h3 className="mb-3.5 text-sm font-semibold">AR Aging</h3>
        <AgingBar segments={agingSegments} note={agingNote} />
      </div>

      <div className="mb-4 rounded-card border border-card-line bg-card p-4.5">
        <h3 className="mb-3.5 text-sm font-semibold">Carrier Aging Breakdown</h3>
        {carriers.map((c) => (
          <CarrierItem key={c.name} carrier={c} onOpenDetails={() => setViewingCarrier(c)} />
        ))}
        {carrierInsight && (
          <AiInsightPanel
            insight={carrierInsight}
            toggleLabel="✨ AI Insight — who to escalate first"
            insertable
            inserted={carrierInsightCopied}
            onRequestInsert={() => setEditingCarrierInsight(true)}
          />
        )}
      </div>
      <NoteModal
        open={editingCarrierInsight}
        initialText={carrierInsight?.suggestedNote ?? ""}
        title={carrierInsight?.modalTitle}
        copyLabel={carrierInsight?.copyLabel}
        onCancel={() => setEditingCarrierInsight(false)}
        onSave={() => {
          setCarrierInsightCopied(true);
          setEditingCarrierInsight(false);
        }}
      />
      <CarrierDetailModal open={viewingCarrier !== null} data={viewingCarrier} onClose={() => setViewingCarrier(null)} />
    </div>
  );
}
