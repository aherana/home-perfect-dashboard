import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardShell } from "./DashboardShell";
import * as apiClient from "@/lib/api-client";
import type { DashboardData } from "@/lib/types";

jest.mock("@/lib/api-client");

beforeEach(() => {
  // Never resolves by default, so unrelated tests don't get an act() warning
  // when ApiToggle's initial fetch settles after the test body has finished.
  jest.mocked(apiClient.fetchApiToggleState).mockReturnValue(new Promise(() => {}));
});

const data: DashboardData = {
  brandName: "Home Perfect — Ops Command Center",
  location: "Temecula & Murrieta Ops",
  notificationCount: 3,
  avatarInitial: "A",
  totalAr: { value: "$348,250", sub: "34 active claims", tag: "as of today", dso: { value: "DSO: 58 days", target: "industry target 42" } },
  criticalAr: { value: "$84,100", sub: "stuck with adjusters", tag: "as of today" },
  periodStats: {
    day: { value: "67%", sub: "today" },
    week: { value: "75%", sub: "this week" },
    month: { value: "78.2%", sub: "this month" },
    year: { value: "76.8%", sub: "this year" },
  },
  agingSegments: [{ label: "0–30 days", amount: "$162k", percent: 40.9, color: "#2F9E6E" }],
  agingNote: "note",
  carriers: [{ name: "State Farm", amount: "$112k", segments: [{ percent: 100, color: "#2F9E6E" }] }],
  cases: [
    {
      id: "DASH-4821",
      claimRef: "Claim # 04-9821-X9",
      carrier: "State Farm",
      fields: [{ label: "Carrier", value: "State Farm" }],
      chips: [{ id: "chip-4821-coc", status: "warn", text: "COC Missing", okText: "COC Signed" }],
      actionOptions: ["View Claim", "✓ Mark Resolved"],
      resolveChipId: "chip-4821-coc",
    },
  ],
  partners: [
    {
      id: "tvp",
      name: "Temecula Valley Plumbing",
      rank: 1,
      fields: [{ label: "Leads sent", value: "6" }],
      feeStatus: "pending",
      pendingAmount: 750,
    },
  ],
};

describe("DashboardShell", () => {
  it("renders the brand name and defaults to the Executive tab", () => {
    render(<DashboardShell data={data} />);
    expect(screen.getByText("Home Perfect — Ops Command Center")).toBeInTheDocument();
    expect(screen.getByText("$348,250")).toBeVisible();
  });

  it("shows the open-issue count as a badge on the Adjuster Defense tab", () => {
    render(<DashboardShell data={data} />);
    expect(screen.getByRole("tab", { name: /Adjuster Defense/ })).toHaveTextContent("1");
  });

  it("switches to the Adjuster Defense view on tab click", async () => {
    const user = userEvent.setup();
    render(<DashboardShell data={data} />);
    await user.click(screen.getByRole("tab", { name: /Adjuster Defense/ }));
    expect(screen.getByText("DASH-4821")).toBeVisible();
  });

  it("decrements the tab badge when a chip is resolved", async () => {
    const user = userEvent.setup();
    render(<DashboardShell data={data} />);
    await user.click(screen.getByRole("tab", { name: /Adjuster Defense/ }));
    // combobox[0] is the toolbar's carrier filter; combobox[1] is the case's action select
    await user.selectOptions(screen.getAllByRole("combobox")[1], "✓ Mark Resolved");
    expect(screen.getByRole("tab", { name: /Adjuster Defense/ })).not.toHaveTextContent("1");
  });

  it("reduces the Executive tab's pending-referral KPI after a fee is settled on the Referral tab", async () => {
    const user = userEvent.setup();
    render(<DashboardShell data={data} />);

    await user.click(screen.getByRole("tab", { name: /Referral Leaderboard/ }));
    await user.selectOptions(screen.getByRole("combobox"), "Approve Fee");

    await user.click(screen.getByRole("tab", { name: /Executive AR/ }));
    expect(screen.getByText("$0")).toBeVisible();
  });

  it("renders the floating chat assistant", async () => {
    const user = userEvent.setup();
    render(<DashboardShell data={data} />);
    await user.click(screen.getByRole("button", { name: /AI assistant/i }));
    expect(screen.getByText("Ask AI / Get Help")).toBeInTheDocument();
  });

  it("links to the API health endpoint", () => {
    render(<DashboardShell data={data} />);
    expect(screen.getByRole("link", { name: "API Health" })).toHaveAttribute("href", "/api/health");
  });

  it("opens the claim detail modal when a case title is clicked", async () => {
    const user = userEvent.setup();
    render(<DashboardShell data={data} />);
    await user.click(screen.getByRole("tab", { name: /Adjuster Defense/ }));
    await user.click(screen.getByText("DASH-4821"));
    expect(screen.getByRole("dialog", { name: /DASH-4821/ })).toBeInTheDocument();
  });
});
