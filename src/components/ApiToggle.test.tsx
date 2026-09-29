import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiToggle } from "./ApiToggle";
import * as apiClient from "@/lib/api-client";

jest.mock("@/lib/api-client");

describe("ApiToggle", () => {
  beforeEach(() => {
    jest.mocked(apiClient.fetchApiToggleState).mockResolvedValue({ enabled: true });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("shows a neutral checking state before the initial fetch resolves", () => {
    jest.mocked(apiClient.fetchApiToggleState).mockReturnValue(new Promise(() => {}));
    render(<ApiToggle />);
    expect(screen.getByRole("button", { name: /api: .../i })).toBeInTheDocument();
  });

  it("fetches the real state on mount and shows API: On when enabled", async () => {
    render(<ApiToggle />);
    expect(await screen.findByRole("button", { name: /api: on/i })).toBeInTheDocument();
  });

  it("fetches the real state on mount and shows API: Off when disabled", async () => {
    jest.mocked(apiClient.fetchApiToggleState).mockResolvedValue({ enabled: false });
    render(<ApiToggle />);
    expect(await screen.findByRole("button", { name: /api: off/i })).toBeInTheDocument();
  });

  it("if the initial fetch fails, falls back to showing API: Off rather than a false On", async () => {
    jest.mocked(apiClient.fetchApiToggleState).mockRejectedValue(new Error("network error"));
    render(<ApiToggle />);
    expect(await screen.findByRole("button", { name: /api: off/i })).toBeInTheDocument();
  });

  it("calls toggleApi and reflects the resolved state when clicked", async () => {
    const user = userEvent.setup();
    jest.mocked(apiClient.toggleApi).mockResolvedValue({ enabled: false });
    render(<ApiToggle />);

    await user.click(await screen.findByRole("button", { name: /api: on/i }));
    expect(apiClient.toggleApi).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("button", { name: /api: off/i })).toBeInTheDocument();
  });

  it("toggling again flips back to on", async () => {
    const user = userEvent.setup();
    jest.mocked(apiClient.toggleApi).mockResolvedValueOnce({ enabled: false }).mockResolvedValueOnce({ enabled: true });
    render(<ApiToggle />);

    await user.click(await screen.findByRole("button", { name: /api: on/i }));
    await screen.findByRole("button", { name: /api: off/i });

    await user.click(screen.getByRole("button", { name: /api: off/i }));
    expect(await screen.findByRole("button", { name: /api: on/i })).toBeInTheDocument();
  });

  it("reverts to the pre-click state if the toggle request fails", async () => {
    const user = userEvent.setup();
    jest.mocked(apiClient.toggleApi).mockRejectedValue(new Error("network error"));
    render(<ApiToggle />);

    await user.click(await screen.findByRole("button", { name: /api: on/i }));
    expect(await screen.findByRole("button", { name: /api: on/i })).toBeInTheDocument();
  });

  it("disables the button while a toggle request is in flight", async () => {
    const user = userEvent.setup();
    jest.mocked(apiClient.toggleApi).mockReturnValue(new Promise(() => {}));
    render(<ApiToggle />);

    await user.click(await screen.findByRole("button", { name: /api: on/i }));
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
