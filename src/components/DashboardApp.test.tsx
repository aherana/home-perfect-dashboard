import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardApp } from "./DashboardApp";
import * as apiClient from "@/lib/api-client";
import type { AdjusterCasesData, ExecutiveData, ProfileData, ReferralData } from "@/lib/types";

jest.mock("@/lib/api-client");

const profile: ProfileData = {
  brandName: "Home Perfect — Ops Command Center",
  location: "Temecula & Murrieta Ops",
  notificationCount: 3,
  avatarInitial: "A",
};

const executive: ExecutiveData = {
  totalAr: { value: "$348,250", sub: "34 active claims", dso: { value: "DSO: 58 days", target: "industry target 42" } },
  criticalAr: { value: "$84,100", sub: "stuck with adjusters" },
  periodStats: {
    day: { value: "67%", sub: "today" },
    week: { value: "75%", sub: "this week" },
    month: { value: "78.2%", sub: "this month" },
    year: { value: "76.8%", sub: "this year" },
  },
  agingSegments: [],
  agingNote: "note",
  carriers: [],
};

const cases: AdjusterCasesData = [];
const referral: ReferralData = { partners: [] };

function mockAllResolved() {
  jest.mocked(apiClient.fetchProfile).mockResolvedValue(profile);
  jest.mocked(apiClient.fetchExecutiveData).mockResolvedValue(executive);
  jest.mocked(apiClient.fetchAdjusterCases).mockResolvedValue(cases);
  jest.mocked(apiClient.fetchReferralData).mockResolvedValue(referral);
}

describe("DashboardApp", () => {
  beforeEach(() => {
    // Never resolves by default, so unrelated tests don't get an act() warning
    // when ApiToggle's initial fetch settles after the test body has finished.
    jest.mocked(apiClient.fetchApiToggleState).mockReturnValue(new Promise(() => {}));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("shows a loading state before the API responses resolve", () => {
    jest.mocked(apiClient.fetchProfile).mockReturnValue(new Promise(() => {}));
    jest.mocked(apiClient.fetchExecutiveData).mockReturnValue(new Promise(() => {}));
    jest.mocked(apiClient.fetchAdjusterCases).mockReturnValue(new Promise(() => {}));
    jest.mocked(apiClient.fetchReferralData).mockReturnValue(new Promise(() => {}));

    render(<DashboardApp />);
    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
  });

  it("calls all four endpoints and renders the assembled dashboard once they resolve", async () => {
    mockAllResolved();
    render(<DashboardApp />);

    await waitFor(() => expect(screen.getByText("Home Perfect — Ops Command Center")).toBeInTheDocument());
    expect(apiClient.fetchProfile).toHaveBeenCalledTimes(1);
    expect(apiClient.fetchExecutiveData).toHaveBeenCalledTimes(1);
    expect(apiClient.fetchAdjusterCases).toHaveBeenCalledTimes(1);
    expect(apiClient.fetchReferralData).toHaveBeenCalledTimes(1);
    expect(screen.getByText("$348,250")).toBeInTheDocument();
  });

  it("shows an error state if any request fails, instead of a partial dashboard", async () => {
    jest.mocked(apiClient.fetchProfile).mockResolvedValue(profile);
    jest.mocked(apiClient.fetchExecutiveData).mockRejectedValue(new Error("network down"));
    jest.mocked(apiClient.fetchAdjusterCases).mockResolvedValue(cases);
    jest.mocked(apiClient.fetchReferralData).mockResolvedValue(referral);

    render(<DashboardApp />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.queryByText("Home Perfect — Ops Command Center")).not.toBeInTheDocument();
  });

  it("offers the API toggle and a retry button in the error state, so a disabled API is recoverable without leaving the page", async () => {
    jest.mocked(apiClient.fetchProfile).mockRejectedValue(new Error("API is currently disabled"));
    jest.mocked(apiClient.fetchExecutiveData).mockRejectedValue(new Error("API is currently disabled"));
    jest.mocked(apiClient.fetchAdjusterCases).mockRejectedValue(new Error("API is currently disabled"));
    jest.mocked(apiClient.fetchReferralData).mockRejectedValue(new Error("API is currently disabled"));
    jest.mocked(apiClient.fetchApiToggleState).mockResolvedValue({ enabled: true });

    render(<DashboardApp />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    expect(await screen.findByRole("button", { name: /api: on/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("retries loading when Try again is clicked", async () => {
    const user = userEvent.setup();
    jest.mocked(apiClient.fetchProfile).mockRejectedValueOnce(new Error("down"));
    jest.mocked(apiClient.fetchExecutiveData).mockRejectedValueOnce(new Error("down"));
    jest.mocked(apiClient.fetchAdjusterCases).mockRejectedValueOnce(new Error("down"));
    jest.mocked(apiClient.fetchReferralData).mockRejectedValueOnce(new Error("down"));

    render(<DashboardApp />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());

    mockAllResolved();
    await user.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => expect(screen.getByText("Home Perfect — Ops Command Center")).toBeInTheDocument());
    expect(apiClient.fetchProfile).toHaveBeenCalledTimes(2);
  });
});
