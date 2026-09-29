import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldRow } from "./FieldRow";
import { Toast, ToastProvider } from "./Toast";

describe("FieldRow", () => {
  it("renders the label and value", () => {
    render(<FieldRow label="Carrier" value="State Farm" />);
    expect(screen.getByText("Carrier")).toBeInTheDocument();
    expect(screen.getByText("State Farm")).toBeInTheDocument();
  });

  it("flags the value as overdue when overdue is true", () => {
    render(<FieldRow label="Supplement" value="#1 · $2,800 · pending review" overdue />);
    expect(screen.getByText("#1 · $2,800 · pending review")).toHaveAttribute("data-overdue", "true");
  });

  it("does not flag the value as overdue by default", () => {
    render(<FieldRow label="Mortgage hold" value="—" />);
    expect(screen.getByText("—")).toHaveAttribute("data-overdue", "false");
  });

  it("renders the value as a dead link that shows a toast when linkLabel is given", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <FieldRow label="Carrier" value="State Farm" linkLabel="State Farm claims" />
        <Toast />
      </ToastProvider>
    );
    await user.click(screen.getByText("State Farm"));
    expect(screen.getByRole("status")).toHaveTextContent("→ Would open: State Farm claims");
  });
});
