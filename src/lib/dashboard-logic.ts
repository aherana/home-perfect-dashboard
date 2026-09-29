import type { AdjusterCase, AdjusterStatusFilter, CaseChip, PeriodStat, ReferralPartner } from "./types";

export function countOpenIssues(cases: AdjusterCase[]): number {
  return cases.reduce((count, c) => count + c.chips.filter((chip) => chip.status === "warn").length, 0);
}

export function chipDisplayText(chip: CaseChip): string {
  return chip.status === "ok" && chip.okText ? chip.okText : chip.text;
}

function setChipStatus(cases: AdjusterCase[], caseId: string, chipId: string, status: "ok" | "warn"): AdjusterCase[] {
  return cases.map((c) => {
    if (c.id !== caseId) return c;
    return {
      ...c,
      chips: c.chips.map((chip) => (chip.id === chipId ? { ...chip, status } : chip)),
    };
  });
}

export function resolveChip(cases: AdjusterCase[], caseId: string, chipId: string): AdjusterCase[] {
  return setChipStatus(cases, caseId, chipId, "ok");
}

export function unresolveChip(cases: AdjusterCase[], caseId: string, chipId: string): AdjusterCase[] {
  return setChipStatus(cases, caseId, chipId, "warn");
}

export function sumPendingFees(partners: ReferralPartner[]): { total: number; count: number } {
  const pending = partners.filter((p) => p.feeStatus === "pending" && p.pendingAmount !== undefined);
  return {
    total: pending.reduce((sum, p) => sum + (p.pendingAmount ?? 0), 0),
    count: pending.length,
  };
}

export function settleFee(partners: ReferralPartner[], partnerId: string): ReferralPartner[] {
  return partners.map((p) => (p.id === partnerId ? { ...p, feeStatus: "paid" as const } : p));
}

export function unsettleFee(partners: ReferralPartner[], partnerId: string): ReferralPartner[] {
  return partners.map((p) => (p.id === partnerId ? { ...p, feeStatus: "pending" as const } : p));
}

export function confirmedCopyLabel(copyLabel: string): string {
  return /^Copy\b/.test(copyLabel) ? copyLabel.replace(/^Copy\b/, "✓ Copied") : `✓ ${copyLabel}`;
}

export function computeCustomRangeClosing(from: string, to: string): PeriodStat | null {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return null;
  if (toDate < fromDate) return null;

  const days = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1);
  const signed = Math.round(days * 2);
  const dispatched = Math.round(days * 3);
  const value = ((signed / dispatched) * 100).toFixed(1) + "%";
  const sub = `${signed} signed / ${dispatched} dispatched · ${from}–${to}`;
  return { value, sub };
}

interface CaseFilters {
  query: string;
  carrier: string;
  status: AdjusterStatusFilter;
}

export function filterCases(cases: AdjusterCase[], { query, carrier, status }: CaseFilters): AdjusterCase[] {
  const q = query.trim().toLowerCase();
  return cases.filter((c) => {
    const matchesQuery =
      !q ||
      [c.id, c.claimRef, c.carrier, ...c.fields.flatMap((f) => [f.label, f.value])]
        .join(" ")
        .toLowerCase()
        .includes(q);
    const matchesCarrier = !carrier || c.carrier === carrier;
    const hasOpen = c.chips.some((chip) => chip.status === "warn");
    const matchesStatus = status === "all" || (status === "open" && hasOpen) || (status === "resolved" && !hasOpen);
    return matchesQuery && matchesCarrier && matchesStatus;
  });
}

export function filterPartners(partners: ReferralPartner[], query: string): ReferralPartner[] {
  const q = query.trim().toLowerCase();
  if (!q) return partners;
  return partners.filter((p) =>
    [p.name, ...p.fields.flatMap((f) => [f.label, f.value])]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}
