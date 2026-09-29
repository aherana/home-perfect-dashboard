"use client";

import { useEffect, useMemo, useState } from "react";
import { AdjusterCaseCard } from "./AdjusterCaseCard";
import { Toolbar } from "./Toolbar";
import { NoteModal } from "./NoteModal";
import { ClaimDetailModal } from "./ClaimDetailModal";
import { countOpenIssues, filterCases, resolveChip, unresolveChip } from "@/lib/dashboard-logic";
import { downloadCsv, recordsToCsv } from "@/lib/csv";
import type { AdjusterCase, AdjusterStatusFilter } from "@/lib/types";

interface AdjusterDefenseViewProps {
  initialCases: AdjusterCase[];
  onIssueCountChange?: (count: number) => void;
}

const STATUS_OPTIONS: { value: AdjusterStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Needs Attention" },
  { value: "resolved", label: "Resolved" },
];

export function AdjusterDefenseView({ initialCases, onIssueCountChange }: AdjusterDefenseViewProps) {
  const [cases, setCases] = useState(initialCases);
  const [query, setQuery] = useState("");
  const [carrier, setCarrier] = useState("");
  const [status, setStatus] = useState<AdjusterStatusFilter>("all");
  const [resolvedChipIds, setResolvedChipIds] = useState<Set<string>>(new Set());
  const [insertedNoteIds, setInsertedNoteIds] = useState<Set<string>>(new Set());
  const [editingCase, setEditingCase] = useState<AdjusterCase | null>(null);
  const [viewingCase, setViewingCase] = useState<AdjusterCase | null>(null);

  useEffect(() => {
    onIssueCountChange?.(countOpenIssues(cases));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases]);

  const carrierOptions = useMemo(
    () => Array.from(new Set(initialCases.map((c) => c.carrier))),
    [initialCases]
  );
  const visibleCases = filterCases(cases, { query, carrier, status });

  const handleExport = () => {
    downloadCsv(
      "adjuster-defense.csv",
      recordsToCsv(
        "Job",
        visibleCases.map((c) => ({ title: c.id, fields: c.fields }))
      )
    );
  };

  return (
    <div className="rounded-card border border-card-line bg-card p-4.5">
      <h3 className="mb-3.5 text-sm font-semibold">Morning Adjuster Defense Check</h3>
      <Toolbar
        searchPlaceholder="Search job #, claim #, address, carrier, adjuster…"
        query={query}
        onQueryChange={setQuery}
        carrierOptions={carrierOptions}
        carrier={carrier}
        onCarrierChange={setCarrier}
        statusOptions={STATUS_OPTIONS}
        status={status}
        onStatusChange={setStatus}
        exportLabel="Export CSV"
        onExport={handleExport}
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {visibleCases.map((c) => (
          <AdjusterCaseCard
            key={c.id}
            data={c}
            onResolveChip={(chipId) => {
              setCases((prev) => resolveChip(prev, c.id, chipId));
              setResolvedChipIds((prev) => new Set(prev).add(chipId));
            }}
            onUndoChip={(chipId) => {
              setCases((prev) => unresolveChip(prev, c.id, chipId));
              setResolvedChipIds((prev) => {
                const next = new Set(prev);
                next.delete(chipId);
                return next;
              });
            }}
            resolvedChipIds={resolvedChipIds}
            noteInserted={insertedNoteIds.has(c.id)}
            onRequestInsert={() => setEditingCase(c)}
            onOpenDetails={() => setViewingCase(c)}
          />
        ))}
      </div>
      <NoteModal
        open={editingCase !== null}
        initialText={editingCase?.aiInsight?.suggestedNote ?? ""}
        title={editingCase?.aiInsight?.modalTitle}
        copyLabel={editingCase?.aiInsight?.copyLabel}
        onCancel={() => setEditingCase(null)}
        onSave={() => {
          if (editingCase) setInsertedNoteIds((prev) => new Set(prev).add(editingCase.id));
          setEditingCase(null);
        }}
      />
      <ClaimDetailModal open={viewingCase !== null} data={viewingCase} onClose={() => setViewingCase(null)} />
    </div>
  );
}
