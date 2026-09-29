import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ClaimDetailModal } from "./ClaimDetailModal";
import { ToastProvider } from "./Toast";
import type { AdjusterCase } from "@/lib/types";

const caseData: AdjusterCase = {
  id: "DASH-4821",
  claimRef: "Claim # 04-9821-X9 · Temecula — Slab Leak (Cat 3)",
  carrier: "State Farm",
  flag: "9d overdue",
  fields: [
    { label: "Carrier", value: "State Farm" },
    { label: "Adjuster", value: "Dave Miller (Ext 401)" },
    { label: "Invoice amount", value: "$8,450.00" },
    { label: "Supplement", value: "#1 · $2,800 · pending review", overdue: true },
  ],
  chips: [
    { id: "chip-4821-mica", status: "ok", text: "MICA 4/4 Complete" },
    { id: "chip-4821-coc", status: "ok", text: "COC Missing", okText: "COC Signed" },
  ],
  actionOptions: ["View Claim", "✓ Mark Resolved"],
  resolveChipId: "chip-4821-coc",
};

function renderModal(props: Partial<React.ComponentProps<typeof ClaimDetailModal>> = {}) {
  return render(
    <ToastProvider>
      <ClaimDetailModal open data={caseData} onClose={() => {}} {...props} />
    </ToastProvider>
  );
}

describe("ClaimDetailModal", () => {
  it("renders nothing when closed", () => {
    renderModal({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when there is no case data, even if open", () => {
    renderModal({ data: null });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the case id, claim reference, and overdue flag", () => {
    renderModal();
    const dialog = screen.getByRole("dialog", { name: /DASH-4821/ });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(caseData.claimRef)).toBeInTheDocument();
    expect(screen.getByText("9d overdue")).toBeInTheDocument();
  });

  it("omits the flag badge when the case has none", () => {
    renderModal({ data: { ...caseData, flag: undefined } });
    expect(screen.queryByText("9d overdue")).not.toBeInTheDocument();
  });

  it("lists every field", () => {
    renderModal();
    expect(screen.getByText("Invoice amount")).toBeInTheDocument();
    expect(screen.getByText("$8,450.00")).toBeInTheDocument();
    expect(screen.getByText("#1 · $2,800 · pending review")).toBeInTheDocument();
  });

  it("shows each chip's resolved display text, not its raw stored text", () => {
    renderModal();
    expect(screen.getByText("MICA 4/4 Complete")).toBeInTheDocument();
    expect(screen.getByText("COC Signed")).toBeInTheDocument();
    expect(screen.queryByText("COC Missing")).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderModal({ onClose });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
