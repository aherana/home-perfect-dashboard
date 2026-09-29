import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdjusterDefenseView } from "./AdjusterDefenseView";
import { ToastProvider } from "./Toast";
import * as csv from "@/lib/csv";
import type { AdjusterCase } from "@/lib/types";

jest.mock("@/lib/csv", () => ({
  ...jest.requireActual("@/lib/csv"),
  downloadCsv: jest.fn(),
}));

const cases: AdjusterCase[] = [
  {
    id: "DASH-4821",
    claimRef: "Claim # 04-9821-X9",
    carrier: "State Farm",
    fields: [{ label: "Carrier", value: "State Farm" }],
    chips: [{ id: "chip-4821-coc", status: "warn", text: "COC Missing", okText: "COC Signed" }],
    actionOptions: ["View Claim", "✓ Mark Resolved"],
    resolveChipId: "chip-4821-coc",
    aiInsight: {
      patternLabel: "State Farm pattern",
      pattern: "reduces run-time line items.",
      suggestedNoteLabel: "Suggested F9 note",
      suggestedNote: "Extended dry time required.",
      insertable: true,
      copyLabel: "Copy to F9 Note",
      modalTitle: "Edit F9 Note",
    },
  },
  {
    id: "DASH-4835",
    claimRef: "Claim # AAA-2291-C4",
    carrier: "Auto Club (AAA)",
    fields: [{ label: "Carrier", value: "Auto Club (AAA)" }],
    chips: [{ id: "chip-4835-log", status: "warn", text: "Day 2 Reading Needed", okText: "Day 2 Logged" }],
    actionOptions: ["Log Moisture", "✓ Mark Resolved"],
    resolveChipId: "chip-4835-log",
  },
];

function renderView(props: Partial<React.ComponentProps<typeof AdjusterDefenseView>> = {}) {
  return render(
    <ToastProvider>
      <AdjusterDefenseView initialCases={cases} {...props} />
    </ToastProvider>
  );
}

describe("AdjusterDefenseView", () => {
  it("renders every case", () => {
    renderView();
    expect(screen.getByText("DASH-4821")).toBeInTheDocument();
    expect(screen.getByText("DASH-4835")).toBeInTheDocument();
  });

  it("reports the initial open-issue count on mount", () => {
    const onIssueCountChange = jest.fn();
    renderView({ onIssueCountChange });
    expect(onIssueCountChange).toHaveBeenCalledWith(2);
  });

  it("resolving a chip shows an Undo link, and Undo reverts the chip and count", async () => {
    const user = userEvent.setup();
    const onIssueCountChange = jest.fn();
    renderView({ onIssueCountChange });

    // combobox[0] is the toolbar's carrier filter; combobox[1] is DASH-4821's action select
    await user.selectOptions(screen.getAllByRole("combobox")[1], "✓ Mark Resolved");
    expect(screen.getByText("COC Signed")).toBeInTheDocument();
    expect(onIssueCountChange).toHaveBeenLastCalledWith(1);
    const undo = screen.getByText("↺ Undo");

    await user.click(undo);
    expect(screen.getByText("COC Missing")).toBeInTheDocument();
    expect(onIssueCountChange).toHaveBeenLastCalledWith(2);
    expect(screen.queryByText("↺ Undo")).not.toBeInTheDocument();
  });

  it("filters cases by free-text search", async () => {
    const user = userEvent.setup();
    renderView();
    await user.type(screen.getByPlaceholderText(/Search job/i), "4835");
    expect(screen.queryByText("DASH-4821")).not.toBeInTheDocument();
    expect(screen.getByText("DASH-4835")).toBeInTheDocument();
  });

  it("filters cases by carrier", async () => {
    const user = userEvent.setup();
    renderView();
    await user.selectOptions(screen.getByRole("combobox", { name: /carrier/i }), "State Farm");
    expect(screen.getByText("DASH-4821")).toBeInTheDocument();
    expect(screen.queryByText("DASH-4835")).not.toBeInTheDocument();
  });

  it("filters cases by status", async () => {
    const user = userEvent.setup();
    renderView();
    // resolve DASH-4821's only chip, so it has no open issues left
    await user.selectOptions(screen.getAllByRole("combobox")[1], "✓ Mark Resolved");
    await user.click(screen.getByRole("button", { name: "Resolved" }));
    expect(screen.getByText("DASH-4821")).toBeInTheDocument();
    expect(screen.queryByText("DASH-4835")).not.toBeInTheDocument();
  });

  it("exports the currently visible cases as CSV", async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(csv.downloadCsv).toHaveBeenCalledWith("adjuster-defense.csv", expect.stringContaining("DASH-4821"));
  });

  it("opens the claim detail modal when a case title is clicked, and closes it", async () => {
    const user = userEvent.setup();
    renderView();

    await user.click(screen.getByText("DASH-4821"));
    const dialog = screen.getByRole("dialog", { name: /DASH-4821/ });
    expect(within(dialog).getByText("Claim # 04-9821-X9")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the correct case's detail modal, not always the same one", async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(screen.getByText("DASH-4835"));
    expect(screen.getByRole("dialog", { name: /DASH-4835/ })).toBeInTheDocument();
  });

  it("opens the note modal on insert request, copies the note to the clipboard, and marks it committed on save", async () => {
    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, "writeText");
    renderView();
    await user.click(screen.getByRole("button", { name: /AI Insight/i }));
    await user.click(screen.getByRole("button", { name: "Copy to F9 Note" }));
    const dialog = screen.getByRole("dialog", { name: "Edit F9 Note" });
    await user.click(within(dialog).getByRole("button", { name: "Copy to F9 Note" }));
    expect(writeText).toHaveBeenCalledWith("Extended dry time required.");
    expect(screen.getByRole("button", { name: "✓ Copied to F9 Note" })).toBeDisabled();
  });
});
