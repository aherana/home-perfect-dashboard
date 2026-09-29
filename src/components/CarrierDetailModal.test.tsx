import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CarrierDetailModal } from "./CarrierDetailModal";
import type { CarrierAging } from "@/lib/types";

const carrier: CarrierAging = {
  name: "State Farm",
  amount: "$112k",
  segments: [
    { percent: 17.9, color: "#2F9E6E" },
    { percent: 22.3, color: "#4C8DBF" },
    { percent: 17.8, color: "#C9622A" },
    { percent: 42.0, color: "#A23E2E" },
  ],
};

function renderModal(props: Partial<React.ComponentProps<typeof CarrierDetailModal>> = {}) {
  return render(<CarrierDetailModal open data={carrier} onClose={() => {}} {...props} />);
}

describe("CarrierDetailModal", () => {
  it("renders nothing when closed", () => {
    renderModal({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when there is no carrier data, even if open", () => {
    renderModal({ data: null });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the carrier name and total amount", () => {
    renderModal();
    const dialog = screen.getByRole("dialog", { name: /State Farm/ });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("$112k")).toBeInTheDocument();
  });

  it("labels each aging bucket and shows its share of the balance", () => {
    renderModal();
    expect(screen.getByText("0–30 days")).toBeInTheDocument();
    expect(screen.getByText("17.9%")).toBeInTheDocument();
    expect(screen.getByText("31–60 days")).toBeInTheDocument();
    expect(screen.getByText("22.3%")).toBeInTheDocument();
    expect(screen.getByText("61–90 days")).toBeInTheDocument();
    expect(screen.getByText("90+ days")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderModal({ onClose });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
