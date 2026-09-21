import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
type Lead = {
  id: string;
  site_id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  source: string;
  source_record_id: string;
  stage: string;
  owner: string;
  version: number;
  created_at: string;
};
export const Route = createFileRoute("/lead-inbox")({
  head: () => {
    const h = pageHead({
      title: "Lead Inbox | Demore Technology Solutions",
      description: "Private lead pipelines for Demore businesses.",
      path: "/lead-inbox",
    });
    return {
      ...h,
      meta: h.meta
        .filter((m) => !("name" in m && m.name === "robots"))
        .concat([{ name: "robots", content: "noindex,nofollow" }]),
    };
  },
  component: Inbox,
});
const sites = [
  { id: "demore", name: "Demore Exterior Solutions", url: "https://demoreexteriorsolutions.com/" },
  {
    id: "demore-technology",
    name: "Demore Technology Solutions",
    url: "https://www.demoretechnologysolutions.com/",
  },
];
const inputClass = "mt-2 block min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2";
async function api(path: string, init?: RequestInit) {
  const r = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || "Request failed.");
  return data;
}
function Inbox() {
  const [site, setSite] = useState("demore");
  const [items, setItems] = useState<Lead[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    setReference(crypto.randomUUID());
  }, [site]);
  useEffect(() => {
    let active = true;
    setItems(null);
    setError("");
    setNotice("");
    api("/api/admin/control-leads?siteId=" + site)
      .then((d) => {
        if (active) setItems(d.items);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [site, reload]);
  async function capture(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !reference) return;
    const form = e.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api("/api/admin/control-leads", {
        method: "POST",
        body: JSON.stringify({
          ...fields,
          siteId: site,
          source: "manual",
          sourceRecordId: reference,
        }),
      });
      const refreshed = await api("/api/admin/control-leads?siteId=" + site);
      setItems(refreshed.items);
      form.reset();
      setReference(crypto.randomUUID());
      setNotice(
        result.duplicate
          ? "This submission was already saved; no duplicate was created."
          : result.possibleDuplicates.length
            ? "Saved. Another inquiry in this pipeline shares contact details. Review before following up; no records were merged."
            : "Lead saved. No message was sent.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="kicker">Private administrator workspace</p>
      <h1 className="mt-4 text-4xl font-semibold">Shared lead inbox</h1>
      <p className="mt-4 max-w-3xl text-muted">
        Separate pipelines for both businesses. Capture leads manually, assign an owner, and track
        progress. New Technology Solutions project briefs are captured here before their existing
        notifications. New Exterior Solutions leads are checked every five minutes, with tracked
        delivery and retries. Existing records are not imported automatically. New, untouched, unassigned leads are automatically assigned to Ryan during the five-minute sync. Existing human routing decisions are preserved. Administrator action alerts go to both Ryan email addresses. Customer email, SMS and automatic follow-up remain separate.
      </p>
      <Link to="/control-center-admin" className="mt-4 inline-block text-volt">
        ← Control center
      </Link>
      <div className="mt-6 flex flex-wrap gap-4">
        {sites.map((s) => (
          <a key={s.id} href={s.url} className="text-sm text-volt underline">
            {s.name}
          </a>
        ))}
      </div>
      {items !== null && <SyncHealth />}
      <label className="mt-8 block max-w-xl">
        Business pipeline
        <select
          disabled={busy}
          className={inputClass}
          value={site}
          onChange={(e) => setSite(e.target.value)}
        >
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>
      {error && (
        <p className="mt-5 text-hot" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-5 text-volt" role="status">
          {notice}
        </p>
      )}
      {items === null ? (
        <div className="mt-8">
          <p>
            {error ? "Sign in as administrator to view leads." : "Checking administrator access…"}
          </p>
          <Link to="/login" className="mt-3 inline-block text-volt underline">
            Log in
          </Link>
          <button type="button" onClick={() => setReload((v) => v + 1)} className="ml-6 underline">
            Retry
          </button>
        </div>
      ) : (
        <>
          <form
            key={site}
            onSubmit={capture}
            className="mt-8 rounded-xl border border-line p-5 sm:p-7"
          >
            <fieldset disabled={busy}>
              <legend className="text-xl font-semibold">
                Add a lead to {sites.find((s) => s.id === site)?.name}
              </legend>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label>
                  Name
                  <input
                    className={inputClass}
                    name="name"
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </label>
                <label>
                  Email
                  <input className={inputClass} name="email" type="email" maxLength={254} />
                </label>
                <label>
                  Phone
                  <input className={inputClass} name="phone" type="tel" maxLength={40} />
                </label>
                <label>
                  Inquiry / service needed
                  <textarea className={inputClass} name="interest" maxLength={2000} />
                </label>
              </div>
              <p className="mt-3 text-sm text-muted">
                Email or phone is required. Saving a lead does not establish marketing consent.
              </p>
              <button
                className="mt-5 rounded-lg bg-volt px-5 py-3 font-semibold text-black"
                disabled={busy || !reference}
              >
                {busy ? "Saving…" : "Save lead"}
              </button>
            </fieldset>
          </form>
          <section className="mt-10">
            <h2 className="text-2xl font-semibold">Recent leads</h2>
            <p className="mt-2 text-sm text-muted">
              Latest 100 records in this pipeline. Source references prevent repeat submissions;
              matching contacts are flagged, not merged.
            </p>
            {!items.length ? (
              <p className="mt-6 rounded-lg border border-line p-6">
                No leads captured in this pipeline yet.
              </p>
            ) : (
              <div className="mt-6 space-y-5">
                {items.map((lead) => (
                  <LeadCard
                    key={lead.id + ":" + lead.version}
                    lead={lead}
                    disabled={busy}
                    onBusy={setBusy}
                    onSave={(next) =>
                      setItems((prev) => prev?.map((x) => (x.id === next.id ? next : x)) ?? null)
                    }
                    onError={setError}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
function LeadCard({
  lead,
  disabled,
  onBusy,
  onSave,
  onError,
}: {
  lead: Lead;
  disabled: boolean;
  onBusy: (v: boolean) => void;
  onSave: (v: Lead) => void;
  onError: (v: string) => void;
}) {
  const [stage, setStage] = useState(lead.stage);
  const [owner, setOwner] = useState(lead.owner);
  const [history, setHistory] = useState<
    { action: string; created_at: string; details: { stage?: string; owner?: string } }[] | null
  >(null);
  const [confirming, setConfirming] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!confirming) { setConfirming(true); return; }
    onBusy(true);
    onError("");
    try {
      const r = await api("/api/admin/control-leads", {
        method: "PATCH",
        body: JSON.stringify({
          siteId: lead.site_id,
          id: lead.id,
          version: lead.version,
          stage,
          owner,
        }),
      });
      onSave(r.item);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      onBusy(false);
    }
  }
  async function showHistory() {
    try {
      const r = await api("/api/admin/control-leads?siteId=" + lead.site_id + "&leadId=" + lead.id);
      setHistory(r.events);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not load history.");
    }
  }
  return (
    <article className="rounded-xl border border-line p-5">
      <h3 className="text-xl font-semibold">{lead.name}</h3>
      <p className="mt-2 break-words text-sm">
        {lead.email || "No email"} · {lead.phone || "No phone"}
      </p>
      <p className="mt-3 whitespace-pre-wrap text-muted">{lead.interest}</p>
      <p className="mt-3 break-all text-xs text-muted">
        Source: {lead.source} · Reference: {lead.source_record_id} ·{" "}
        {new Date(lead.created_at).toLocaleString()}
      </p>
      {confirming && <p className="mt-4 rounded-lg border border-line p-3" role="status">Authorize this change for {lead.name}: stage {lead.stage} → {stage}; owner {lead.owner} → {owner}. This updates the inbox record and audit history only. No customer message will be sent.</p>}
      <form onSubmit={save} className="mt-5 flex flex-wrap items-end gap-4">
        <label>
          Stage
          <select
            disabled={disabled}
            value={stage}
            onChange={(e) => { setStage(e.target.value); setConfirming(false); }}
            className={inputClass}
          >
            {["new", "qualified", "contacted", "won", "lost"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label>
          Owner
          <select
            disabled={disabled}
            value={owner}
            onChange={(e) => { setOwner(e.target.value); setConfirming(false); }}
            className={inputClass}
          >
            <option value="unassigned">Unassigned</option>
            <option value="ryan">Ryan</option>
          </select>
        </label>
        <button disabled={disabled} className="min-h-11 rounded-lg border border-line px-4">
          {confirming ? "Confirm and authorize routing" : "Review routing change"}
        </button>
        <button
          disabled={disabled}
          type="button"
          onClick={showHistory}
          className="min-h-11 px-3 text-volt underline"
        >
          History
        </button>
      </form>
      {history && (
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {history.map((h, i) => (
            <li key={i}>
              {h.action} · {h.details.stage} · {h.details.owner} ·{" "}
              {new Date(h.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function SyncHealth() {
  const [health, setHealth] = useState<{ report: { enabled: boolean; lastRunAt: string | null; runFailed: boolean; pending: number; retry: number; failed: number }; received_at: string } | null>(null);
  const [alerts, setAlerts] = useState<{latest: {status:string;accepted_at:string|null;last_error:string|null}|null} | null>(null);
  const [emailConfigured,setEmailConfigured] = useState(false);
  const [status, setStatus] = useState("Loading sync status…");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const data = await api("/api/admin/inbox-health");
        if (active) { setHealth(data.health); setAlerts(data.alerts); setEmailConfigured(data.emailConfigured); setStatus(data.health ? "" : "Waiting for the first sync report."); setNow(Date.now()); }
      } catch { if (active) { setHealth(null); setAlerts(null); setStatus("Sync status unavailable. Sign in again or refresh this page."); } }
    };
    void refresh();
    const timer = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  const stale = health && (now - Date.parse(health.received_at) > 15 * 60000 || !health.report.lastRunAt || now - Date.parse(health.report.lastRunAt) > 15 * 60000);
  const count = (n: number) => n === 100 ? "100+" : String(n);
  return <section className="mt-6 rounded-xl border border-line bg-surface p-5" aria-label="Exterior lead sync health">
    <h2 className="text-lg font-semibold">Exterior lead sync</h2>
    {alerts && <div className="mb-4 border-b border-line pb-4"><h3 className="font-semibold">Email action alerts</h3><p className="mt-2 text-sm">Sent to ryan@demoretechnologysolutions.com and ryan@demoreexteriorsolutions.com. Use the email link to sign in, review and authorize inbox routing changes. Email replies do not authorize actions.</p><p className="mt-2 text-sm text-muted">{!emailConfigured ? "Email service needs configuration." : !alerts.latest ? "Ready — no action alert queued yet." : alerts.latest.status === "accepted" ? `Last alert accepted by email provider: ${new Date(alerts.latest.accepted_at!).toLocaleString()}.` : `Last alert: ${alerts.latest.status}. ${alerts.latest.last_error || "Waiting for delivery attempt."}`}</p><p className="mt-2 text-xs text-muted">Alerts are checked with the five-minute Exterior sync. If that scheduler stops, email checks also stop. Provider acceptance does not confirm inbox delivery.</p></div>}
    {status && <p className="mt-2 text-muted">{status}</p>}
    {health && <>
      <p className="mt-2">{!health.report.enabled ? "Paused" : stale ? "Needs attention — no recent completed sync" : health.report.runFailed || health.report.failed > 0 ? "Needs attention — inspect the delivery queue" : "Sync is current"}</p>
      <p className="mt-2 text-sm text-muted">Last run: {health.report.lastRunAt ? new Date(health.report.lastRunAt).toLocaleString() : "Not reported"}. Last report received: {new Date(health.received_at).toLocaleString()}.</p>
      <p className="mt-2">Waiting: {count(health.report.pending)} · Retrying: {count(health.report.retry)} · Failed: {count(health.report.failed)}</p>
      <p className="mt-2 text-sm text-muted">Checks every five minutes. Counts are capped at 100+. Manage retries in the Exterior Solutions Base44 delivery queue. This panel refreshes every minute while open.</p>
    </>}
  </section>;
}
