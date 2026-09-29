import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdjusterCaseCard } from "./AdjusterCaseCard";
import { Toast, ToastProvider } from "./Toast";
import type { AdjusterCase } from "@/lib/types";

const baseCase: AdjusterCase = {
  id: "DASH-4821",
  claimRef: "Claim # 04-9821-X9 · Temecula — Slab Leak (Cat 3)",
  carrier: "State Farm",
  flag: "9d overdue",
  fields: [
    { label: "Carrier", value: "State Farm", linkLabel: "State Farm claims" },
    { label: "Supplement", value: "#1 · $2,800 · pending review", overdue: true },
  ],
  chips: [
    { id: "chip-4821-mica", status: "ok", text: "MICA 4/4 Complete" },
    { id: "chip-4821-coc", status: "warn", text: "COC Missing", okText: "COC Signed" },
  ],
  actionOptions: ["Draft Follow-up", "Generate Packet", "Request COC Signature", "View Claim", "✓ Mark Resolved"],
  actionVariant: "primary",
  resolveChipId: "chip-4821-coc",
  aiInsight: {
    patternLabel: "State Farm pattern",
    pattern: "commonly reduces equipment run-time line items.",
    suggestedNoteLabel: "Suggested F9 note",
    suggestedNote: "Extended dry time required.",
    insertable: true,
    copyLabel: "Copy to F9 Note",
    modalTitle: "Edit F9 Note",
  },
};

function renderCard(props: Partial<React.ComponentProps<typeof AdjusterCaseCard>> = {}) {
  return render(
    <ToastProvider>
      <AdjusterCaseCard
        data={baseCase}
        onResolveChip={() => {}}
        onUndoChip={() => {}}
        resolvedChipIds={new Set()}
        noteInserted={false}
        onRequestInsert={() => {}}
        onOpenDetails={() => {}}
        {...props}
      />
      <Toast />
    </ToastProvider>
  );
}

describe("AdjusterCaseCard", () => {
  it("renders the case id, claim reference, and the overdue flag", () => {
    renderCard();
    expect(screen.getByText("DASH-4821")).toBeInTheDocument();
    expect(screen.getByText(baseCase.claimRef)).toBeInTheDocument();
    expect(screen.getByText("9d overdue")).toBeInTheDocument();
  });

  it("calls onOpenDetails when the case title is clicked", async () => {
    const user = userEvent.setup();
    const onOpenDetails = jest.fn();
    renderCard({ onOpenDetails });
    await user.click(screen.getByText("DASH-4821"));
    expect(onOpenDetails).toHaveBeenCalledTimes(1);
  });

  it("renders each field row, including dead-linked ones", () => {
    renderCard();
    expect(screen.getByText("Carrier")).toBeInTheDocument();
    expect(screen.getByText("State Farm")).toBeInTheDocument();
    expect(screen.getByText("#1 · $2,800 · pending review")).toBeInTheDocument();
  });

  it("displays a resolved chip's okText, not its raw stored text", () => {
    renderCard({
      data: {
        ...baseCase,
        chips: [{ id: "chip-4821-coc", status: "ok", text: "COC Missing", okText: "COC Signed" }],
      },
    });
    expect(screen.getByText("COC Signed")).toBeInTheDocument();
    expect(screen.queryByText("COC Missing")).not.toBeInTheDocument();
  });

  it("shows an Undo link only for chips resolved in this session, and calls onUndoChip", async () => {
    const user = userEvent.setup();
    const onUndoChip = jest.fn();
    renderCard({
      data: {
        ...baseCase,
        chips: [{ id: "chip-4821-coc", status: "ok", text: "COC Missing", okText: "COC Signed" }],
      },
      resolvedChipIds: new Set(["chip-4821-coc"]),
      onUndoChip,
    });
    const undo = screen.getByText("↺ Undo");
    await user.click(undo);
    expect(onUndoChip).toHaveBeenCalledWith("chip-4821-coc");
  });

  it("does not show an Undo link for a chip that started out resolved", () => {
    renderCard({ resolvedChipIds: new Set() });
    expect(screen.queryByText("↺ Undo")).not.toBeInTheDocument();
  });

  it("calls onResolveChip with the configured resolve chip id when resolved", async () => {
    const user = userEvent.setup();
    const onResolveChip = jest.fn();
    renderCard({ onResolveChip });
    await user.selectOptions(screen.getByRole("combobox"), "✓ Mark Resolved");
    expect(onResolveChip).toHaveBeenCalledWith("chip-4821-coc");
  });

  it("wires the AI insight's insert button to onRequestInsert instead of managing insert state itself", async () => {
    const user = userEvent.setup();
    const onRequestInsert = jest.fn();
    renderCard({ onRequestInsert });
    await user.click(screen.getByRole("button", { name: /AI Insight/i }));
    await user.click(screen.getByRole("button", { name: "Copy to F9 Note" }));
    expect(onRequestInsert).toHaveBeenCalled();
  });

  it("shows the inserted state when noteInserted is true", async () => {
    const user = userEvent.setup();
    renderCard({ noteInserted: true });
    await user.click(screen.getByRole("button", { name: /AI Insight/i }));
    expect(screen.getByRole("button", { name: "✓ Copied to F9 Note" })).toBeDisabled();
  });
});
