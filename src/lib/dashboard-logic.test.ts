import {
  chipDisplayText,
  computeCustomRangeClosing,
  confirmedCopyLabel,
  countOpenIssues,
  filterCases,
  filterPartners,
  resolveChip,
  settleFee,
  sumPendingFees,
  unresolveChip,
  unsettleFee,
} from "./dashboard-logic";
import type { AdjusterCase, ReferralPartner } from "./types";

function makeCase(overrides: Partial<AdjusterCase> = {}): AdjusterCase {
  return {
    id: "DASH-1",
    claimRef: "Claim # 1",
    carrier: "State Farm",
    fields: [],
    chips: [
      { id: "c1", status: "ok", text: "MICA Complete" },
      { id: "c2", status: "warn", text: "COC Missing", okText: "COC Signed" },
    ],
    actionOptions: ["View Claim", "✓ Mark Resolved"],
    resolveChipId: "c2",
    ...overrides,
  };
}

describe("countOpenIssues", () => {
  it("counts warn chips across all cases", () => {
    const cases = [
      makeCase(),
      makeCase({
        id: "DASH-2",
        chips: [
          { id: "c3", status: "warn", text: "Log Needed", okText: "Logged" },
          { id: "c4", status: "neutral", text: "N/A" },
        ],
      }),
    ];
    expect(countOpenIssues(cases)).toBe(2);
  });

  it("returns 0 when there are no warn chips", () => {
    const cases = [makeCase({ chips: [{ id: "c1", status: "ok", text: "Done" }] })];
    expect(countOpenIssues(cases)).toBe(0);
  });
});

describe("chipDisplayText", () => {
  it("shows the base text while a chip is still warn", () => {
    expect(chipDisplayText({ id: "c2", status: "warn", text: "COC Missing", okText: "COC Signed" })).toBe(
      "COC Missing"
    );
  });

  it("shows okText once a chip is resolved", () => {
    expect(chipDisplayText({ id: "c2", status: "ok", text: "COC Missing", okText: "COC Signed" })).toBe(
      "COC Signed"
    );
  });

  it("falls back to text when a resolved chip has no okText", () => {
    expect(chipDisplayText({ id: "c1", status: "ok", text: "MICA Complete" })).toBe("MICA Complete");
  });
});

describe("resolveChip / unresolveChip", () => {
  it("flips the targeted chip to ok without losing its original text", () => {
    const cases = [makeCase()];
    const resolved = resolveChip(cases, "DASH-1", "c2");
    const chip = resolved[0].chips.find((c) => c.id === "c2")!;
    expect(chip.status).toBe("ok");
    expect(chip.text).toBe("COC Missing");
  });

  it("does not mutate the original array or case", () => {
    const cases = [makeCase()];
    const resolved = resolveChip(cases, "DASH-1", "c2");
    expect(resolved).not.toBe(cases);
    expect(cases[0].chips.find((c) => c.id === "c2")!.status).toBe("warn");
  });

  it("unresolveChip reverts a resolved chip back to warn", () => {
    const cases = [makeCase()];
    const resolved = resolveChip(cases, "DASH-1", "c2");
    const reverted = unresolveChip(resolved, "DASH-1", "c2");
    expect(reverted[0].chips.find((c) => c.id === "c2")!.status).toBe("warn");
  });

  it("round-trips: resolve then unresolve restores the original chip data", () => {
    const cases = [makeCase()];
    const roundTripped = unresolveChip(resolveChip(cases, "DASH-1", "c2"), "DASH-1", "c2");
    expect(roundTripped).toEqual(cases);
  });
});

function makePartner(overrides: Partial<ReferralPartner> = {}): ReferralPartner {
  return {
    id: "p1",
    name: "Temecula Valley Plumbing",
    rank: 1,
    fields: [],
    feeStatus: "pending",
    pendingAmount: 750,
    ...overrides,
  };
}

describe("sumPendingFees", () => {
  it("sums pending amounts and counts pending partners", () => {
    const partners = [
      makePartner({ id: "p1", pendingAmount: 750 }),
      makePartner({ id: "p2", pendingAmount: 1000 }),
      makePartner({ id: "p3", feeStatus: "paid", pendingAmount: undefined }),
    ];
    expect(sumPendingFees(partners)).toEqual({ total: 1750, count: 2 });
  });

  it("returns zero when nothing is pending", () => {
    const partners = [makePartner({ feeStatus: "paid", pendingAmount: undefined })];
    expect(sumPendingFees(partners)).toEqual({ total: 0, count: 0 });
  });
});

describe("settleFee / unsettleFee", () => {
  it("marks the targeted partner as paid", () => {
    const partners = [makePartner({ id: "p1" }), makePartner({ id: "p2" })];
    const result = settleFee(partners, "p1");
    expect(result.find((p) => p.id === "p1")!.feeStatus).toBe("paid");
  });

  it("leaves other partners untouched and does not mutate the input", () => {
    const partners = [makePartner({ id: "p1" }), makePartner({ id: "p2" })];
    const result = settleFee(partners, "p1");
    expect(result).not.toBe(partners);
    expect(partners.find((p) => p.id === "p1")!.feeStatus).toBe("pending");
    expect(result.find((p) => p.id === "p2")!.feeStatus).toBe("pending");
  });

  it("unsettleFee reverts a paid partner back to pending, keeping its pending amount", () => {
    const partners = [makePartner({ id: "p1", pendingAmount: 750 })];
    const paid = settleFee(partners, "p1");
    const reverted = unsettleFee(paid, "p1");
    expect(reverted[0].feeStatus).toBe("pending");
    expect(reverted[0].pendingAmount).toBe(750);
  });
});

describe("computeCustomRangeClosing", () => {
  it("returns null for an invalid range (to before from)", () => {
    expect(computeCustomRangeClosing("2026-09-10", "2026-09-01")).toBeNull();
  });

  it("returns null for unparsable dates", () => {
    expect(computeCustomRangeClosing("", "2026-09-01")).toBeNull();
  });

  it("computes signed/dispatched counts and a percentage for a valid range", () => {
    const result = computeCustomRangeClosing("2026-09-01", "2026-09-05");
    // 5 days inclusive -> signed = days*2, dispatched = days*3
    expect(result).not.toBeNull();
    expect(result!.value).toBe("66.7%");
    expect(result!.sub).toContain("10 signed / 15 dispatched");
    expect(result!.sub).toContain("2026-09-01");
    expect(result!.sub).toContain("2026-09-05");
  });

  it("treats a single-day range as at least 1 day", () => {
    const result = computeCustomRangeClosing("2026-09-01", "2026-09-01");
    expect(result!.sub).toContain("2 signed / 3 dispatched");
  });
});

describe("confirmedCopyLabel", () => {
  it('turns "Copy to F9 Note" into "✓ Copied to F9 Note"', () => {
    expect(confirmedCopyLabel("Copy to F9 Note")).toBe("✓ Copied to F9 Note");
  });

  it('turns "Copy to Clipboard" into "✓ Copied to Clipboard"', () => {
    expect(confirmedCopyLabel("Copy to Clipboard")).toBe("✓ Copied to Clipboard");
  });

  it("falls back to prefixing with a checkmark when the label doesn't start with Copy", () => {
    expect(confirmedCopyLabel("Save note")).toBe("✓ Save note");
  });
});

describe("filterCases", () => {
  const cases = [
    makeCase({ id: "DASH-1", claimRef: "Claim # 1", carrier: "State Farm" }),
    makeCase({
      id: "DASH-2",
      claimRef: "Claim # 2",
      carrier: "Farmers",
      chips: [{ id: "c5", status: "ok", text: "All good" }],
    }),
  ];

  it("returns all cases when no filters are set", () => {
    expect(filterCases(cases, { query: "", carrier: "", status: "all" })).toHaveLength(2);
  });

  it("filters by free-text query across id and claim reference", () => {
    expect(filterCases(cases, { query: "dash-2", carrier: "", status: "all" }).map((c) => c.id)).toEqual([
      "DASH-2",
    ]);
  });

  it("filters by exact carrier match", () => {
    expect(filterCases(cases, { query: "", carrier: "Farmers", status: "all" }).map((c) => c.id)).toEqual([
      "DASH-2",
    ]);
  });

  it('filters to cases with an open (warn) chip when status is "open"', () => {
    expect(filterCases(cases, { query: "", carrier: "", status: "open" }).map((c) => c.id)).toEqual([
      "DASH-1",
    ]);
  });

  it('filters to cases with no warn chips when status is "resolved"', () => {
    expect(filterCases(cases, { query: "", carrier: "", status: "resolved" }).map((c) => c.id)).toEqual([
      "DASH-2",
    ]);
  });
});

describe("filterPartners", () => {
  const partners = [makePartner({ id: "p1", name: "Temecula Valley Plumbing" }), makePartner({ id: "p2", name: "Murrieta Pro Plumbing" })];

  it("returns all partners for an empty query", () => {
    expect(filterPartners(partners, "")).toHaveLength(2);
  });

  it("filters case-insensitively by name", () => {
    expect(filterPartners(partners, "murrieta").map((p) => p.id)).toEqual(["p2"]);
  });
});
