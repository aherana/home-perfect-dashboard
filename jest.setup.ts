import "@testing-library/jest-dom";

// jsdom doesn't implement the Clipboard API — stub it so components that call
// navigator.clipboard.writeText() don't throw in every test that renders them.
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: jest.fn().mockResolvedValue(undefined) },
  writable: true,
  configurable: true,
});
