import { render, screen } from "@testing-library/react";
import { AgingBar } from "./AgingBar";
import type { AgingSegment } from "@/lib/types";

const segments: AgingSegment[] = [
  { label: "Unbilled WIP", amount: "$48k", percent: 12.1, color: "#5C6A93" },
  { label: "0–30 days", amount: "$162k", percent: 40.9, color: "#2F9E6E" },
];

describe("AgingBar", () => {
  it("renders each segment's amount inside the bar", () => {
    render(<AgingBar segments={segments} />);
    expect(screen.getByText("$48k")).toBeInTheDocument();
    expect(screen.getByText("$162k")).toBeInTheDocument();
  });

  it("renders a legend entry with each segment's label", () => {
    render(<AgingBar segments={segments} />);
    expect(screen.getByText("Unbilled WIP")).toBeInTheDocument();
    expect(screen.getByText("0–30 days")).toBeInTheDocument();
  });

  it("sizes each segment by its percent", () => {
    render(<AgingBar segments={segments} />);
    expect(screen.getByTestId("aging-segment-0")).toHaveStyle({ width: "12.1%" });
    expect(screen.getByTestId("aging-segment-1")).toHaveStyle({ width: "40.9%" });
  });

  it("renders an explanatory note when provided", () => {
    render(<AgingBar segments={segments} note="Unbilled WIP is not counted in AR." />);
    expect(screen.getByText("Unbilled WIP is not counted in AR.")).toBeInTheDocument();
  });
});
