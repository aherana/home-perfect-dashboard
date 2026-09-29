import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteModal } from "./NoteModal";

describe("NoteModal", () => {
  it("renders nothing when closed", () => {
    render(<NoteModal open={false} initialText="draft" onCancel={() => {}} onSave={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("defaults to generic title and copy-button wording when none is given", () => {
    render(<NoteModal open initialText="Extended dry time required." onCancel={() => {}} onSave={() => {}} />);
    expect(screen.getByText("Edit Note")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy to Clipboard" })).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Extended dry time required.");
  });

  it("uses the given title and copy-button wording", () => {
    render(
      <NoteModal
        open
        initialText="Extended dry time required."
        title="Edit F9 Note"
        copyLabel="Copy to F9 Note"
        onCancel={() => {}}
        onSave={() => {}}
      />
    );
    expect(screen.getByText("Edit F9 Note")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy to F9 Note" })).toBeInTheDocument();
  });

  it("copies the edited text to the clipboard and calls onSave with it", async () => {
    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, "writeText");
    const onSave = jest.fn();
    render(<NoteModal open initialText="Original." onCancel={() => {}} onSave={onSave} />);
    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "Edited note.");
    await user.click(screen.getByRole("button", { name: "Copy to Clipboard" }));
    expect(writeText).toHaveBeenCalledWith("Edited note.");
    expect(onSave).toHaveBeenCalledWith("Edited note.");
  });

  it("still calls onSave if the clipboard write fails", async () => {
    const user = userEvent.setup();
    jest.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(new Error("denied"));
    const onSave = jest.fn();
    render(<NoteModal open initialText="Original." onCancel={() => {}} onSave={onSave} />);
    await user.click(screen.getByRole("button", { name: "Copy to Clipboard" }));
    expect(onSave).toHaveBeenCalledWith("Original.");
  });

  it("calls onCancel without saving or copying when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, "writeText");
    const onCancel = jest.fn();
    const onSave = jest.fn();
    render(<NoteModal open initialText="Original." onCancel={onCancel} onSave={onSave} />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });

  it("resets to the new initialText when reopened with different content", () => {
    const { rerender } = render(
      <NoteModal open initialText="First." onCancel={() => {}} onSave={() => {}} />
    );
    rerender(<NoteModal open={false} initialText="First." onCancel={() => {}} onSave={() => {}} />);
    rerender(<NoteModal open initialText="Second." onCancel={() => {}} onSave={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("Second.");
  });
});
