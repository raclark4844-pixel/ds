import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_KEYS, DEFAULT_WEIGHTS, type ScoringWeights } from "@/lib/comparison";
import { pageHead } from "@/lib/seo";
import type { ComparisonReport } from "@/lib/report-pdf/report-types";

type AdminStatus = "new" | "reviewing" | "contacted" | "closed";
type QueueItem = {
  id: string;
  report: ComparisonReport;
  pdfStatus: string;
  customerEmailStatus: string;
  internalEmailStatus: string;
  adminStatus: AdminStatus;
  internalNotes: string;
  discoverySource: string;
  discoveredAt: string | null;
  createdAt: string;
};
type Settings = { weights: ScoringWeights; version: number; updatedBy: string; updatedAt: string };

export const Route = createFileRoute("/admin")({
  head: () => pageHead({ title: "Comparison Admin | Demore Technology Solutions", description: "Private comparison report administration.", path: "/admin" }),
  component: AdminRoute,
});

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}

function AdminRoute() {
  return <AdminDashboard />;
}

function AdminDashboard() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [weights, setWeights] = useState<ScoringWeights>({ ...DEFAULT_WEIGHTS });
  const [status, setStatus] = useState<"all" | AdminStatus>("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setBusy(true); setError("");
    try {
      const suffix = status === "all" ? "" : `?status=${status}`;
      const [queue, config] = await Promise.all([
        fetch(`/api/admin/comparisons${suffix}`, { credentials: "include" }).then((r) => readJson<{ items: QueueItem[] }>(r)),
        fetch("/api/admin/scoring-weights", { credentials: "include" }).then((r) => readJson<Settings>(r)),
      ]);
      setItems(queue.items); setSettings(config); setWeights(config.weights);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load the admin dashboard."); }
    finally { setBusy(false); }
  }, [status]);

  useEffect(() => { void load(); }, [load]);
  const totalWeight = useMemo(() => CATEGORY_KEYS.reduce((sum, key) => sum + weights[key], 0), [weights]);

  async function saveItem(item: QueueItem) {
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await fetch("/api/admin/comparisons", {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: item.adminStatus, notes: item.internalNotes }),
      }).then((r) => readJson<{ item: QueueItem }>(r));
      setItems((current) => current.map((row) => row.id === item.id ? result.item : row));
      setNotice(`${item.id} saved.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Save failed."); }
    finally { setBusy(false); }
  }

  async function saveWeights() {
    if (totalWeight !== 100) { setError("Scoring weights must total exactly 100."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      const config = await fetch("/api/admin/scoring-weights", {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ weights }),
      }).then((r) => readJson<Settings>(r));
      setSettings(config); setNotice(`Scoring version ${config.version} saved. New reports will use it.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Scoring weights could not be saved."); }
    finally { setBusy(false); }
  }

  return (
    <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-8">
        <div><p className="kicker">Private administration</p><h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Comparison queue</h1><p className="mt-3 max-w-2xl text-muted">Durable customer reports, delivery status, live-discovery evidence, follow-up notes, and scoring controls.</p></div>
        <Button variant="outline" onClick={() => void load()} disabled={busy}><RefreshCw className="size-4" /> Refresh</Button>
      </div>
      {error && <div role="alert" className="mt-6 rounded-lg border border-hot/50 bg-hot-dim p-4 text-sm">{error} {/sign in|administrator/i.test(error) && <a href="/login" className="ml-2 text-volt underline">Open admin sign in</a>}</div>}
      {notice && <div role="status" className="mt-6 rounded-lg border border-volt/40 bg-volt-dim p-4 text-sm text-volt">{notice}</div>}

      <section className="mt-10 rounded-xl border border-line bg-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="kicker">Scoring CMS</p><h2 className="mt-2 text-2xl font-semibold">Category weights</h2><p className="mt-2 text-sm text-muted">Applies to future reports only. Every revision is retained.</p></div><div className={`rounded-pill border px-4 py-2 text-sm ${totalWeight === 100 ? "border-volt/50 text-volt" : "border-hot/50 text-hot"}`}>Total: {totalWeight}/100</div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_KEYS.map((key) => <label key={key} className="text-sm capitalize text-muted">{key}<input type="number" min={0} max={100} step={1} value={weights[key]} onChange={(e) => setWeights((current) => ({ ...current, [key]: Number(e.target.value) }))} className="mt-1 block w-full rounded-md border border-line bg-bg px-3 py-2 text-fg" /></label>)}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4"><Button variant="volt" disabled={busy || totalWeight !== 100} onClick={() => void saveWeights()}><Save className="size-4" /> Save weights</Button>{settings && <span className="text-xs text-muted">Version {settings.version} · last changed by {settings.updatedBy}</span>}</div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="kicker">Customer reports</p><h2 className="mt-2 text-2xl font-semibold">Follow-up queue</h2></div><label className="text-sm text-muted">Filter status<select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="ml-2 rounded-md border border-line bg-bg px-3 py-2 text-fg"><option value="all">All</option><option value="new">New</option><option value="reviewing">Reviewing</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label></div>
        <div className="mt-5 space-y-4">
          {!busy && !items.length && <div className="rounded-xl border border-line p-8 text-center text-muted">No comparisons in this view yet.</div>}
          {items.map((item) => <ComparisonCard key={item.id} item={item} disabled={busy} onChange={(next) => setItems((current) => current.map((row) => row.id === next.id ? next : row))} onSave={saveItem} />)}
        </div>
      </section>
    </main>
  );
}

function ComparisonCard({ item, disabled, onChange, onSave }: { item: QueueItem; disabled: boolean; onChange: (item: QueueItem) => void; onSave: (item: QueueItem) => Promise<void> }) {
  const report = item.report;
  return (
    <article className="rounded-xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-xl font-semibold">{report.companyName}</h3><span className="rounded-pill border border-line px-2 py-1 text-xs text-muted">{item.id}</span></div><a href={report.website} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-volt hover:underline">{report.website}</a><p className="mt-2 text-sm text-muted">{report.contactName} · {report.contactEmail}{report.contactPhone ? ` · ${report.contactPhone}` : ""} · {report.market}{report.timeframe ? ` · ${report.timeframe}` : ""}</p></div><div className="grid grid-cols-3 gap-2 text-center text-xs"><Metric label="Current" value={report.currentTotal} /><Metric label="Competitors" value={report.competitorAverage} /><Metric label="Potential" value={report.potential} /></div></div>
      <div className="mt-5 grid gap-3 text-xs text-muted sm:grid-cols-4"><p>Discovery<br/><strong className="text-fg">{item.discoverySource}</strong></p><p>PDF<br/><strong className="text-fg">{item.pdfStatus}</strong></p><p>Customer email<br/><strong className="text-fg">{item.customerEmailStatus}</strong></p><p>Internal email<br/><strong className="text-fg">{item.internalEmailStatus}</strong></p></div>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="text-muted"><tr><th className="pb-2">Competitor</th><th>Source</th><th>Maps</th><th>Organic</th><th>Rating</th><th>Website score</th></tr></thead><tbody>{report.competitors.map((row) => <tr key={`${row.name}-${row.website}`} className="border-t border-line"><td className="py-2 pr-3 text-fg">{row.name}</td><td>{row.source || row.evidence}</td><td>{row.mapsRank ? `#${row.mapsRank}` : "—"}</td><td>{row.organicRank ? `#${row.organicRank}` : "—"}</td><td>{row.rating ? `${row.rating} (${row.reviewCount ?? 0})` : "—"}</td><td>{row.total}</td></tr>)}</tbody></table></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr_auto]"><select aria-label={`Status for ${item.id}`} value={item.adminStatus} onChange={(e) => onChange({ ...item, adminStatus: e.target.value as AdminStatus })} className="rounded-md border border-line bg-bg px-3 py-2"><option value="new">New</option><option value="reviewing">Reviewing</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select><textarea aria-label={`Internal notes for ${item.id}`} value={item.internalNotes} onChange={(e) => onChange({ ...item, internalNotes: e.target.value })} rows={2} placeholder="Internal follow-up notes" className="rounded-md border border-line bg-bg px-3 py-2"/><Button variant="outline" disabled={disabled} onClick={() => void onSave(item)}><ShieldCheck className="size-4" /> Save</Button></div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-md border border-line p-2"><span className="text-muted">{label}</span><strong className="mt-1 block text-lg text-volt">{value}</strong></div>;
}
