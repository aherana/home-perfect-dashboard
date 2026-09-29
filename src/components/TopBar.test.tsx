import { render, screen } from "@testing-library/react";
import { TopBar } from "./TopBar";
import * as apiClient from "@/lib/api-client";

jest.mock("@/lib/api-client");

beforeEach(() => {
  // Never resolves by default, so unrelated tests don't get an act() warning
  // when ApiToggle's initial fetch settles after the test body has finished.
  jest.mocked(apiClient.fetchApiToggleState).mockReturnValue(new Promise(() => {}));
});

describe("TopBar", () => {
  it("renders the brand name and location", () => {
    render(<TopBar brandName="Home Perfect — Ops Command Center" location="Temecula & Murrieta Ops" notificationCount={3} avatarInitial="A" />);
    expect(screen.getByText("Home Perfect — Ops Command Center")).toBeInTheDocument();
    expect(screen.getByText("Temecula & Murrieta Ops")).toBeInTheDocument();
  });

  it("renders the notification count", () => {
    render(<TopBar brandName="Home Perfect" location="Temecula" notificationCount={3} avatarInitial="A" />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders the avatar initial", () => {
    render(<TopBar brandName="Home Perfect" location="Temecula" notificationCount={3} avatarInitial="A" />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("links to the API health endpoint in a new tab", () => {
    render(<TopBar brandName="Home Perfect" location="Temecula" notificationCount={3} avatarInitial="A" />);
    const link = screen.getByRole("link", { name: "API Health" });
    expect(link).toHaveAttribute("href", "/api/health");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the API on/off toggle, reflecting the real state once fetched", async () => {
    jest.mocked(apiClient.fetchApiToggleState).mockResolvedValue({ enabled: true });
    render(<TopBar brandName="Home Perfect" location="Temecula" notificationCount={3} avatarInitial="A" />);
    expect(await screen.findByRole("button", { name: /api: on/i })).toBeInTheDocument();
  });
});
