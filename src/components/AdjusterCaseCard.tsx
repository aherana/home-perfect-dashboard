import { Chip } from "./Chip";
import { FieldRow } from "./FieldRow";
import { ResolvableSelect } from "./ResolvableSelect";
import { AiInsightPanel } from "./AiInsightPanel";
import { chipDisplayText } from "@/lib/dashboard-logic";
import type { AdjusterCase } from "@/lib/types";

interface AdjusterCaseCardProps {
  data: AdjusterCase;
  onResolveChip: (chipId: string) => void;
  onUndoChip: (chipId: string) => void;
  resolvedChipIds: Set<string>;
  noteInserted: boolean;
  onRequestInsert: () => void;
  onOpenDetails: () => void;
}

export function AdjusterCaseCard({
  data,
  onResolveChip,
  onUndoChip,
  resolvedChipIds,
  noteInserted,
  onRequestInsert,
  onOpenDetails,
}: AdjusterCaseCardProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-card border border-card-line bg-card p-4">
      <div className="mb-0.5 flex items-start justify-between gap-2">
        <div>
          <button
            type="button"
            onClick={onOpenDetails}
            className="cursor-pointer text-[14.5px] font-bold underline decoration-card-line underline-offset-2 hover:text-amber hover:decoration-amber"
          >
            {data.id}
          </button>
          <div className="mt-0.5 text-[11.5px] text-fg-muted">{data.claimRef}</div>
        </div>
        {data.flag && (
          <span className="whitespace-nowrap rounded-full bg-amber-soft px-2.5 py-0.5 text-[10.5px] font-bold text-amber">
            {data.flag}
          </span>
        )}
      </div>

      {data.fields.map((f) => (
        <FieldRow key={f.label} label={f.label} value={f.value} overdue={f.overdue} linkLabel={f.linkLabel} />
      ))}

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 border-t border-card-line pt-2.5">
        {data.chips.map((chip) => (
          <span key={chip.id} className="inline-flex items-center gap-1.5">
            <Chip status={chip.status}>{chipDisplayText(chip)}</Chip>
            {chip.status === "ok" && resolvedChipIds.has(chip.id) && (
              <button
                type="button"
                onClick={() => onUndoChip(chip.id)}
                className="text-[11px] text-fg-muted underline hover:text-amber"
              >
                ↺ Undo
              </button>
            )}
          </span>
        ))}
      </div>

      <ResolvableSelect
        options={data.actionOptions}
        variant={data.actionVariant}
        onResolve={() => {
          if (data.resolveChipId) onResolveChip(data.resolveChipId);
        }}
      />

      {data.aiInsight && (
        <AiInsightPanel
          insight={data.aiInsight}
          toggleLabel="✨ AI Insight — carrier defense pattern"
          insertable={data.aiInsight.insertable}
          inserted={noteInserted}
          onRequestInsert={onRequestInsert}
        />
      )}
    </div>
  );
}
