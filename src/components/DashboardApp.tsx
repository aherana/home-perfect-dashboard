"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "./DashboardShell";
import { ApiToggle } from "./ApiToggle";
import { fetchAdjusterCases, fetchExecutiveData, fetchProfile, fetchReferralData } from "@/lib/api-client";
import type { DashboardData } from "@/lib/types";

export function DashboardApp() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profile, executive, cases, referral] = await Promise.all([
          fetchProfile(),
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

  if (error) {
    return (
      <div className="flex items-center justify-between gap-4 p-6">
        <div role="alert" className="text-sm text-amber">
          {error}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ApiToggle />
          <button
            type="button"
            onClick={retry}
            className="min-h-9 rounded border border-card-line px-3.5 py-2 text-[12.5px] font-semibold text-fg"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div role="status" className="p-6 text-sm text-fg-muted">
        Loading dashboard…
      </div>
    );
  }

  return <DashboardShell data={data} />;
}
