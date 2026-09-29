"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "./DashboardShell";
import { TopBar } from "./TopBar";
import { fetchAdjusterCases, fetchExecutiveData, fetchProfile, fetchReferralData } from "@/lib/api-client";
import type { DashboardData, ProfileData } from "@/lib/types";

/**
 * Header shown while loading or when the API is offline and no profile has loaded yet.
 * Only the static brand identity — no notification count or avatar, since those are real data we don't have.
 */
const FALLBACK_HEADER = {
  brandName: "Home Perfect — Ops Command Center",
  location: "Temecula & Murrieta Ops",
};

export function DashboardApp() {
  const [data, setData] = useState<DashboardData | null>(null);
  // Kept separately from `data` so the header survives a failed load (or a failed retry) with the last-known profile.
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const profileRequest = fetchProfile().then((p) => {
          if (!cancelled) setProfile(p);
          return p;
        });
        const [profile, executive, cases, referral] = await Promise.all([
          profileRequest,
          fetchExecutiveData(),
          fetchAdjusterCases(),
          fetchReferralData(),
        ]);
        if (cancelled) return;
        setData({ ...profile, ...executive, cases, ...referral });
      } catch {
        if (!cancelled) setError("Couldn't load the dashboard. Check the API and try again.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setError(null);
    setAttempt((a) => a + 1);
  };

  if (data) return <DashboardShell data={data} />;

  const header = profile ? (
    <TopBar
      brandName={profile.brandName}
      location={profile.location}
      notificationCount={profile.notificationCount}
      avatarInitial={profile.avatarInitial}
    />
  ) : (
    <TopBar {...FALLBACK_HEADER} />
  );

  if (error) {
    return (
      <>
        {header}
        <div className="flex items-center justify-between gap-4 p-6">
          <div role="alert" className="text-sm text-amber">
            {error}
          </div>
          <button
            type="button"
            onClick={retry}
            className="min-h-9 shrink-0 rounded border border-card-line px-3.5 py-2 text-[12.5px] font-semibold text-fg"
          >
            Try again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <div role="status" className="p-6 text-sm text-fg-muted">
        Loading dashboard…
      </div>
    </>
  );
}
