"use client";

import { useEffect, useState } from "react";
import { fetchApiToggleState, toggleApi } from "@/lib/api-client";

type ToggleState = "checking" | "on" | "off";

export function ApiToggle() {
  const [state, setState] = useState<ToggleState>("checking");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchApiToggleState()
      .then((result) => {
        if (!cancelled) setState(result.enabled ? "on" : "off");
      })
      .catch(() => {
        // Can't reach the toggle route itself — treat as off, not a false "on".
        if (!cancelled) setState("off");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = async () => {
    const previous = state;
    setPending(true);
    setState(previous === "on" ? "off" : "on");
    try {
      const result = await toggleApi();
      setState(result.enabled ? "on" : "off");
    } catch {
      setState(previous);
    } finally {
      setPending(false);
    }
  };

  const label = state === "checking" ? "API: ..." : state === "on" ? "API: On" : "API: Off";
  const textClass = state === "on" ? "text-green" : state === "off" ? "text-amber" : "text-fg-muted";
  const dotClass = state === "on" ? "bg-green" : state === "off" ? "bg-amber" : "bg-fg-muted";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || state === "checking"}
      aria-pressed={state === "on"}
      title="Toggle the mock API on/off, to simulate an outage"
      className={`inline-flex items-center gap-1.5 rounded-full border border-card-line px-2.5 py-1 text-[11px] font-semibold disabled:opacity-60 ${textClass}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      {label}
    </button>
  );
}
