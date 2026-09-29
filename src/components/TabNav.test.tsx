import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TabNav } from "./TabNav";

const tabs = [
  { id: "t1", label: "Executive AR & Cash" },
  { id: "t2", label: "Adjuster Defense", badge: 4 },
  { id: "t3", label: "Referral Leaderboard", badge: 0 },
];

describe("TabNav", () => {
  it("renders every tab label", () => {
    render(<TabNav tabs={tabs} active="t1" onChange={() => {}} />);
    for (const t of tabs) {
      expect(screen.getByText(t.label)).toBeInTheDocument();
    }
  });

  it("shows a badge only when count is greater than zero", () => {
    render(<TabNav tabs={tabs} active="t1" onChange={() => {}} />);
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("marks the active tab as selected", () => {
    render(<TabNav tabs={tabs} active="t2" onChange={() => {}} />);
    expect(screen.getByRole("tab", { name: /Adjuster Defense/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Executive AR/ })).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange with the clicked tab's id", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TabNav tabs={tabs} active="t1" onChange={onChange} />);
    await user.click(screen.getByRole("tab", { name: /Referral Leaderboard/ }));
    expect(onChange).toHaveBeenCalledWith("t3");
  });
});
