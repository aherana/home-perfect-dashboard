import type { AdjusterStatusFilter } from "@/lib/types";

interface StatusOption {
  value: AdjusterStatusFilter;
  label: string;
}

interface ToolbarProps {
  searchPlaceholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  carrierOptions?: string[];
  carrier?: string;
  onCarrierChange?: (carrier: string) => void;
  statusOptions?: StatusOption[];
  status?: AdjusterStatusFilter;
  onStatusChange?: (status: AdjusterStatusFilter) => void;
  exportLabel: string;
  onExport: () => void;
}

export function Toolbar({
  searchPlaceholder,
  query,
  onQueryChange,
  carrierOptions,
  carrier,
  onCarrierChange,
  statusOptions,
  status,
  onStatusChange,
  exportLabel,
  onExport,
}: ToolbarProps) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="min-h-10 min-w-[160px] flex-1 rounded border border-card-line bg-card px-3 py-2 text-[13px] text-fg"
      />
      {carrierOptions && (
        <select
          aria-label="Filter by carrier"
          value={carrier ?? ""}
          onChange={(e) => onCarrierChange?.(e.target.value)}
          className="min-h-10 rounded border border-card-line bg-card px-2.5 py-2 text-[13px] text-fg"
        >
          <option value="">All carriers</option>
          {carrierOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}
      {statusOptions && (
        <div role="group" aria-label="Status filter" className="inline-flex overflow-hidden rounded-md border border-card-line">
          {statusOptions.map((opt) => {
            const isActive = opt.value === status;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => onStatusChange?.(opt.value)}
                className={
                  isActive
                    ? "min-h-10 bg-amber px-3.5 py-2 text-[12.5px] font-semibold text-white"
                    : "min-h-10 bg-card px-3.5 py-2 text-[12.5px] font-semibold text-fg-muted"
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
      <button
        type="button"
        onClick={onExport}
        className="min-h-10 whitespace-nowrap rounded border border-card-line px-3.5 py-2 text-[12.5px] font-semibold text-fg"
      >
        {exportLabel}
      </button>
    </div>
  );
}
