import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PeriodToggle } from "./PeriodToggle";
import type { Period } from "@/lib/types";

const periods: { id: Period; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

describe("PeriodToggle", () => {
  it("renders a button for every period", () => {
    render(<PeriodToggle periods={periods} active="month" onChange={() => {}} />);
    for (const p of periods) {
      expect(screen.getByRole("button", { name: p.label })).toBeInTheDocument();
    }
  });

  it("marks the active period as pressed", () => {
    render(<PeriodToggle periods={periods} active="month" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Month" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the clicked period's id", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<PeriodToggle periods={periods} active="month" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Year" }));
    expect(onChange).toHaveBeenCalledWith("year");
  });
});
