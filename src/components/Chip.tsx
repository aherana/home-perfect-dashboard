import type { ChipStatus } from "@/lib/types";

const STATUS_CLASSES: Record<ChipStatus, string> = {
  ok: "bg-green-soft text-green",
  warn: "bg-amber-soft text-amber",
  neutral: "bg-bg text-fg-muted",
  info: "bg-info-soft text-info",
};

interface ChipProps {
  status: ChipStatus;
  children: React.ReactNode;
}

export function Chip({ status, children }: ChipProps) {
  return (
    <span
      data-status={status}
      className={`inline-block rounded-[3px] px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASSES[status]}`}
    >
      {children}
    </span>
  );
}
