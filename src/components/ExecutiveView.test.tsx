import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExecutiveView } from "./ExecutiveView";
import { ToastProvider } from "./Toast";
import type { AgingSegment, CarrierAging, Period, PeriodStat } from "@/lib/types";

const periodStats: Record<Period, PeriodStat> = {
  day: { value: "67%", sub: "2 signed / 3 dispatched · today" },
  week: { value: "75%", sub: "9 signed / 12 dispatched · this week" },
  month: { value: "78.2%", sub: "36 signed / 46 dispatched · this month" },
  year: { value: "76.8%", sub: "406 signed / 529 dispatched · this year" },
};

const segments: AgingSegment[] = [{ label: "0–30 days", amount: "$162k", percent: 40.9, color: "#2F9E6E" }];
const carriers: CarrierAging[] = [{ name: "State Farm", amount: "$112k", segments: [{ percent: 100, color: "#2F9E6E" }] }];

function renderView(referralPending = { total: 5250, count: 7 }) {
  return render(
    <ToastProvider>
      <ExecutiveView
        totalAr={{
          value: "$348,250",
          sub: "34 active claims",
          tag: "as of today",
          dso: { value: "DSO: 58 days", target: "industry target 42" },
        }}
        criticalAr={{ value: "$84,100", sub: "stuck with adjusters", tag: "as of today" }}
        periodStats={periodStats}
        referralPending={referralPending}
        agingSegments={segments}
        agingNote="Unbilled WIP is not counted in AR."
        carriers={carriers}
        carrierInsight={{
          patternLabel: "Pattern",
          pattern: "State Farm's balance skews heavily red (90+ days).",
          suggestedNoteLabel: "Suggested action",
          suggestedNote: "Escalate the Temecula slab-leak claim this week.",
        }}
      />
    </ToastProvider>
  );
}

describe("ExecutiveView", () => {
  it("renders the AR and critical AR KPIs with their freshness tags", () => {
    renderView();
    expect(screen.getByText("$348,250")).toBeInTheDocument();
    expect(screen.getByText("34 active claims")).toBeInTheDocument();
    expect(screen.getByText("$84,100")).toBeInTheDocument();
    expect(screen.getAllByText("as of today").length).toBeGreaterThanOrEqual(2);
  });

  it("defaults the closing rate to the month period", () => {
    renderView();
    expect(screen.getByText("78.2%")).toBeInTheDocument();
    expect(screen.getByText(periodStats.month.sub)).toBeInTheDocument();
  });

  it("switches the closing rate when a different period is selected", async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(screen.getByRole("button", { name: "Year" }));
    expect(screen.getByText("76.8%")).toBeInTheDocument();
    expect(screen.getByText(periodStats.year.sub)).toBeInTheDocument();
  });

  it("renders referral pending total formatted as currency and the spiff count", () => {
    renderView({ total: 5250, count: 7 });
    expect(screen.getByText("$5,250")).toBeInTheDocument();
    expect(screen.getByText("7 spiffs due")).toBeInTheDocument();
  });

  it("renders the aging bar and carrier breakdown", () => {
    renderView();
    expect(screen.getByText("0–30 days")).toBeInTheDocument();
    expect(screen.getByText("State Farm")).toBeInTheDocument();
  });

  it("reveals a custom date range picker and hides it again when switching back", async () => {
    const user = userEvent.setup();
    renderView();
    expect(screen.queryByLabelText(/from/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Custom" }));
    expect(screen.getByLabelText(/from/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Month" }));
    expect(screen.queryByLabelText(/from/i)).not.toBeInTheDocument();
  });

  it("computes the closing rate for a valid custom range on Apply", async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(screen.getByRole("button", { name: "Custom" }));
    await user.type(screen.getByLabelText(/from/i), "2026-09-01");
    await user.type(screen.getByLabelText(/to/i), "2026-09-05");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("66.7%")).toBeInTheDocument();
    expect(screen.getByText(/10 signed \/ 15 dispatched/)).toBeInTheDocument();
  });

  it("renders the carrier-escalation AI insight and keeps it collapsed by default", async () => {
    const user = userEvent.setup();
    renderView();
    const toggle = screen.getByRole("button", { name: /who to escalate first/i });
    expect(screen.queryByText(/Escalate the Temecula slab-leak claim/, { exact: false })).not.toBeVisible();
    await user.click(toggle);
    expect(screen.getByText(/Escalate the Temecula slab-leak claim/, { exact: false })).toBeVisible();
  });

  it("copies the carrier-escalation suggestion to the clipboard via the edit modal", async () => {
    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, "writeText");
    renderView();
    await user.click(screen.getByRole("button", { name: /who to escalate first/i }));
    await user.click(screen.getByRole("button", { name: "Copy to Clipboard" }));

    const dialog = screen.getByRole("dialog", { name: "Edit Note" });
    expect(dialog).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Copy to Clipboard" }));

    expect(writeText).toHaveBeenCalledWith("Escalate the Temecula slab-leak claim this week.");
    expect(screen.getByRole("button", { name: "✓ Copied to Clipboard" })).toBeDisabled();
  });

  it("opens the carrier detail modal when a carrier name is clicked, and closes it", async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(screen.getByText("State Farm"));
    const dialog = screen.getByRole("dialog", { name: /State Farm/ });
    expect(within(dialog).getByText("$112k")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
