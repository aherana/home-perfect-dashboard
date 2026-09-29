interface TabDef {
  id: string;
  label: string;
  badge?: number;
}

interface TabNavProps {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}

export function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-card-line px-6">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={
              isActive
                ? "flex min-h-11 items-center whitespace-nowrap border-b-2 border-amber px-4 text-sm font-semibold text-fg"
                : "flex min-h-11 items-center whitespace-nowrap border-b-2 border-transparent px-4 text-sm text-fg-muted"
            }
          >
            {tab.label}
            {!!tab.badge && (
              <span className="ml-1.5 rounded-full bg-amber px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
