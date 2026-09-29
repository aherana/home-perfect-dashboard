import { FieldRow } from "./FieldRow";
import { Chip } from "./Chip";
import { chipDisplayText } from "@/lib/dashboard-logic";
import type { AdjusterCase } from "@/lib/types";

interface ClaimDetailModalProps {
  open: boolean;
  data: AdjusterCase | null;
  onClose: () => void;
}

export function ClaimDetailModal({ open, data, onClose }: ClaimDetailModalProps) {
  if (!open || !data) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Claim ${data.id} details`}
      className="fixed inset-0 z-[35] flex items-center justify-center bg-black/50"
    >
      <div className="max-h-[85vh] w-[min(520px,calc(100vw-40px))] overflow-y-auto rounded-lg border border-card-line bg-card p-5">
        <div className="mb-3.5 flex items-start justify-between gap-2">
          <div>
            <div className="text-[15px] font-bold">{data.id}</div>
            <div className="mt-0.5 text-[12px] text-fg-muted">{data.claimRef}</div>
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

        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-card-line pt-3">
          {data.chips.map((chip) => (
            <Chip key={chip.id} status={chip.status}>
              {chipDisplayText(chip)}
            </Chip>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-9 rounded border border-card-line px-3.5 py-2 text-[12.5px] font-semibold text-fg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
