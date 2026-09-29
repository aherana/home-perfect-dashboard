import { DeadLink } from "./DeadLink";

interface FieldRowProps {
  label: string;
  value: string;
  overdue?: boolean;
  linkLabel?: string;
}

export function FieldRow({ label, value, overdue = false, linkLabel }: FieldRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-card-line py-2 text-[13px] first-of-type:mt-2">
      <span className="shrink-0 text-fg-muted">{label}</span>
      <span data-overdue={overdue} className={overdue ? "text-right font-semibold text-amber" : "text-right font-medium"}>
        {linkLabel ? <DeadLink label={linkLabel}>{value}</DeadLink> : value}
      </span>
    </div>
  );
}
