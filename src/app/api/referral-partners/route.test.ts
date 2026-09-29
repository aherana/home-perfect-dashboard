/**
 * @jest-environment node
 */
import { GET } from "./route";
import { referralData } from "@/lib/mock-data";
import { setApiEnabled } from "@/lib/api-toggle";

describe("GET /api/referral-partners", () => {
  afterEach(() => {
    setApiEnabled(true);
  });

  it("responds 200 with the referral partners data as JSON", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(referralData);
  });

  it("responds 503 when the API is toggled off", async () => {
    setApiEnabled(false);
    const res = await GET();
    expect(res.status).toBe(503);
  });
});
