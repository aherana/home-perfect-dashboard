"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";

interface NoteModalProps {
  open: boolean;
  initialText: string;
  title?: string;
  copyLabel?: string;
  onCancel: () => void;
  onSave: (text: string) => void;
}

function NoteModalContent({
  initialText,
  title = "Edit Note",
  copyLabel = "Copy to Clipboard",
  onCancel,
  onSave,
}: Omit<NoteModalProps, "open">) {
  const [text, setText] = useState(initialText);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[35] flex items-center justify-center bg-black/50"
    >
      <div className="w-[min(480px,calc(100vw-40px))] rounded-lg border border-card-line bg-card p-5">
        <div className="mb-2.5 text-sm font-bold">{title}</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[130px] w-full resize-y rounded border border-card-line bg-bg p-3 font-sans text-[13px] text-fg"
        />
        <div className="mt-3.5 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-9 rounded border border-card-line px-3.5 py-2 text-[12.5px] font-semibold text-fg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await copyToClipboard(text);
              } catch {
                // clipboard unavailable or permission denied — still commit the note
              }
              onSave(text);
            }}
            className="min-h-9 rounded bg-amber px-3 py-2 text-[11.5px] font-semibold text-white"
          >
            {copyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function NoteModal({ open, initialText, title, copyLabel, onCancel, onSave }: NoteModalProps) {
  if (!open) return null;
  return (
    <NoteModalContent
      key={initialText}
      initialText={initialText}
      title={title}
      copyLabel={copyLabel}
      onCancel={onCancel}
      onSave={onSave}
    />
  );
}
