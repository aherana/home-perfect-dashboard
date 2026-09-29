import { isApiEnabled, setApiEnabled } from "./api-toggle";

describe("api-toggle", () => {
  afterEach(() => {
    setApiEnabled(true);
  });

  it("defaults to enabled", () => {
    expect(isApiEnabled()).toBe(true);
  });

  it("can be disabled", () => {
    setApiEnabled(false);
    expect(isApiEnabled()).toBe(false);
  });

  it("can be re-enabled", () => {
    setApiEnabled(false);
    setApiEnabled(true);
    expect(isApiEnabled()).toBe(true);
  });
});
