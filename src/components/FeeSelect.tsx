interface FeeSelectProps {
  options: string[];
  status: "pending" | "paid";
  pendingAmount?: number;
  onSettle?: (amount: number) => void;
}

export function FeeSelect({ options, status, pendingAmount, onSettle }: FeeSelectProps) {
  const isPending = status === "pending";

  return (
    <select
      key={status}
      data-status={status}
      defaultValue={options[0]}
      onChange={() => {
        if (isPending && pendingAmount !== undefined) onSettle?.(pendingAmount);
      }}
      className={
        isPending
          ? "mt-3 min-h-11 w-full rounded border border-amber px-3 py-2.5 text-[13.5px] font-semibold text-amber"
          : "mt-3 min-h-11 w-full rounded border border-green px-3 py-2.5 text-[13.5px] font-semibold text-green"
      }
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
