import { industryChoices } from "@/lib/industry-selection";

export function IndustryMultiselect({
  value,
  onChange,
  optional = false,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  optional?: boolean;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-medium">Industries{optional ? " (optional)" : " *"}</legend>
      <p className="mt-1 text-xs text-muted">
        Select all that apply{optional ? "." : "; choose at least one."}
      </p>
      <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto rounded-lg border border-line p-2">
        {industryChoices.map((item) => (
          <label
            key={item}
            className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md bg-elevated px-3 py-2 text-sm"
          >
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-hot"
              checked={value.includes(item)}
              onChange={() =>
                onChange(value.includes(item) ? value.filter((v) => v !== item) : [...value, item])
              }
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted" aria-live="polite">
        {value.length ? `${value.length} selected: ${value.join(", ")}` : "No industries selected"}
      </p>
    </fieldset>
  );
}
