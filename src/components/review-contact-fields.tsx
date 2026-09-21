import type { useReviewContact } from "@/lib/use-review-contact";

export function ReviewContactFields({
  state,
  disabled,
}: {
  state: ReturnType<typeof useReviewContact>;
  disabled: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="space-y-3">
      <legend className="mb-2 text-sm font-medium">Your contact details</legend>
      {state.canSkip ? (
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={state.skipContact}
            onChange={(e) => state.setSkipContact(e.target.checked)}
          />
          Skip contact details (signed-in administrator)
        </label>
      ) : null}
      {!state.skipContact ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["name", "Full name", "text", "name", 120],
              ["email", "Email", "email", "email", 254],
              ["phone", "Phone", "tel", "tel", 60],
              ["company", "Company name", "text", "organization", 160],
            ] as const
          ).map(([key, label, type, autoComplete, maxLength]) => (
            <label key={key} className="block text-xs">
              {label}
              <input
                type={type}
                autoComplete={autoComplete}
                required
                maxLength={maxLength}
                value={state.contact[key] || ""}
                onChange={(e) => state.setContact((c) => ({ ...c, [key]: e.target.value }))}
                className="mt-1 min-h-10 w-full min-w-0 rounded-md border border-line bg-elevated px-2 text-base"
              />
            </label>
          ))}
        </div>
      ) : null}
      <p className="text-xs leading-relaxed text-muted">
        Your report and contact details will be sent to Ryan at Demore Technology Solutions so he
        can follow up about these improvements. Public contact details found on the reviewed website
        are included.
      </p>
    </fieldset>
  );
}
