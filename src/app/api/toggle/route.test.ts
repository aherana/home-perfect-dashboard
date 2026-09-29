/**
 * @jest-environment node
 */
import { GET, POST } from "./route";
import { setApiEnabled } from "@/lib/api-toggle";

describe("/api/toggle", () => {
  afterEach(() => {
    setApiEnabled(true);
  });

  describe("GET", () => {
    it("reports enabled: true by default", async () => {
      const res = await GET();
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ enabled: true });
    });

    it("reflects a disabled state", async () => {
      setApiEnabled(false);
      const res = await GET();
      await expect(res.json()).resolves.toEqual({ enabled: false });
    });
  });

  describe("POST", () => {
    it("flips enabled to false and returns the new state", async () => {
      const res = await POST();
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ enabled: false });
    });

    it("flips back to true on a second call", async () => {
      await POST();
      const res = await POST();
      await expect(res.json()).resolves.toEqual({ enabled: true });
    });
  });
});
