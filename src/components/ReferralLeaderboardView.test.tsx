import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReferralLeaderboardView } from "./ReferralLeaderboardView";
import { ToastProvider } from "./Toast";
import * as csv from "@/lib/csv";
import type { AiInsight, ReferralPartner } from "@/lib/types";

jest.mock("@/lib/csv", () => ({
  ...jest.requireActual("@/lib/csv"),
  downloadCsv: jest.fn(),
}));

const partners: ReferralPartner[] = [
  {
    id: "tvp",
    name: "Temecula Valley Plumbing",
    rank: 1,
    fields: [{ label: "Leads sent", value: "6" }],
    feeStatus: "pending",
    pendingAmount: 750,
  },
  {
    id: "mpp",
    name: "Murrieta Pro Plumbing",
    rank: 2,
    fields: [{ label: "Leads sent", value: "5" }],
    feeStatus: "paid",
    checkRef: "1042",
  },
];

const referralInsight: AiInsight = {
  patternLabel: "Pattern",
  pattern: "Temecula Valley Plumbing sends fewer leads but wins the most.",
  suggestedNoteLabel: "Suggested action",
  suggestedNote: "Prioritize their spiff payout and check in personally.",
};

function renderView(props: Partial<React.ComponentProps<typeof ReferralLeaderboardView>> = {}) {
  return render(
    <ToastProvider>
      <ReferralLeaderboardView initialPartners={partners} {...props} />
    </ToastProvider>
  );
}

describe("ReferralLeaderboardView", () => {
  it("renders every partner", () => {
    renderView();
    expect(screen.getByText("Temecula Valley Plumbing")).toBeInTheDocument();
    expect(screen.getByText("Murrieta Pro Plumbing")).toBeInTheDocument();
  });

  it("reports the initial pending total and count on mount", () => {
    const onPendingChange = jest.fn();
    renderView({ onPendingChange });
    expect(onPendingChange).toHaveBeenCalledWith({ total: 750, count: 1 });
  });

  it("settling a pending fee reports the decreased pending total and shows an Undo link", async () => {
    const user = userEvent.setup();
    const onPendingChange = jest.fn();
    renderView({ onPendingChange });

    await user.selectOptions(screen.getAllByRole("combobox")[0], "Approve Fee");
    expect(onPendingChange).toHaveBeenLastCalledWith({ total: 0, count: 0 });
    expect(screen.getByText("↺ Undo")).toBeInTheDocument();
  });

  it("undo reverts a settled fee and restores the pending total", async () => {
    const user = userEvent.setup();
    const onPendingChange = jest.fn();
    renderView({ onPendingChange });

    await user.selectOptions(screen.getAllByRole("combobox")[0], "Approve Fee");
    await user.click(screen.getByText("↺ Undo"));
    expect(onPendingChange).toHaveBeenLastCalledWith({ total: 750, count: 1 });
    expect(screen.queryByText("↺ Undo")).not.toBeInTheDocument();
  });

  it("filters partners by search", async () => {
    const user = userEvent.setup();
    renderView();
    await user.type(screen.getByPlaceholderText(/Search partner/i), "murrieta");
    expect(screen.queryByText("Temecula Valley Plumbing")).not.toBeInTheDocument();
    expect(screen.getByText("Murrieta Pro Plumbing")).toBeInTheDocument();
  });

  it("exports the currently visible partners as CSV", async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(csv.downloadCsv).toHaveBeenCalledWith(
      "referral-leaderboard.csv",
      expect.stringContaining("Temecula Valley Plumbing")
    );
  });

  it("renders the referral-prioritization AI insight when provided", async () => {
    const user = userEvent.setup();
    renderView({ referralInsight });
    const toggle = screen.getByRole("button", { name: /who to prioritize/i });
    await user.click(toggle);
    expect(screen.getByText(/Prioritize their spiff payout/, { exact: false })).toBeVisible();
  });

  it("copies the referral-prioritization suggestion to the clipboard via the edit modal", async () => {
    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, "writeText");
    renderView({ referralInsight });
    await user.click(screen.getByRole("button", { name: /who to prioritize/i }));
    await user.click(screen.getByRole("button", { name: "Copy to Clipboard" }));

    const dialog = screen.getByRole("dialog", { name: "Edit Note" });
    await user.click(within(dialog).getByRole("button", { name: "Copy to Clipboard" }));

    expect(writeText).toHaveBeenCalledWith("Prioritize their spiff payout and check in personally.");
    expect(screen.getByRole("button", { name: "✓ Copied to Clipboard" })).toBeDisabled();
  });

  it("opens the partner detail modal when a partner name is clicked, and closes it", async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(screen.getByText("Temecula Valley Plumbing"));
    const dialog = screen.getByRole("dialog", { name: /Temecula Valley Plumbing/ });
    expect(within(dialog).getByText("Rank #1")).toBeInTheDocument();
    expect(within(dialog).getByText("$750 Pending")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the correct partner's detail modal, not always the same one", async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(screen.getByText("Murrieta Pro Plumbing"));
    expect(screen.getByRole("dialog", { name: /Murrieta Pro Plumbing/ })).toBeInTheDocument();
  });
});
