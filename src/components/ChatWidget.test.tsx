import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatWidget } from "./ChatWidget";

describe("ChatWidget", () => {
  it("keeps the chat panel closed until the FAB is clicked", () => {
    render(<ChatWidget />);
    expect(screen.queryByText("Ask AI / Get Help")).not.toBeInTheDocument();
  });

  it("opens the panel with a greeting and suggested questions on FAB click", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole("button", { name: /AI assistant/i }));
    expect(screen.getByText("Ask AI / Get Help")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Talk to the dev team" })).toBeInTheDocument();
  });

  it("clicking a suggested question adds it and a canned reply to the conversation", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole("button", { name: /AI assistant/i }));
    await user.click(screen.getByRole("button", { name: "Talk to the dev team" }));
    // the suggestion button plus the echoed message bubble
    expect(screen.getAllByText("Talk to the dev team")).toHaveLength(2);
    expect(screen.getByText(/support channel/i)).toBeInTheDocument();
  });

  it("sends a typed message and clears the input", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole("button", { name: /AI assistant/i }));
    const input = screen.getByPlaceholderText("Type a message…");
    await user.type(input, "How do I export?");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByText("How do I export?")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("does not send an empty message", async () => {
    const user = userEvent.setup();
    render(<ChatWidget />);
    await user.click(screen.getByRole("button", { name: /AI assistant/i }));
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(
      screen.getAllByText("Hi — I can help interpret a claim, draft an F9 note, or loop in your dev team. What do you need?")
    ).toHaveLength(1);
  });
});
