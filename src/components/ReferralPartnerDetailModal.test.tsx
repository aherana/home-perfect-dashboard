import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReferralPartnerDetailModal } from "./ReferralPartnerDetailModal";
import type { ReferralPartner } from "@/lib/types";

const pendingPartner: ReferralPartner = {
  id: "tvp",
  name: "Temecula Valley Plumbing",
  rank: 1,
  fields: [
    { label: "Leads sent", value: "6" },
    { label: "Revenue collected", value: "$42,300" },
  ],
  feeStatus: "pending",
  pendingAmount: 750,
};

const paidPartner: ReferralPartner = {
  id: "mpp",
  name: "Murrieta Pro Plumbing",
  rank: 2,
  fields: [{ label: "Leads sent", value: "5" }],
  feeStatus: "paid",
  checkRef: "1042",
};

function renderModal(props: Partial<React.ComponentProps<typeof ReferralPartnerDetailModal>> = {}) {
  return render(<ReferralPartnerDetailModal open data={pendingPartner} onClose={() => {}} {...props} />);
}

describe("ReferralPartnerDetailModal", () => {
  it("renders nothing when closed", () => {
    renderModal({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when there is no partner data, even if open", () => {
    renderModal({ data: null });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the partner name and rank", () => {
    renderModal();
    const dialog = screen.getByRole("dialog", { name: /Temecula Valley Plumbing/ });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Rank #1")).toBeInTheDocument();
  });

  it("lists every field", () => {
    renderModal();
    expect(screen.getByText("Leads sent")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Revenue collected")).toBeInTheDocument();
    expect(screen.getByText("$42,300")).toBeInTheDocument();
  });

  it("shows the pending fee amount for a pending partner", () => {
    renderModal();
    expect(screen.getByText("Fee status")).toBeInTheDocument();
    expect(screen.getByText("$750 Pending")).toBeInTheDocument();
  });

  it("shows the check reference for a paid partner", () => {
    renderModal({ data: paidPartner });
    expect(screen.getByText("Paid — Check #1042")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderModal({ onClose });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
