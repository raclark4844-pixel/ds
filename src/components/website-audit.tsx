import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { AuditCheck, AuditReport } from "@/lib/audit/analyze";
import { mintRecordId, normalizeRecordId } from "@/lib/audit/record";
import { storeReportId } from "@/lib/site-assistant-ids";

function statusClass(status: string) {
  if (status === "Detected") return "text-volt";
  if (status === "Not detected") return "text-hot";
  return "text-muted";
}

function benchmarkStatus(report: AuditReport, check: AuditCheck) {
  if (report.benchmark.unavailable) return "Unavailable";
  return report.benchmark.checks.find((row) => row.id === check.id)?.status || "Unavailable";
}

export function WebsiteAudit() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [busy, setBusy] = useState<"off" | "review" | "pdf">("off");
  const [error, setError] = useState("");
  const [recordId, setRecordId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const given = params.get("url");
    if (given) setUrl(given);
    const existing = normalizeRecordId(params.get("rid") || localStorage.getItem("dts-record-id") || "");
    const id = existing || mintRecordId();
    setRecordId(id);
    try {
      localStorage.setItem("dts-record-id", id);
    } catch {
      /* ignore */
    }
    storeReportId(id);
    if (window.location.hash === "#website-review") {
      document.getElementById("website-review")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy !== "off") return;
    setBusy("review");
    setReport(null);
    setError("");
    try {
      const res = await fetch("/api/website-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, recordId }),
        signal: AbortSignal.timeout(28000),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Unable to complete the review.");
      setReport(data.report);
      storeReportId(data.report.recordId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete the review.");
    } finally {
      setBusy("off");
    }
  }

  async function download() {
    if (!report || busy !== "off") return;
    setBusy("pdf");
    setError("");
    try {
      const res = await fetch("/api/website-audit-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report }),
      });
      const type = res.headers.get("content-type") || "";
      if (!res.ok || !type.includes("application/pdf")) {
        throw new Error("The PDF could not be created. Please try again.");
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `Demore-Website-Report-${report.recordId || "Review"}.pdf`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The PDF could not be created. Please try again.");
    } finally {
      setBusy("off");
    }
  }

  return (
    <section id="website-review" className="mt-10 scroll-mt-24 space-y-6 rounded-xl border border-line border-l-4 border-l-volt bg-surface p-5 sm:p-8">
      <p className="kicker">Ask Demore / Website review</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">See what your website could do next.</h2>
      <p className="max-w-2xl text-muted">
        Enter a public website address for a side-by-side review, practical recommendations, and a professionally branded PDF.
      </p>
      {recordId ? (
        <p className="inline-flex rounded-pill border border-volt/40 px-3 py-1 text-xs text-volt">
          This review uses record {recordId}. The same ID follows Ask Demore and the project brief.
        </p>
      ) : null}
      <form onSubmit={submit} className="space-y-3">
        <label htmlFor="audit-url" className="block text-sm font-medium">
          Website address
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="audit-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="yourbusiness.com"
            required
            maxLength={2048}
            disabled={busy !== "off"}
            className="min-h-12 w-full rounded-md border border-line bg-bg px-3 py-2"
          />
          <Button type="submit" disabled={busy !== "off"}>
            {busy === "review" ? "Reviewing website…" : "Review my website"}
          </Button>
        </div>
      </form>
      {busy === "review" ? (
        <p role="status" className="text-sm text-muted">
          Inspecting your page and the Demore Exterior Solutions reference. This may take up to 25 seconds.
        </p>
      ) : null}
      {error ? <p role="alert" className="rounded-md border border-hot/40 bg-hot-dim px-3 py-2 text-sm">{error}</p> : null}
      {report ? (
        <div className="space-y-6" aria-label="Website review results">
          <div>
            <p className="kicker">Your website opportunity report</p>
            <p className="mt-2 text-xs text-volt">Record {report.recordId}</p>
            <h3 className="mt-2 font-display text-2xl">{report.current.title}</h3>
            <p className="break-all text-sm text-muted">{report.current.url}</p>
          </div>
          <p className="text-sm text-muted">Compare observable website features with a live Demore Exterior Solutions reference and plan the next improvements.</p>
          <div className="flex gap-6 text-xs text-muted">
            <span className="before:mr-2 before:inline-block before:h-2.5 before:w-2.5 before:bg-volt">Your page</span>
            <span className="before:mr-2 before:inline-block before:h-2.5 before:w-2.5 before:bg-faint">Demore Exterior Solutions</span>
          </div>
          {report.categories.map((c) => {
            const refs = report.benchmark.checks.filter((r) => r.category === c.name && r.status !== "Not applicable");
            const count = refs.filter((r) => r.status === "Detected").length;
            const refTotal = report.benchmark.unavailable ? 0 : refs.length;
            return (
              <div key={c.name} className="space-y-2">
                <strong className="text-sm">{c.name}</strong>
                {(
                  [
                    [c.detected, c.total, "bg-volt"],
                    [count, refTotal, "bg-faint"],
                  ] as const
                ).map(([n, total, bar], index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-sm bg-elevated">
                      <div className={`h-full ${bar}`} style={{ width: `${total ? (n / total) * 100 : 0}%` }} />
                    </div>
                    <span className="w-10 text-xs">{total ? `${n}/${total}` : "N/A"}</span>
                  </div>
                ))}
              </div>
            );
          })}
          <p className="text-xs text-muted">Bars show detected HTML signals, not speed, rankings, or revenue. Missing signals need verification.</p>
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Current page compared with Demore Exterior Solutions</caption>
              <thead className="bg-bg text-muted">
                <tr>
                  <th className="p-3">Capability</th>
                  <th>Your page</th>
                  <th>Demore Exterior</th>
                  <th>Demore can help with</th>
                </tr>
              </thead>
              <tbody>
                {report.current.checks.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <th scope="row" className="p-3 font-medium">{c.label}</th>
                    <td className={statusClass(c.status)}>{c.status}</td>
                    <td>{benchmarkStatus(report, c)}</td>
                    <td>{c.offer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="font-display text-xl">Recommended next steps</h3>
            {report.recommendations.length ? (
              report.recommendations.map((c) => (
                <div key={c.id} className="border-t border-line py-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#FFE14A" }}>{c.effort}</p>
                  <h4 className="mt-1 font-display text-lg">{c.label}</h4>
                  <p className="text-sm text-muted">{c.action}</p>
                  <p className="text-xs text-faint">{c.offer}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">All applicable signals were detected. Next, test the full inquiry journey and review quality, accessibility, and measurement.</p>
            )}
          </div>
          <div>
            <h3 className="font-display text-xl">Additional opportunities to verify</h3>
            {report.offerings.map(([name, detail]) => (
              <p key={name} className="mt-2 text-sm text-muted">
                <strong className="text-fg">{name}.</strong> {detail}
              </p>
            ))}
          </div>
          <p className="text-xs text-muted">{report.methodology}</p>
          {report.benchmark.unavailable ? <p role="status" className="text-sm">The reference website was unavailable. Its results are not scored.</p> : null}
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={download} disabled={busy !== "off"}>
              {busy === "pdf" ? "Preparing PDF…" : "Download branded PDF"}
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact" search={{ need: "platform", source: "website-review", reportId: report.recordId, rid: report.recordId }}>
                Discuss these improvements
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
