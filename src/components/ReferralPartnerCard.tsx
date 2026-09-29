import { FieldRow } from "./FieldRow";
import { FeeSelect } from "./FeeSelect";
import type { ReferralPartner } from "@/lib/types";

interface ReferralPartnerCardProps {
  data: ReferralPartner;
  onSettleFee: (partnerId: string, amount: number) => void;
  onUndoFee: (partnerId: string) => void;
  settledInSession: boolean;
  onOpenDetails: () => void;
}

export function ReferralPartnerCard({
  data,
  onSettleFee,
  onUndoFee,
  settledInSession,
  onOpenDetails,
}: ReferralPartnerCardProps) {
  const options =
    data.feeStatus === "pending"
      ? [`$${data.pendingAmount} Pending`, "Approve Fee", "Mark Paid – Check #"]
      : ["Paid", `View Check #${data.checkRef}`, "Mark Unpaid"];

  return (
    <div className="flex flex-col gap-0.5 rounded-card border border-card-line bg-card p-4">
      <div className="mb-0.5">
        <button
          type="button"
          onClick={onOpenDetails}
          className="cursor-pointer text-[14.5px] font-bold underline decoration-card-line underline-offset-2 hover:text-amber hover:decoration-amber"
        >
          {data.name}
        </button>
        <div className="mt-0.5 text-[11.5px] text-fg-muted">Rank #{data.rank}</div>
      </div>

      {data.fields.map((f) => (
        <FieldRow key={f.label} label={f.label} value={f.value} overdue={f.overdue} linkLabel={f.linkLabel} />
      ))}

      <div className="flex items-center gap-2.5">
        <FeeSelect
          options={options}
          status={data.feeStatus}
          pendingAmount={data.pendingAmount}
          onSettle={(amount) => onSettleFee(data.id, amount)}
        />
        {data.feeStatus === "paid" && settledInSession && (
          <button
            type="button"
            onClick={() => onUndoFee(data.id)}
            className="shrink-0 text-[11px] text-fg-muted underline hover:text-amber"
          >
            ↺ Undo
          </button>
        )}
      </div>
    </div>
  );
}
