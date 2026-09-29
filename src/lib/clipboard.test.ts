import { copyToClipboard } from "./clipboard";

describe("copyToClipboard", () => {
  afterEach(() => {
    jest.mocked(navigator.clipboard.writeText).mockClear();
  });

  it("writes the given text to the clipboard", async () => {
    await copyToClipboard("Extended dry time required.");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Extended dry time required.");
  });

  it("propagates a rejection if the clipboard write fails", async () => {
    jest.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error("permission denied"));
    await expect(copyToClipboard("x")).rejects.toThrow("permission denied");
  });
});
