import type { AdjusterCasesData, ApiToggleState, ExecutiveData, ProfileData, ReferralData } from "./types";

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchProfile(): Promise<ProfileData> {
  return getJson<ProfileData>("/api/profile");
}

export function fetchExecutiveData(): Promise<ExecutiveData> {
  return getJson<ExecutiveData>("/api/executive");
}

export function fetchAdjusterCases(): Promise<AdjusterCasesData> {
  return getJson<AdjusterCasesData>("/api/adjuster-cases");
}

export function fetchReferralData(): Promise<ReferralData> {
  return getJson<ReferralData>("/api/referral-partners");
}

export function fetchApiToggleState(): Promise<ApiToggleState> {
  return getJson<ApiToggleState>("/api/toggle");
}

export async function toggleApi(): Promise<ApiToggleState> {
  const res = await fetch("/api/toggle", { method: "POST" });
  if (!res.ok) {
    throw new Error(`POST /api/toggle failed with status ${res.status}`);
  }
  return res.json() as Promise<ApiToggleState>;
}
