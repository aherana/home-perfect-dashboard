import type { CarrierAging } from "@/lib/types";

const AGING_BUCKET_LABELS = ["0–30 days", "31–60 days", "61–90 days", "90+ days"];

interface CarrierDetailModalProps {
  open: boolean;
  data: CarrierAging | null;
  onClose: () => void;
}

export function CarrierDetailModal({ open, data, onClose }: CarrierDetailModalProps) {
  if (!open || !data) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${data.name} aging detail`}
      className="fixed inset-0 z-[35] flex items-center justify-center bg-black/50"
    >
      <div className="w-[min(420px,calc(100vw-40px))] rounded-lg border border-card-line bg-card p-5">
        <div className="mb-3.5 flex items-start justify-between gap-2">
          <div className="text-[15px] font-bold">{data.name}</div>
          <div className="text-[13px] text-fg-muted">{data.amount}</div>
        </div>

        <div className="flex flex-col gap-2.5">
          {data.segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border-t border-card-line pt-2.5 text-[13px]">
              <span className="inline-flex items-center gap-1.5 text-fg-muted">
                <i style={{ background: seg.color }} className="inline-block h-2 w-2 rounded-sm" />
                {AGING_BUCKET_LABELS[i] ?? `Bucket ${i + 1}`}
              </span>
              <span className="font-semibold">{seg.percent}%</span>
            </div>
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
