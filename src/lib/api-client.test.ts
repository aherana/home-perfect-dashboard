import { fetchAdjusterCases, fetchApiToggleState, fetchExecutiveData, fetchProfile, fetchReferralData, toggleApi } from "./api-client";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  }) as unknown as typeof fetch;
}

describe("api-client", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("fetchProfile calls GET /api/profile and returns the parsed body", async () => {
    mockFetchOnce({ brandName: "Home Perfect" });
    const result = await fetchProfile();
    expect(fetch).toHaveBeenCalledWith("/api/profile");
    expect(result).toEqual({ brandName: "Home Perfect" });
  });

  it("fetchExecutiveData calls GET /api/executive", async () => {
    mockFetchOnce({ totalAr: { value: "$1" } });
    await fetchExecutiveData();
    expect(fetch).toHaveBeenCalledWith("/api/executive");
  });

  it("fetchAdjusterCases calls GET /api/adjuster-cases", async () => {
    mockFetchOnce([{ id: "DASH-1" }]);
    const result = await fetchAdjusterCases();
    expect(fetch).toHaveBeenCalledWith("/api/adjuster-cases");
    expect(result).toEqual([{ id: "DASH-1" }]);
  });

  it("fetchReferralData calls GET /api/referral-partners", async () => {
    mockFetchOnce({ partners: [] });
    await fetchReferralData();
    expect(fetch).toHaveBeenCalledWith("/api/referral-partners");
  });

  it("fetchApiToggleState calls GET /api/toggle and returns the parsed state", async () => {
    mockFetchOnce({ enabled: true });
    const result = await fetchApiToggleState();
    expect(fetch).toHaveBeenCalledWith("/api/toggle");
    expect(result).toEqual({ enabled: true });
  });

  it("toggleApi calls POST /api/toggle and returns the new state", async () => {
    mockFetchOnce({ enabled: false });
    const result = await toggleApi();
    expect(fetch).toHaveBeenCalledWith("/api/toggle", { method: "POST" });
    expect(result).toEqual({ enabled: false });
  });

  it("toggleApi throws when the response is not ok", async () => {
    mockFetchOnce({}, false, 500);
    await expect(toggleApi()).rejects.toThrow("/api/toggle");
  });

  it("throws when the response is not ok", async () => {
    mockFetchOnce({}, false, 500);
    await expect(fetchProfile()).rejects.toThrow("/api/profile");
  });
});
