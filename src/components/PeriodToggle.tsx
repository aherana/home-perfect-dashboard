import type { PeriodSelection } from "@/lib/types";

interface PeriodToggleProps {
  periods: { id: PeriodSelection; label: string }[];
  active: PeriodSelection;
  onChange: (period: PeriodSelection) => void;
}

export function PeriodToggle({ periods, active, onChange }: PeriodToggleProps) {
  return (
    <div
      role="group"
      aria-label="Reporting period"
      className="mb-2 inline-flex gap-0.5 rounded-full border border-card-line p-[3px]"
    >
      {periods.map((p) => {
        const isActive = p.id === active;
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(p.id)}
            className={
              isActive
                ? "min-h-8 rounded-full bg-amber px-3.5 py-1.5 text-[12.5px] font-semibold text-white"
                : "min-h-8 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold text-fg-muted"
            }
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
