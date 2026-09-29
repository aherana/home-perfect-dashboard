import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReferralPartnerCard } from "./ReferralPartnerCard";
import { Toast, ToastProvider } from "./Toast";
import type { ReferralPartner } from "@/lib/types";

const pendingPartner: ReferralPartner = {
  id: "tvp",
  name: "Temecula Valley Plumbing",
  rank: 1,
  fields: [
    { label: "Leads sent", value: "6", linkLabel: "Leads from Temecula Valley Plumbing" },
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

function renderCard(props: Partial<React.ComponentProps<typeof ReferralPartnerCard>> = {}) {
  return render(
    <ToastProvider>
      <ReferralPartnerCard
        data={pendingPartner}
        onSettleFee={() => {}}
        onUndoFee={() => {}}
        settledInSession={false}
        onOpenDetails={() => {}}
        {...props}
      />
      <Toast />
    </ToastProvider>
  );
}

describe("ReferralPartnerCard", () => {
  it("renders the partner name, the rank, and fields", () => {
    renderCard();
    expect(screen.getByText("Temecula Valley Plumbing")).toBeInTheDocument();
    expect(screen.getByText("Rank #1")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("$42,300")).toBeInTheDocument();
  });

  it("calls onOpenDetails when the partner name is clicked", async () => {
    const user = userEvent.setup();
    const onOpenDetails = jest.fn();
    renderCard({ onOpenDetails });
    await user.click(screen.getByText("Temecula Valley Plumbing"));
    expect(onOpenDetails).toHaveBeenCalledTimes(1);
  });

  it("shows the pending fee amount for a pending partner", () => {
    renderCard();
    expect(screen.getByRole("option", { name: "$750 Pending" })).toBeInTheDocument();
  });

  it("shows the check reference for a paid partner", () => {
    renderCard({ data: paidPartner });
    expect(screen.getByRole("option", { name: "View Check #1042" })).toBeInTheDocument();
  });

  it("calls onSettleFee with the partner id and amount when the fee is approved", async () => {
    const user = userEvent.setup();
    const onSettleFee = jest.fn();
    renderCard({ onSettleFee });
    await user.selectOptions(screen.getByRole("combobox"), "Approve Fee");
    expect(onSettleFee).toHaveBeenCalledWith("tvp", 750);
  });

  it("shows an Undo link only when the fee was settled this session, and calls onUndoFee", async () => {
    const user = userEvent.setup();
    const onUndoFee = jest.fn();
    renderCard({ data: { ...pendingPartner, feeStatus: "paid" }, settledInSession: true, onUndoFee });
    await user.click(screen.getByText("↺ Undo"));
    expect(onUndoFee).toHaveBeenCalledWith("tvp");
  });

  it("does not show an Undo link for a partner that started out already paid", () => {
    renderCard({ data: paidPartner, settledInSession: false });
    expect(screen.queryByText("↺ Undo")).not.toBeInTheDocument();
  });
});
