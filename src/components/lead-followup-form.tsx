import { useState } from "react";
import { Button } from "@/components/ui/button";
const control = "mt-2 block min-h-11 w-full rounded-md border border-line bg-bg p-3";
export function LeadFollowupForm() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const fields = new FormData(event.currentTarget);
    const id = requestId || crypto.randomUUID();
    setRequestId(id);
    try {
      const response = await fetch("/api/lead-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(fields), requestId: id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your request could not be sent.");
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="mt-6 border-t border-line pt-6"
      aria-label="Request a lead-generation follow-up"
    >
      <h3 className="font-display text-2xl font-semibold">
        Want a lead-generation system for your business?
      </h3>
      <p className="mt-3 text-sm text-muted">
        Fill out your information and Ryan will follow up. Your request is emailed to
        ryan@demoretechnologysolutions.com. This does not create a campaign or draft.
      </p>
      {!open ? (
        <Button className="mt-5" onClick={() => setOpen(true)} aria-expanded={false}>
          Fill out information for Ryan to follow up
        </Button>
      ) : sent ? (
        <p role="status" className="mt-5 text-volt">
          Your follow-up request has been sent to Ryan. No campaign or draft was created.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { name: "name", label: "Your name", type: "text", autoComplete: "name", max: 120 },
            {
              name: "company",
              label: "Company name",
              type: "text",
              autoComplete: "organization",
              max: 180,
            },
            {
              name: "email",
              label: "Email address",
              type: "email",
              autoComplete: "email",
              max: 254,
            },
            { name: "phone", label: "Phone number", type: "tel", autoComplete: "tel", max: 40 },
          ].map((field) => (
            <label key={field.name} className="text-sm">
              {field.label}
              <input
                className={control}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                required
                maxLength={field.max}
              />
            </label>
          ))}
          <label className="text-sm sm:col-span-2">
            Website (optional)
            <input
              className={control}
              name="website"
              maxLength={300}
              placeholder="www.yourcompany.com"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            What would you like help with?
            <textarea
              className={control}
              name="goals"
              required
              minLength={10}
              maxLength={3000}
              rows={4}
              placeholder="Tell Ryan about your industry, goals, and the best time to contact you."
            />
          </label>
          <div hidden aria-hidden="true">
            <label>
              Leave empty
              <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          {error ? (
            <p role="alert" className="text-sm text-hot sm:col-span-2">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={busy} className="justify-self-start">
            {busy ? "Sending…" : "Send follow-up request to Ryan"}
          </Button>
        </form>
      )}
    </section>
  );
}
