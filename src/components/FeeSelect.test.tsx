import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeeSelect } from "./FeeSelect";

describe("FeeSelect", () => {
  it("renders every option", () => {
    const options = ["$750 Pending", "Approve Fee", "Mark Paid – Check #"];
    render(<FeeSelect options={options} status="pending" pendingAmount={750} />);
    for (const opt of options) {
      expect(screen.getByRole("option", { name: opt })).toBeInTheDocument();
    }
  });

  it("exposes pending vs paid status as a data attribute", () => {
    const { rerender } = render(
      <FeeSelect options={["$750 Pending", "Approve Fee"]} status="pending" pendingAmount={750} />
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-status", "pending");

    rerender(<FeeSelect options={["Paid", "Mark Unpaid"]} status="paid" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-status", "paid");
  });

  it("calls onSettle with the pending amount when a pending fee is settled", async () => {
    const user = userEvent.setup();
    const onSettle = jest.fn();
    render(
      <FeeSelect
        options={["$750 Pending", "Approve Fee", "Mark Paid – Check #"]}
        status="pending"
        pendingAmount={750}
        onSettle={onSettle}
      />
    );
    await user.selectOptions(screen.getByRole("combobox"), "Approve Fee");
    expect(onSettle).toHaveBeenCalledTimes(1);
    expect(onSettle).toHaveBeenCalledWith(750);
  });

  it("does not call onSettle again once the parent reflects the paid status", async () => {
    const user = userEvent.setup();
    const onSettle = jest.fn();
    const { rerender } = render(
      <FeeSelect
        options={["$750 Pending", "Approve Fee", "Mark Paid – Check #"]}
        status="pending"
        pendingAmount={750}
        onSettle={onSettle}
      />
    );
    await user.selectOptions(screen.getByRole("combobox"), "Approve Fee");
    rerender(
      <FeeSelect options={["Paid", "View Check #1042", "Mark Unpaid"]} status="paid" onSettle={onSettle} />
    );
    await user.selectOptions(screen.getByRole("combobox"), "View Check #1042");
    expect(onSettle).toHaveBeenCalledTimes(1);
  });

  it("can settle again after the parent reverts status back to pending (undo)", async () => {
    const user = userEvent.setup();
    const onSettle = jest.fn();
    const pendingProps = {
      options: ["$750 Pending", "Approve Fee", "Mark Paid – Check #"],
      status: "pending" as const,
      pendingAmount: 750,
      onSettle,
    };
    const { rerender } = render(<FeeSelect {...pendingProps} />);
    await user.selectOptions(screen.getByRole("combobox"), "Approve Fee");
    rerender(<FeeSelect options={["Paid", "Mark Unpaid"]} status="paid" onSettle={onSettle} />);
    // undo: parent reverts back to pending
    rerender(<FeeSelect {...pendingProps} />);
    await user.selectOptions(screen.getByRole("combobox"), "Approve Fee");
    expect(onSettle).toHaveBeenCalledTimes(2);
  });

  it("never calls onSettle when it starts out already paid", async () => {
    const user = userEvent.setup();
    const onSettle = jest.fn();
    render(<FeeSelect options={["Paid", "View Check #1042", "Mark Unpaid"]} status="paid" onSettle={onSettle} />);
    await user.selectOptions(screen.getByRole("combobox"), "View Check #1042");
    expect(onSettle).not.toHaveBeenCalled();
  });
});
