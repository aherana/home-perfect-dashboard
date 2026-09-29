import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast, ToastProvider, useToast } from "./Toast";

function Notifier({ message }: { message: string }) {
  const { notify } = useToast();
  return (
    <button type="button" onClick={() => notify(message)}>
      Trigger
    </button>
  );
}

describe("Toast", () => {
  it("renders with no visible message initially", () => {
    render(
      <ToastProvider>
        <Toast />
      </ToastProvider>
    );
    expect(screen.getByRole("status")).toHaveAttribute("data-visible", "false");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("shows the notified message", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Notifier message="→ Would open: State Farm claims" />
        <Toast />
      </ToastProvider>
    );
    await user.click(screen.getByRole("button", { name: "Trigger" }));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("→ Would open: State Farm claims");
    expect(status).toHaveAttribute("data-visible", "true");
  });

  it("auto-dismisses after a few seconds", async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(
      <ToastProvider>
        <Notifier message="→ Would open: State Farm claims" />
        <Toast />
      </ToastProvider>
    );
    await user.click(screen.getByRole("button", { name: "Trigger" }));
    expect(screen.getByRole("status")).toHaveAttribute("data-visible", "true");

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("status")).toHaveAttribute("data-visible", "false");
    jest.useRealTimers();
  });
});
