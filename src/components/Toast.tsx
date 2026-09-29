"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface ToastContextValue {
  message: string | null;
  notify: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 1800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const notify = useCallback((msg: string) => {
    setMessage(msg);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setMessage(null), AUTO_DISMISS_MS);
  }, []);

  return <ToastContext.Provider value={{ message, notify }}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

export function Toast() {
  const { message } = useToast();
  return (
    <div
      role="status"
      aria-live="polite"
      data-visible={message !== null}
      className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded bg-panel-2 px-4 py-2.5 text-[12.5px] text-white shadow-lg transition-opacity data-[visible=false]:pointer-events-none data-[visible=false]:opacity-0 data-[visible=true]:opacity-100"
    >
      {message}
    </div>
  );
}
