import { useEffect, useState } from "react";
import { getBearerToken, authClient } from "@/lib/auth/client";
type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  stage: string;
  version: number;
  enrichment: Record<string, unknown> | null;
  tech_stack: unknown;
  document_text: string | null;
};
type Activity = {
  id: string;
  lead_id: string;
  channel: string;
  body: string;
  delivery_status: string;
  created_at: string;
};
type Snapshot = {
  leads: Lead[];
  activity: Activity[];
  canEdit: boolean;
  checkoutEnabled: boolean;
  activeOrgId: string;
  workspaces: { id: string; name: string }[];
  showCompleted: boolean;
  billing: {
    daily_cap_microdollars: number;
    current_day_spend_microdollars: number;
    usage_halted: boolean;
  } | null;
};
const badges: Record<string, string> = {
  sms: "bg-emerald-400 text-slate-950",
  email: "bg-sky-300 text-slate-950",
  chat: "bg-violet-300 text-slate-950",
  status: "bg-amber-300 text-slate-950",
  document: "bg-rose-300 text-slate-950",
};
const button =
  "rounded-lg border border-slate-600 px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-50";
async function request(path: string, body?: unknown, signal?: AbortSignal) {
  const token = getBearerToken();
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    signal,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || "Request could not be completed.");
  return result;
}
export function SalesDesk() {
  const [data, setData] = useState<Snapshot | null>(null),
    [selected, setSelected] = useState("");
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<"sms" | "email" | null>(null),
    [body, setBody] = useState(""),
    [draftKey, setDraftKey] = useState("");
  const [showDocument, setShowDocument] = useState(false),
    [settings, setSettings] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    request("/api/workspace/sales", undefined, controller.signal)
      .then(setData)
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, []);
  const lead = data?.leads.find((l) => l.id === selected);
  async function mutate(input: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await request("/api/workspace/sales", input);
      setData(await request("/api/workspace/sales"));
      setNotice("Saved to your workspace.");
      setDraft(null);
      setBody("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  async function switchWorkspace(orgId: string) {
    setBusy(true);
    setError("");
    setData(null);
    setSelected("");
    setDraft(null);
    setBody("");
    setNotice("");
    try {
      const result = await authClient.organization.setActive({ organizationId: orgId });
      if (result.error) throw Error("Could not switch company. Confirm your membership.");
      setData(await request("/api/workspace/sales"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not switch company.");
    } finally {
      setBusy(false);
    }
  }
  async function openCheckout() {
    setBusy(true);
    setError("");
    try {
      const result = await request("/api/checkout/session", {});
      const target = new URL(result.url);
      if (target.protocol !== "https:" || target.hostname !== "checkout.stripe.com")
        throw Error("Checkout destination could not be verified.");
      window.location.assign(target.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open checkout.");
      setBusy(false);
    }
  }
  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-12 text-slate-100">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-300">
            {data?.workspaces?.find((s) => s.id === data.activeOrgId)?.name ||
              "Demore Technology Solutions"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Sales workspace</h1>
          <p className="mt-2 text-slate-400">Your company’s leads and recent conversations.</p>
        </div>
        {data?.workspaces?.length ? (
          <label>
            Company
            <select
              aria-label="Company"
              className="ml-2 rounded bg-slate-800 p-2"
              disabled={busy}
              value={data.activeOrgId}
              onChange={(e) => void switchWorkspace(e.target.value)}
            >
              {data.workspaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button className={button} onClick={() => setSettings(!settings)} aria-expanded={settings}>
          Workspace settings
        </button>
      </header>
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-rose-400 p-4">
          {error}{" "}
          <a href="/login" className="underline">
            Sign in
          </a>
        </p>
      )}
      {notice && (
        <p role="status" className="mb-4 text-emerald-300">
          {notice}
        </p>
      )}
      {!data && !error && <p role="status">Loading your workspace…</p>}
      {data && (
        <>
          {settings && (
            <section
              aria-label="Workspace settings"
              className="mb-6 rounded-xl border border-slate-700 p-5"
            >
              <h2 className="text-xl font-semibold">Workspace settings</h2>
              <label className="my-4 flex gap-3">
                <input
                  type="checkbox"
                  checked={data.showCompleted}
                  disabled={!data.canEdit || busy}
                  onChange={(e) =>
                    void mutate({ action: "preferences", showCompleted: e.target.checked })
                  }
                />
                Show won and lost leads
              </label>
              {data.billing && (
                <p className="mb-4">
                  Daily allowance: ${(data.billing.daily_cap_microdollars / 1e6).toFixed(2)} ·
                  Reserved and recorded: $
                  {(data.billing.current_day_spend_microdollars / 1e6).toFixed(2)}
                  {data.billing.usage_halted ? " · Usage paused for review" : ""}
                </p>
              )}
              {data.checkoutEnabled && (
                <button
                  className={button}
                  disabled={!data.canEdit || busy}
                  onClick={() => void openCheckout()}
                >
                  Open secure checkout
                </button>
              )}
            </section>
          )}
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_340px]" aria-busy={busy}>
            <nav aria-label="Select lead" className="space-y-2">
              <h2 className="mb-3 text-lg font-semibold">Leads</h2>
              <button
                className={`${button} w-full`}
                onClick={() => {
                  setSelected("");
                  setDraft(null);
                }}
              >
                All activity
              </button>
              {data.leads
                .filter((l) => data.showCompleted || !["won", "lost"].includes(l.stage))
                .map((l) => (
                  <button
                    key={l.id}
                    aria-pressed={selected === l.id}
                    className={`${button} w-full text-left ${selected === l.id ? "border-cyan-300 bg-slate-800" : ""}`}
                    onClick={() => {
                      setSelected(l.id);
                      setDraft(null);
                      setShowDocument(false);
                    }}
                  >
                    <strong className="block">{l.name}</strong>
                    <span className="text-slate-400">{l.stage}</span>
                  </button>
                ))}
              {!data.leads.length && (
                <p className="text-slate-400">No leads in this workspace yet.</p>
              )}
            </nav>
            <section aria-label="Activity feed">
              <h2 className="mb-4 text-xl font-semibold">
                {lead ? `${lead.name} · Activity` : "Recent activity"}
              </h2>
              <ol className="space-y-4">
                {data.activity
                  .filter((a) => !selected || a.lead_id === selected)
                  .map((a) => (
                    <li key={a.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold uppercase ${badges[a.channel] || badges.status}`}
                        >
                          {a.channel}
                        </span>
                        <span className="text-sm text-slate-400">{a.delivery_status}</span>
                        <time className="ml-auto text-xs text-slate-400" dateTime={a.created_at}>
                          {new Date(a.created_at).toLocaleString()}
                        </time>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap break-words">{a.body}</p>
                    </li>
                  ))}
              </ol>
              {!data.activity.some((a) => !selected || a.lead_id === selected) && (
                <p className="rounded-xl border border-dashed border-slate-700 p-8 text-slate-400">
                  No recorded activity yet.
                </p>
              )}
            </section>
            <aside
              aria-label="Lead details"
              className="self-start rounded-xl border border-slate-700 bg-slate-900 p-5 lg:sticky lg:top-24"
            >
              {!lead ? (
                <p className="text-slate-400">
                  Select a lead to review enrichment and prepare follow-up.
                </p>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">{lead.name}</h2>
                  <p className="mt-2 break-all text-sm text-slate-400">
                    {lead.email || "No email recorded"}
                    <br />
                    {lead.phone || "No phone recorded"}
                  </p>
                  <p className="mt-3 text-sm">{lead.interest}</p>
                  <label className="mt-5 block">
                    Lead status
                    <select
                      className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-800 p-2"
                      value={lead.stage}
                      disabled={!data.canEdit || busy}
                      onChange={(e) =>
                        void mutate({
                          action: "stage",
                          leadId: lead.id,
                          version: lead.version,
                          stage: e.target.value,
                        })
                      }
                    >
                      {["new", "qualified", "contacted", "won", "lost"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <h3 className="mt-6 font-semibold">Enrichment</h3>
                  <dl className="mt-2 space-y-2 text-sm">
                    {Object.entries(lead.enrichment || {}).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-slate-400">{key}</dt>
                        <dd className="break-words">
                          {typeof value === "string" ? value : JSON.stringify(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {!Object.keys(lead.enrichment || {}).length && (
                    <p className="text-sm text-slate-400">No verified enrichment recorded.</p>
                  )}
                  <h3 className="mt-5 font-semibold">Technology audit</h3>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-300">
                    {lead.tech_stack
                      ? JSON.stringify(lead.tech_stack, null, 2)
                      : "No audit recorded."}
                  </pre>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(["sms", "email"] as const).map((channel) => (
                      <button
                        key={channel}
                        className={button}
                        disabled={!data.canEdit || busy}
                        onClick={() => {
                          setDraft(channel);
                          setBody("");
                          setDraftKey(crypto.randomUUID());
                        }}
                      >
                        Draft {channel === "sms" ? "text" : "email"}
                      </button>
                    ))}
                    <button
                      className={button}
                      onClick={() => setShowDocument(!showDocument)}
                      aria-expanded={showDocument}
                    >
                      Review document
                    </button>
                  </div>
                  {draft && (
                    <form
                      className="mt-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void mutate({
                          action: "draft",
                          leadId: lead.id,
                          channel: draft,
                          body,
                          requestId: draftKey,
                        });
                      }}
                    >
                      <label>
                        Message draft
                        <textarea
                          className="mt-2 min-h-32 w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
                          maxLength={8000}
                          required
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                        />
                      </label>
                      <p className="my-2 text-xs text-slate-400">
                        Saves a draft for review. Sending is not enabled.
                      </p>
                      <button className={button} disabled={busy || !body.trim()}>
                        Save draft
                      </button>
                    </form>
                  )}
                  {showDocument && (
                    <section className="mt-4">
                      <h3 className="font-semibold">Generated document</h3>
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                        {lead.document_text || "No document has been generated for this lead."}
                      </p>
                    </section>
                  )}
                </>
              )}
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
