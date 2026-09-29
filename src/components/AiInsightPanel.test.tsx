import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiInsightPanel } from "./AiInsightPanel";

const insight = {
  patternLabel: "State Farm pattern",
  pattern: "commonly reduces equipment run-time line items on drying jobs over 72 hrs.",
  suggestedNoteLabel: "Suggested F9 note",
  suggestedNote: "Extended dry time required — elevated moisture readings in slab per IICRC S500 Ch.14.",
  copyLabel: "Copy to F9 Note",
};

describe("AiInsightPanel", () => {
  it("is collapsed by default", () => {
    render(<AiInsightPanel insight={insight} toggleLabel="✨ AI Insight — carrier defense pattern" />);
    expect(screen.queryByText(insight.pattern, { exact: false })).not.toBeVisible();
  });

  it("expands to show the insight when the toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<AiInsightPanel insight={insight} toggleLabel="✨ AI Insight — carrier defense pattern" />);
    await user.click(screen.getByRole("button", { name: /AI Insight/i }));
    expect(screen.getByText(insight.patternLabel, { exact: false })).toBeVisible();
    expect(screen.getByText(insight.pattern, { exact: false })).toBeVisible();
    expect(screen.getByText(insight.suggestedNoteLabel, { exact: false })).toBeVisible();
    expect(screen.getByText(insight.suggestedNote, { exact: false })).toBeVisible();
  });

  it("renders no insert button when the insight is not insertable", async () => {
    const user = userEvent.setup();
    render(<AiInsightPanel insight={insight} toggleLabel="✨ AI Insight" />);
    await user.click(screen.getByRole("button", { name: /AI Insight/i }));
    expect(screen.queryByRole("button", { name: /Copy to F9 Note/i })).not.toBeInTheDocument();
  });

  it("renders an insert button that requests insertion from the parent, without managing insert state itself", async () => {
    const user = userEvent.setup();
    const onRequestInsert = jest.fn();
    render(
      <AiInsightPanel
        insight={insight}
        toggleLabel="✨ AI Insight"
        insertable
        inserted={false}
        onRequestInsert={onRequestInsert}
      />
    );
    await user.click(screen.getByRole("button", { name: /AI Insight/i }));
    await user.click(screen.getByRole("button", { name: "Copy to F9 Note" }));
    expect(onRequestInsert).toHaveBeenCalledTimes(1);
  });

  it("shows a copied-to-clipboard confirmation and a disabled button when inserted is true", async () => {
    const user = userEvent.setup();
    render(<AiInsightPanel insight={insight} toggleLabel="✨ AI Insight" insertable inserted />);
    await user.click(screen.getByRole("button", { name: /AI Insight/i }));
    expect(screen.getByRole("button", { name: "✓ Copied to F9 Note" })).toBeDisabled();
  });

  it("falls back to generic copy wording when the insight doesn't specify a copyLabel", async () => {
    const user = userEvent.setup();
    const genericInsight = { ...insight, copyLabel: undefined };
    render(<AiInsightPanel insight={genericInsight} toggleLabel="✨ AI Insight" insertable inserted={false} />);
    await user.click(screen.getByRole("button", { name: /AI Insight/i }));
    expect(screen.getByRole("button", { name: "Copy to Clipboard" })).toBeInTheDocument();
  });
});
