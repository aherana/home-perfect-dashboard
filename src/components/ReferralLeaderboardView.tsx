"use client";

import { useEffect, useState } from "react";
import { ReferralPartnerCard } from "./ReferralPartnerCard";
import { Toolbar } from "./Toolbar";
import { AiInsightPanel } from "./AiInsightPanel";
import { NoteModal } from "./NoteModal";
import { ReferralPartnerDetailModal } from "./ReferralPartnerDetailModal";
import { filterPartners, settleFee, sumPendingFees, unsettleFee } from "@/lib/dashboard-logic";
import { downloadCsv, recordsToCsv } from "@/lib/csv";
import type { AiInsight, ReferralPartner } from "@/lib/types";

interface ReferralLeaderboardViewProps {
  initialPartners: ReferralPartner[];
  onPendingChange?: (pending: { total: number; count: number }) => void;
  referralInsight?: AiInsight;
}

export function ReferralLeaderboardView({
  initialPartners,
  onPendingChange,
  referralInsight,
}: ReferralLeaderboardViewProps) {
  const [partners, setPartners] = useState(initialPartners);
  const [query, setQuery] = useState("");
  const [settledInSession, setSettledInSession] = useState<Set<string>>(new Set());
  const [referralInsightCopied, setReferralInsightCopied] = useState(false);
  const [editingReferralInsight, setEditingReferralInsight] = useState(false);
  const [viewingPartner, setViewingPartner] = useState<ReferralPartner | null>(null);

  useEffect(() => {
    onPendingChange?.(sumPendingFees(partners));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners]);

  const visiblePartners = filterPartners(partners, query);

  const handleExport = () => {
    downloadCsv(
      "referral-leaderboard.csv",
      recordsToCsv(
        "Partner",
        visiblePartners.map((p) => ({ title: p.name, fields: p.fields }))
      )
    );
  };

  return (
    <div className="rounded-card border border-card-line bg-card p-4.5">
      <h3 className="mb-3.5 text-sm font-semibold">Plumber Referral Partners — This Month</h3>
      <Toolbar
        searchPlaceholder="Search partner…"
        query={query}
        onQueryChange={setQuery}
        exportLabel="Export CSV"
        onExport={handleExport}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {visiblePartners.map((p) => (
          <ReferralPartnerCard
            key={p.id}
            data={p}
            onSettleFee={(partnerId) => {
              setPartners((prev) => settleFee(prev, partnerId));
              setSettledInSession((prev) => new Set(prev).add(partnerId));
            }}
            onUndoFee={(partnerId) => {
              setPartners((prev) => unsettleFee(prev, partnerId));
              setSettledInSession((prev) => {
                const next = new Set(prev);
                next.delete(partnerId);
                return next;
              });
            }}
            settledInSession={settledInSession.has(p.id)}
            onOpenDetails={() => setViewingPartner(p)}
          />
        ))}
      </div>
      {referralInsight && (
        <AiInsightPanel
          insight={referralInsight}
          toggleLabel="✨ AI Insight — who to prioritize"
          insertable
          inserted={referralInsightCopied}
          onRequestInsert={() => setEditingReferralInsight(true)}
        />
      )}
      <NoteModal
        open={editingReferralInsight}
        initialText={referralInsight?.suggestedNote ?? ""}
        title={referralInsight?.modalTitle}
        copyLabel={referralInsight?.copyLabel}
        onCancel={() => setEditingReferralInsight(false)}
        onSave={() => {
          setReferralInsightCopied(true);
          setEditingReferralInsight(false);
        }}
      />
      <ReferralPartnerDetailModal
        open={viewingPartner !== null}
        data={viewingPartner}
        onClose={() => setViewingPartner(null)}
      />
    </div>
  );
}
