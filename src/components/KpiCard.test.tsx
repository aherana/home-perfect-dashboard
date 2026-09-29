import { render, screen } from "@testing-library/react";
import { KpiCard } from "./KpiCard";

describe("KpiCard", () => {
  it("renders label, value, and sub text", () => {
    render(<KpiCard label="Total Outstanding AR" value="$348,250" sub="34 active claims" />);
    expect(screen.getByText("Total Outstanding AR")).toBeInTheDocument();
    expect(screen.getByText("$348,250")).toBeInTheDocument();
    expect(screen.getByText("34 active claims")).toBeInTheDocument();
  });

  it("marks itself as the hero card when hero is true", () => {
    render(<KpiCard label="Total Outstanding AR" value="$348,250" sub="34 active claims" hero />);
    expect(screen.getByTestId("kpi-card")).toHaveAttribute("data-variant", "hero");
  });

  it("does not render a dso line when dso is omitted", () => {
    render(<KpiCard label="Closing Rate" value="78.2%" sub="this month" />);
    expect(screen.queryByTestId("kpi-dso")).not.toBeInTheDocument();
  });

  it("renders an optional freshness tag next to the label", () => {
    render(<KpiCard label="Total Outstanding AR" value="$348,250" sub="34 active claims" tag="as of today" />);
    expect(screen.getByText("as of today")).toBeInTheDocument();
  });

  it("omits the tag when none is given", () => {
    render(<KpiCard label="Total Outstanding AR" value="$348,250" sub="34 active claims" />);
    expect(screen.queryByTestId("kpi-tag")).not.toBeInTheDocument();
  });

  it("renders the dso value and target when provided", () => {
    render(
      <KpiCard
        label="Total Outstanding AR"
        value="$348,250"
        sub="34 active claims"
        dso={{ value: "DSO: 58 days", target: "industry target 42" }}
      />
    );
    expect(screen.getByText("DSO: 58 days")).toBeInTheDocument();
    expect(screen.getByText(/industry target 42/)).toBeInTheDocument();
  });
});
