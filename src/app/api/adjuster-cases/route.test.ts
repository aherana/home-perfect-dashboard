/**
 * @jest-environment node
 */
import { GET } from "./route";
import { adjusterCasesData } from "@/lib/mock-data";
import { setApiEnabled } from "@/lib/api-toggle";

describe("GET /api/adjuster-cases", () => {
  afterEach(() => {
    setApiEnabled(true);
  });

  it("responds 200 with the adjuster cases as JSON", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(adjusterCasesData);
  });

  it("responds 503 when the API is toggled off", async () => {
    setApiEnabled(false);
    const res = await GET();
    expect(res.status).toBe(503);
  });
});
