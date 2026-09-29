interface KpiCardProps {
  label: string;
  value: string;
  sub: string;
  tag?: string;
  hero?: boolean;
  dso?: { value: string; target: string };
}

export function KpiCard({ label, value, sub, tag, hero, dso }: KpiCardProps) {
  return (
    <div
      data-testid="kpi-card"
      data-variant={hero ? "hero" : "default"}
      className={
        hero
          ? "rounded-card border border-line bg-panel-2 p-4 text-text-hi"
          : "rounded-card border border-card-line bg-card p-4 text-fg"
      }
    >
      <div className={`mb-1.5 text-[12.5px] ${hero ? "text-text-lo" : "text-fg-muted"}`}>
        {label}
        {tag && (
          <span data-testid="kpi-tag" className="ml-1.5 text-[10px] font-medium opacity-65">
            {tag}
          </span>
        )}
      </div>
      <div className={hero ? "text-[30px] font-bold tracking-tight text-white" : "text-[26px] font-bold tracking-tight"}>
        {value}
      </div>
      <div className={`mt-1 text-xs ${hero ? "text-text-lo" : "text-fg-muted"}`}>{sub}</div>
      {dso && (
        <div
          data-testid="kpi-dso"
          className="mt-2 border-t border-white/10 pt-2 text-[12.5px] font-semibold text-amber"
        >
          {dso.value} <span className="font-normal text-text-lo">· {dso.target}</span>
        </div>
      )}
    </div>
  );
}
