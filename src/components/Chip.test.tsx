import { render, screen } from "@testing-library/react";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders its text content", () => {
    render(<Chip status="ok">MICA 4/4 Complete</Chip>);
    expect(screen.getByText("MICA 4/4 Complete")).toBeInTheDocument();
  });

  it.each([
    ["ok" as const],
    ["warn" as const],
    ["neutral" as const],
    ["info" as const],
  ])("exposes its status (%s) as a data attribute for styling", (status) => {
    render(<Chip status={status}>Label</Chip>);
    expect(screen.getByText("Label")).toHaveAttribute("data-status", status);
  });
});
