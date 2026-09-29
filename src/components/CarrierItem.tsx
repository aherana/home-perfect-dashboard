import type { CarrierAging } from "@/lib/types";

interface CarrierItemProps {
  carrier: CarrierAging;
  onOpenDetails: () => void;
}

export function CarrierItem({ carrier, onOpenDetails }: CarrierItemProps) {
  return (
    <div className="border-b border-card-line py-2.5 last:border-none">
      <div className="mb-1.5 flex justify-between text-[13px]">
        <button
          type="button"
          onClick={onOpenDetails}
          className="cursor-pointer underline decoration-card-line underline-offset-2 hover:text-amber hover:decoration-amber"
        >
          {carrier.name}
        </button>
        <span className="text-fg-muted">{carrier.amount}</span>
      </div>
      <div data-testid="carrier-stack" className="flex h-2.5 overflow-hidden rounded-[3px] bg-bg">
        {carrier.segments.map((seg, i) => (
          <div key={i} style={{ width: `${seg.percent}%`, background: seg.color }} className="h-full" />
        ))}
      </div>
    </div>
  );
}
