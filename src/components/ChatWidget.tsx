"use client";

import { useState } from "react";

interface Message {
  id: number;
  text: string;
  mine: boolean;
}

const GREETING =
  "Hi — I can help interpret a claim, draft an F9 note, or loop in your dev team. What do you need?";

const SUGGESTIONS = [
  "Why is DASH-4821 flagged?",
  "Export this month's AR aging",
  "Talk to the dev team",
];

function cannedReply(question: string): string {
  if (/dev team/i.test(question)) {
    return "Got it — in the live build this routes straight to your build team's support channel.";
  }
  if (/export/i.test(question)) {
    return "In the live build I'd generate that file directly from QuickBooks. For now, use the Export CSV button on each tab.";
  }
  return "In the live build I'd pull the claim file and answer from your DASH/QuickBooks data directly — this chat is a preview of that assistant.";
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, text: trimmed, mine: true },
      { id: prev.length + 1, text: cannedReply(trimmed), mine: false },
    ]);
  };

  return (
    <>
      <button
        type="button"
        aria-label="AI assistant"
        onClick={() => setOpen((o) => !o)}
        className="fixed right-5 bottom-5 z-20 h-14 w-14 rounded-full bg-amber text-[23px] text-white shadow-lg"
      >
        💬
      </button>
      {open && (
        <div className="fixed right-5 bottom-[86px] z-20 flex max-h-[60vh] w-[min(320px,calc(100vw-40px))] flex-col overflow-hidden rounded-lg border border-card-line bg-card shadow-2xl">
          <div className="border-b border-card-line px-3.5 py-3 text-[13px] font-bold text-fg">Ask AI / Get Help</div>
          <div className="flex max-h-[280px] flex-1 flex-col gap-2 overflow-y-auto px-3.5 py-3 text-[12.5px] text-fg-muted">
            <div className="rounded-md bg-bg px-2.5 py-2">{GREETING}</div>
            <div>
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="mt-0.5 mr-1 rounded-full border border-card-line px-2.5 py-1.5 text-[11px] text-fg"
                >
                  {q}
                </button>
              ))}
            </div>
            {messages.map((m) => (
              <div
                key={m.id}
                className={
                  m.mine
                    ? "self-end rounded-md bg-amber-soft px-2.5 py-2 text-amber"
                    : "rounded-md bg-bg px-2.5 py-2"
                }
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 border-t border-card-line p-2">
            <input
              type="text"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-1.5 py-1.5 text-[13px] text-fg"
            />
            <button
              type="button"
              onClick={() => {
                send(input);
                setInput("");
              }}
              className="rounded bg-amber px-3 py-1.5 text-[12.5px] font-semibold text-white"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
