import { FieldRow } from "./FieldRow";
import type { ReferralPartner } from "@/lib/types";

interface ReferralPartnerDetailModalProps {
  open: boolean;
  data: ReferralPartner | null;
  onClose: () => void;
}

export function ReferralPartnerDetailModal({ open, data, onClose }: ReferralPartnerDetailModalProps) {
  if (!open || !data) return null;

  const feeStatusValue =
    data.feeStatus === "paid"
      ? data.checkRef
        ? `Paid — Check #${data.checkRef}`
        : "Paid"
      : `$${data.pendingAmount} Pending`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${data.name} details`}
      className="fixed inset-0 z-[35] flex items-center justify-center bg-black/50"
    >
      <div className="max-h-[85vh] w-[min(480px,calc(100vw-40px))] overflow-y-auto rounded-lg border border-card-line bg-card p-5">
        <div className="mb-3.5">
          <div className="text-[15px] font-bold">{data.name}</div>
          <div className="mt-0.5 text-[12px] text-fg-muted">Rank #{data.rank}</div>
        </div>

        {data.fields.map((f) => (
          <FieldRow key={f.label} label={f.label} value={f.value} overdue={f.overdue} linkLabel={f.linkLabel} />
        ))}
        <FieldRow label="Fee status" value={feeStatusValue} />

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
