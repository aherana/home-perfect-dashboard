import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CarrierItem } from "./CarrierItem";
import type { CarrierAging } from "@/lib/types";

const carrier: CarrierAging = {
  name: "State Farm",
  amount: "$112k",
  segments: [
    { percent: 17.9, color: "#2F9E6E" },
    { percent: 22.3, color: "#4C8DBF" },
    { percent: 17.9, color: "#C9622A" },
    { percent: 42.0, color: "#A23E2E" },
  ],
};

function renderItem(onOpenDetails: () => void = () => {}) {
  return render(<CarrierItem carrier={carrier} onOpenDetails={onOpenDetails} />);
}

describe("CarrierItem", () => {
  it("renders the carrier name and total amount", () => {
    renderItem();
    expect(screen.getByText("State Farm")).toBeInTheDocument();
    expect(screen.getByText("$112k")).toBeInTheDocument();
  });

  it("renders one stack segment per aging bucket, sized by percent", () => {
    renderItem();
    const stack = screen.getByTestId("carrier-stack");
    expect(stack.children).toHaveLength(4);
    expect(stack.children[3]).toHaveStyle({ width: "42%" });
  });

  it("calls onOpenDetails when the carrier name is clicked", async () => {
    const user = userEvent.setup();
    const onOpenDetails = jest.fn();
    renderItem(onOpenDetails);
    await user.click(screen.getByText("State Farm"));
    expect(onOpenDetails).toHaveBeenCalledTimes(1);
  });
});
