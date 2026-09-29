import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeadLink } from "./DeadLink";
import { Toast, ToastProvider } from "./Toast";

describe("DeadLink", () => {
  it("renders its children as the visible text", () => {
    render(
      <ToastProvider>
        <DeadLink label="State Farm claims">State Farm</DeadLink>
        <Toast />
      </ToastProvider>
    );
    expect(screen.getByText("State Farm")).toBeInTheDocument();
  });

  it("shows a toast naming what it would open when clicked", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <DeadLink label="State Farm claims">State Farm</DeadLink>
        <Toast />
      </ToastProvider>
    );
    await user.click(screen.getByText("State Farm"));
    expect(screen.getByRole("status")).toHaveTextContent("→ Would open: State Farm claims");
  });
});
