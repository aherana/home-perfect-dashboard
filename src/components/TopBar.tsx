import { ApiToggle } from "./ApiToggle";

interface TopBarProps {
  brandName: string;
  location: string;
  /** Omitted when the profile couldn't be loaded (e.g. the API is offline) — the badge is hidden rather than showing a made-up count. */
  notificationCount?: number;
  avatarInitial?: string;
}

export function TopBar({ brandName, location, notificationCount, avatarInitial }: TopBarProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-card-line bg-bg px-6 py-4">
      <div className="flex flex-col gap-0.5">
        <div className="text-[17px] font-bold tracking-tight">{brandName}</div>
        <div className="text-[12.5px] text-fg-muted">{location}</div>
      </div>
      <div className="flex items-center gap-3.5 text-[13px] text-fg-muted">
        <ApiToggle />
        <a
          href="/api/health"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] underline decoration-card-line underline-offset-2 hover:text-amber hover:decoration-amber"
        >
          API Health
        </a>
        {notificationCount !== undefined && (
          <span>
            🔔{" "}
            <span className="rounded-full bg-amber px-1.5 py-px text-[11px] font-bold text-white">
              {notificationCount}
            </span>
          </span>
        )}
        {avatarInitial !== undefined && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card-line text-xs font-bold text-fg">
            {avatarInitial}
          </span>
        )}
      </div>
    </div>
  );
}
