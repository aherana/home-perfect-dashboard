import type { AgingSegment } from "@/lib/types";

interface AgingBarProps {
  segments: AgingSegment[];
  note?: string;
}

export function AgingBar({ segments, note }: AgingBarProps) {
  return (
    <div>
      <div className="mb-2.5 flex h-[34px] overflow-hidden rounded">
        {segments.map((seg, i) => (
          <div
            key={seg.label}
            data-testid={`aging-segment-${i}`}
            style={{ width: `${seg.percent}%`, background: seg.color }}
            className="flex items-center justify-center text-[11.5px] font-semibold text-white"
          >
            {seg.amount}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4.5 text-xs text-fg-muted">
        {segments.map((seg) => (
          <span key={seg.label} className="inline-flex items-center gap-1.5">
            <i style={{ background: seg.color }} className="inline-block h-2 w-2 rounded-sm" />
            {seg.label}
          </span>
        ))}
      </div>
      {note && <div className="mt-2 text-[11.5px] text-fg-muted">{note}</div>}
    </div>
  );
}
