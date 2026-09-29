/**
 * @jest-environment node
 */
import { GET } from "./route";
import { setApiEnabled } from "@/lib/api-toggle";

describe("GET /api/health", () => {
  afterEach(() => {
    setApiEnabled(true);
  });

  it("responds 503 with a down status when the API is toggled off", async () => {
    setApiEnabled(false);
    const res = await GET();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.status).toBe("down");
  });

  it("responds 200 with an ok status", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
  });

  it("includes a valid ISO timestamp", async () => {
    const res = await GET();
    const body = await res.json();
    expect(typeof body.timestamp).toBe("string");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
  });

  it("includes a non-negative process uptime in seconds", async () => {
    const res = await GET();
    const body = await res.json();
    expect(typeof body.uptimeSeconds).toBe("number");
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it("is not cached — a request issued later reports a later or equal timestamp", async () => {
    const first = await (await GET()).json();
    await new Promise((r) => setTimeout(r, 5));
    const second = await (await GET()).json();
    expect(Date.parse(second.timestamp)).toBeGreaterThanOrEqual(Date.parse(first.timestamp));
  });
});
