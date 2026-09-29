import { useState } from "react";

interface ResolvableSelectProps {
  options: string[];
  onResolve: () => void;
  variant?: "urgent" | "primary" | "default";
  resolveOption?: string;
}

export function ResolvableSelect({
  options,
  onResolve,
  variant = "default",
  resolveOption = "✓ Mark Resolved",
}: ResolvableSelectProps) {
  const [value, setValue] = useState(options[0]);

  const variantClass =
    variant === "urgent"
      ? "border-amber text-amber font-semibold"
      : variant === "primary"
        ? "border-amber bg-amber text-white font-semibold"
        : "border-card-line text-fg";

  return (
    <select
      data-variant={variant}
      value={value}
      onChange={(e) => {
        const next = e.target.value;
        setValue(next);
        if (next === resolveOption) onResolve();
      }}
      className={`mt-3 min-h-11 w-full rounded border bg-card px-3 py-2.5 text-[13.5px] ${variantClass}`}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
