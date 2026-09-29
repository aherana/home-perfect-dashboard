import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResolvableSelect } from "./ResolvableSelect";

const options = ["Draft Follow-up", "Generate Packet", "Request COC Signature", "View Claim", "✓ Mark Resolved"];

describe("ResolvableSelect", () => {
  it("renders every option", () => {
    render(<ResolvableSelect options={options} onResolve={() => {}} />);
    for (const opt of options) {
      expect(screen.getByRole("option", { name: opt })).toBeInTheDocument();
    }
  });

  it("calls onResolve when the resolve option is chosen", async () => {
    const user = userEvent.setup();
    const onResolve = jest.fn();
    render(<ResolvableSelect options={options} onResolve={onResolve} />);
    await user.selectOptions(screen.getByRole("combobox"), "✓ Mark Resolved");
    expect(onResolve).toHaveBeenCalledTimes(1);
  });

  it("does not call onResolve for a non-resolve option", async () => {
    const user = userEvent.setup();
    const onResolve = jest.fn();
    render(<ResolvableSelect options={options} onResolve={onResolve} />);
    await user.selectOptions(screen.getByRole("combobox"), "View Claim");
    expect(onResolve).not.toHaveBeenCalled();
  });

  it("exposes its visual variant as a data attribute", () => {
    render(<ResolvableSelect options={options} onResolve={() => {}} variant="urgent" />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-variant", "urgent");
  });
});
