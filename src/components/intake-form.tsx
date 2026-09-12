import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  applyNeed,
  budgetBands,
  businessTypes,
  emptyBrief,
  estimatingSoftware,
  formatBrief,
  growthPriorities,
  platforms,
  siteFeatures,
  STEPS,
  STORAGE_KEY,
  wantBuilt,
  type Brief,
} from "@/lib/intake";
import { cn } from "@/lib/utils";

function Field({
  label,
  hint,
  htmlFor,
  required,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
        {label}
        {required ? (
          <span className="text-hot" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="text-xs text-faint">{hint}</p> : null}
    </div>
  );
}

const control =
  "w-full min-h-12 rounded-lg border border-line bg-elevated px-4 text-fg placeholder:text-faint";

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function IntakeForm({ need }: { need?: string; industry?: string }) {
  const [step, setStep] = useState(1);
  const [brief, setBrief] = useState<Brief>(emptyBrief);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let next = emptyBrief();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) next = { ...emptyBrief(), ...JSON.parse(raw) };
    } catch {
      next = emptyBrief();
    }
    next = applyNeed(next, need);
    if (!Array.isArray(next.wants)) next.wants = [];
    if (!Array.isArray(next.features)) next.features = [];
    if (!Array.isArray(next.platforms)) next.platforms = [];
    setBrief(next);
    setHydrated(true);
  }, [need]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(brief));
  }, [brief, hydrated]);

  function patch(partial: Partial<Brief>) {
    setBrief((current) => ({ ...current, ...partial }));
    setError("");
  }

  function next() {
    if (step === 1) {
      if (!brief.name.trim() || !brief.email.trim()) {
        setError("Name and email are required to continue.");
        return;
      }
    }
    setError("");
    setStep((current) => Math.min(5, current + 1));
  }

  function submit() {
    if (!brief.consent) {
      setError("Consent is required to submit the brief.");
      return;
    }
    patch({ submittedAt: new Date().toISOString() });
    setError("");
  }

  function reset() {
    setBrief(applyNeed(emptyBrief(), need));
    setStep(1);
    setCopied(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  async function copy() {
    await navigator.clipboard.writeText(formatBrief(brief));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const progress = useMemo(
    () => (brief.submittedAt ? 100 : (step / 5) * 100),
    [step, brief.submittedAt],
  );

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-muted">
        Loading brief…
      </div>
    );
  }

  if (brief.submittedAt) {
    return (
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-8">
        <p className="kicker">Brief saved in this browser</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          Answers are on screen.
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Copy the summary. Until a backend exists, this is the handoff. It is a
          project brief, not a contract. Claim support does not guarantee a
          carrier will increase payment. Rankings, citations, and conversion
          lifts are not guaranteed.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button type="button" onClick={copy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy brief"}
          </Button>
          <Button type="button" variant="outline" onClick={reset}>
            Start a new brief
          </Button>
        </div>
        <pre className="mt-8 overflow-x-auto whitespace-pre-wrap rounded-lg bg-bg p-4 text-sm leading-relaxed text-fg">
          {formatBrief(brief)}
        </pre>
      </div>
    );
  }

  return (
    <form
      className="rounded-xl border border-line bg-surface p-5 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (step < 5) next();
        else submit();
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="kicker">
          Step {step} of 5 — {STEPS[step - 1]?.label}
        </p>
        <p className="text-xs text-faint">Saved locally in this browser</p>
      </div>
      <div
        className="mt-4 h-1 overflow-hidden rounded-pill bg-elevated"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Brief progress"
      >
        <div className="h-full bg-hot transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <ol className="mt-4 hidden gap-2 text-[11px] uppercase tracking-[0.14em] text-faint sm:flex">
        {STEPS.map((item) => (
          <li
            key={item.id}
            className={cn(item.id === step && "text-fg", item.id < step && "text-volt")}
          >
            {item.label}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-5">
        {step === 1 ? (
          <>
            <Field label="Full name" htmlFor="name" required>
              <input
                id="name"
                className={control}
                autoComplete="name"
                value={brief.name}
                onChange={(e) => patch({ name: e.target.value })}
                required
              />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Role" htmlFor="role">
                <input
                  id="role"
                  className={control}
                  value={brief.role}
                  onChange={(e) => patch({ role: e.target.value })}
                  placeholder="Owner, operator, homeowner…"
                />
              </Field>
              <Field label="Business name" htmlFor="businessName">
                <input
                  id="businessName"
                  className={control}
                  value={brief.businessName}
                  onChange={(e) => patch({ businessName: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Business type" htmlFor="businessType">
              <select
                id="businessType"
                className={control}
                value={brief.businessType}
                onChange={(e) => patch({ businessType: e.target.value })}
              >
                <option value="">Select one</option>
                {businessTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Phone" htmlFor="phone">
                <input
                  id="phone"
                  className={control}
                  type="tel"
                  autoComplete="tel"
                  value={brief.phone}
                  onChange={(e) => patch({ phone: e.target.value })}
                />
              </Field>
              <Field label="Email" htmlFor="email" required>
                <input
                  id="email"
                  className={control}
                  type="email"
                  autoComplete="email"
                  value={brief.email}
                  onChange={(e) => patch({ email: e.target.value })}
                  required
                />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="City / market" htmlFor="city">
                <input
                  id="city"
                  className={control}
                  value={brief.city}
                  onChange={(e) => patch({ city: e.target.value })}
                />
              </Field>
              <Field label="Service area" htmlFor="serviceArea">
                <input
                  id="serviceArea"
                  className={control}
                  value={brief.serviceArea}
                  onChange={(e) => patch({ serviceArea: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Current website" htmlFor="website">
              <input
                id="website"
                className={control}
                type="url"
                inputMode="url"
                placeholder="https://"
                value={brief.website}
                onChange={(e) => patch({ website: e.target.value })}
              />
            </Field>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <fieldset>
              <legend className="text-sm font-medium text-fg">What you want built</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {wantBuilt.map((item) => (
                  <label
                    key={item.id}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-elevated px-4"
                  >
                    <input
                      type="checkbox"
                      className="size-5 accent-hot"
                      checked={brief.wants.includes(item.id)}
                      onChange={() => patch({ wants: toggle(brief.wants, item.id) })}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Primary goal in one sentence" htmlFor="goal">
              <textarea
                id="goal"
                className={cn(control, "min-h-24 py-3")}
                value={brief.goal}
                onChange={(e) => patch({ goal: e.target.value })}
              />
            </Field>
            <Field label="Timeline" htmlFor="timeline">
              <input
                id="timeline"
                className={control}
                value={brief.timeline}
                onChange={(e) => patch({ timeline: e.target.value })}
                placeholder="Launch date, storm season, whenever…"
              />
            </Field>
            <fieldset>
              <legend className="text-sm font-medium text-fg">Budget band</legend>
              <div className="mt-3 grid gap-2">
                {budgetBands.map((item) => (
                  <label
                    key={item}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-elevated px-4"
                  >
                    <input
                      type="radio"
                      name="budget"
                      className="size-5 accent-hot"
                      checked={brief.budget === item}
                      onChange={() => patch({ budget: item })}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <fieldset>
              <legend className="text-sm font-medium text-fg">Features</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {siteFeatures.map((item) => (
                  <label
                    key={item.id}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-elevated px-4"
                  >
                    <input
                      type="checkbox"
                      className="size-5 accent-hot"
                      checked={brief.features.includes(item.id)}
                      onChange={() => patch({ features: toggle(brief.features, item.id) })}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Must-have pages" htmlFor="mustHavePages">
              <textarea
                id="mustHavePages"
                className={cn(control, "min-h-24 py-3")}
                value={brief.mustHavePages}
                onChange={(e) => patch({ mustHavePages: e.target.value })}
              />
            </Field>
            <Field label="Brand colors and fonts" htmlFor="brand">
              <textarea
                id="brand"
                className={cn(control, "min-h-24 py-3")}
                value={brief.brand}
                onChange={(e) => patch({ brand: e.target.value })}
              />
            </Field>
            <Field label="Sites they like and why" htmlFor="likedSites">
              <textarea
                id="likedSites"
                className={cn(control, "min-h-24 py-3")}
                value={brief.likedSites}
                onChange={(e) => patch({ likedSites: e.target.value })}
              />
            </Field>
            <Field label="Competitors" htmlFor="competitors">
              <textarea
                id="competitors"
                className={cn(control, "min-h-24 py-3")}
                value={brief.competitors}
                onChange={(e) => patch({ competitors: e.target.value })}
              />
            </Field>
            <Field label="Who the buyer is, in their words" htmlFor="buyer">
              <textarea
                id="buyer"
                className={cn(control, "min-h-24 py-3")}
                value={brief.buyer}
                onChange={(e) => patch({ buyer: e.target.value })}
              />
            </Field>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <fieldset>
              <legend className="text-sm font-medium text-fg">Platforms</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {platforms.map((item) => (
                  <label
                    key={item}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-elevated px-4"
                  >
                    <input
                      type="checkbox"
                      className="size-5 accent-hot"
                      checked={brief.platforms.includes(item)}
                      onChange={() => patch({ platforms: toggle(brief.platforms, item) })}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Posting frequency" htmlFor="frequency">
              <input
                id="frequency"
                className={control}
                value={brief.frequency}
                onChange={(e) => patch({ frequency: e.target.value })}
              />
            </Field>
            <Field label="Who approves posts" htmlFor="approver">
              <input
                id="approver"
                className={control}
                value={brief.approver}
                onChange={(e) => patch({ approver: e.target.value })}
              />
            </Field>
            <Field label="Content they can already supply" htmlFor="existingContent">
              <textarea
                id="existingContent"
                className={cn(control, "min-h-24 py-3")}
                value={brief.existingContent}
                onChange={(e) => patch({ existingContent: e.target.value })}
              />
            </Field>
            <Field label="Current SEO situation" htmlFor="seoNow">
              <textarea
                id="seoNow"
                className={cn(control, "min-h-24 py-3")}
                value={brief.seoNow}
                onChange={(e) => patch({ seoNow: e.target.value })}
              />
            </Field>
            <fieldset>
              <legend className="text-sm font-medium text-fg">Growth priority</legend>
              <div className="mt-3 grid gap-2">
                {growthPriorities.map((item) => (
                  <label
                    key={item}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-elevated px-4"
                  >
                    <input
                      type="radio"
                      name="growthPriority"
                      className="size-5 accent-hot"
                      checked={brief.growthPriority === item}
                      onChange={() => patch({ growthPriority: item })}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <Field label="Does insurance touch this business?" htmlFor="insuranceTouches">
              <select
                id="insuranceTouches"
                className={control}
                value={brief.insuranceTouches}
                onChange={(e) => patch({ insuranceTouches: e.target.value })}
              >
                <option value="">Select one</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Sometimes">Sometimes</option>
                <option value="Homeowner claim only">Homeowner claim only</option>
              </select>
            </Field>
            <Field label="Rough claim volume per year" htmlFor="claimVolume">
              <input
                id="claimVolume"
                className={control}
                value={brief.claimVolume}
                onChange={(e) => patch({ claimVolume: e.target.value })}
              />
            </Field>
            <Field label="Carriers seen most" htmlFor="carriers">
              <input
                id="carriers"
                className={control}
                value={brief.carriers}
                onChange={(e) => patch({ carriers: e.target.value })}
              />
            </Field>
            <fieldset>
              <legend className="text-sm font-medium text-fg">Estimating software</legend>
              <div className="mt-3 grid gap-2">
                {estimatingSoftware.map((item) => (
                  <label
                    key={item}
                    className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-elevated px-4"
                  >
                    <input
                      type="radio"
                      name="estimating"
                      className="size-5 accent-hot"
                      checked={brief.estimating === item}
                      onChange={() => patch({ estimating: item })}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="What first estimates usually miss" htmlFor="missedItems">
              <textarea
                id="missedItems"
                className={cn(control, "min-h-24 py-3")}
                value={brief.missedItems}
                onChange={(e) => patch({ missedItems: e.target.value })}
                placeholder="Code items, access, flashings, waste, hidden damage…"
              />
            </Field>
            <Field label="Anything else we should know" htmlFor="anythingElse">
              <textarea
                id="anythingElse"
                className={cn(control, "min-h-24 py-3")}
                value={brief.anythingElse}
                onChange={(e) => patch({ anythingElse: e.target.value })}
              />
            </Field>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-elevated px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 size-5 accent-hot"
                checked={brief.consent}
                onChange={(e) => patch({ consent: e.target.checked })}
              />
              <span className="text-sm leading-relaxed">
                I understand this is a project brief, not a contract, and claim
                support does not guarantee a carrier will increase payment.
              </span>
            </label>
          </>
        ) : null}
      </div>

      {error ? (
        <p className="mt-6 text-sm text-hot" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          disabled={step === 1}
          onClick={() => setStep((current) => Math.max(1, current - 1))}
        >
          Back
        </Button>
        <Button type="submit" variant={step === 5 ? "claim" : "primary"}>
          {step < 5 ? "Continue" : "Submit brief"}
        </Button>
      </div>
    </form>
  );
}
