"use client";

import type { ReactNode } from "react";
import { useToast } from "./Toast";

interface DeadLinkProps {
  label: string;
  children: ReactNode;
}

export function DeadLink({ label, children }: DeadLinkProps) {
  const { notify } = useToast();
  return (
    <button
      type="button"
      onClick={() => notify(`→ Would open: ${label}`)}
      className="cursor-pointer underline decoration-card-line underline-offset-2 hover:text-amber hover:decoration-amber"
    >
      {children}
    </button>
  );
}
