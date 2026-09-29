"use client";

import { useState } from "react";
import { confirmedCopyLabel } from "@/lib/dashboard-logic";
import type { AiInsight } from "@/lib/types";

interface AiInsightPanelProps {
  insight: AiInsight;
  toggleLabel: string;
  insertable?: boolean;
  inserted?: boolean;
  onRequestInsert?: () => void;
}

export function AiInsightPanel({
  insight,
  toggleLabel,
  insertable = false,
  inserted = false,
  onRequestInsert,
}: AiInsightPanelProps) {
  const [open, setOpen] = useState(false);
  const copyLabel = insight.copyLabel ?? "Copy to Clipboard";

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="min-h-8 pt-2.5 text-left text-[12.5px] font-semibold text-amber"
      >
        {toggleLabel}
      </button>
      <div hidden={!open} className="mt-2 rounded border border-dashed border-card-line bg-bg p-3.5 text-xs text-fg-muted">
        <p className="mb-2">
          <strong className="text-fg">{insight.patternLabel}:</strong> {insight.pattern}
        </p>
        <p className="mb-2">
          <strong className="text-fg">{insight.suggestedNoteLabel}:</strong> {insight.suggestedNote}
        </p>
        {insertable && (
          <button
            type="button"
            disabled={inserted}
            onClick={onRequestInsert}
            className="min-h-9 rounded bg-amber px-3 py-2 text-[11.5px] font-semibold text-white disabled:bg-green"
          >
            {inserted ? confirmedCopyLabel(copyLabel) : copyLabel}
          </button>
        )}
      </div>
    </div>
  );
}
