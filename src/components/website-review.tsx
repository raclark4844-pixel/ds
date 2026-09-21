import { registerReview, downloadReview, activeReview } from "@/lib/review-download";
import { ReviewContactFields } from "@/components/review-contact-fields";
import { useReviewContact } from "@/lib/use-review-contact";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { storeReportId, storeReviewBrief } from "@/lib/site-assistant-ids";
import { getRecordId } from "@/lib/website-review/record-id";
import type {
  IndustryCapability,
  ReviewCheck,
  ReviewStatus,
  WebsiteReviewReport,
} from "@/lib/website-review/types";

function statusClass(status: ReviewStatus | string) {
  if (status === "Detected") return "review-status review-status-detected";
  if (status === "Not detected") return "review-status review-status-missing";
  return "review-status review-status-na";
}

function Bar({
  value,
  total,
  tone,
  label,
}: {
  value: number;
  total: number;
  tone: "your" | "reference";
  label: string;
}) {
  const width = total ? Math.max(0, Math.min(100, (value / total) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span>{label}</span>
        <span className="font-medium tabular-nums text-fg">
          {total ? `${value}/${total}` : "Unavailable"}
        </span>
      </div>
      <div className="review-bar-track" aria-hidden="true">
        <div
          className={`review-bar-fill ${tone === "your" ? "bg-volt" : "bg-muted"}`}
          style={{ width: total ? `${width}%` : "0%" }}
        />
      </div>
    </div>
  );
}

function CheckDetail({ item }: { item: ReviewCheck }) {
  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={statusClass(item.status)}>{item.status}</span>
        <p className={`kicker ${item.effort === "Quick win" ? "text-volt" : "text-sun"}`}>
          {item.effort}
        </p>
      </div>
      <h4 className="mt-2 font-display text-lg">{item.label}</h4>
      <p className="mt-1 text-sm text-muted">{item.evidence}</p>
      <p className="mt-2 text-sm">
        <strong>Verify.</strong> {item.verify}
      </p>
      <p className="mt-1 text-sm">
        <strong>Proposed improvement.</strong> {item.improve}
      </p>
    </div>
  );
}

function CapabilityDetail({ item }: { item: IndustryCapability }) {
  return (
    <div className="py-4">
      <p className={`kicker ${item.effort === "Quick win" ? "text-volt" : "text-sun"}`}>
        {item.effort}
      </p>
      <h4 className="mt-1 font-display text-lg">{item.label}</h4>
      <p className="mt-1 text-sm text-muted">{item.why}</p>
      <p className="mt-2 text-sm">
        <strong>Verify.</strong> {item.verify}
      </p>
      <p className="mt-1 text-sm">
        <strong>Proposed improvement.</strong> {item.improve}
      </p>
    </div>
  );
}

function ReviewResult({ report, token }: { report: WebsiteReviewReport; token: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const measurement = report.current.checks.filter((item) => item.category === "Measurement");
  const visibility = report.current.checks.filter(
    (item) => item.category === "AI and search visibility",
  );

  async function download() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const current = activeReview();
      const file = await downloadReview(
        current?.recordId === report.recordId
          ? current
          : { recordId: report.recordId, token, brief: report.assistantBrief, revision: 1 },
      );
      const a = document.createElement("a");
      a.href = file.href;
      a.download = file.filename;
      a.click();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The PDF could not be created. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const contactHref = {
    to: "/contact" as const,
    search: {
      need: "platform",
      source: "website-review",
      rid: report.recordId,
      reportId: report.recordId,
    },
  };

  function askDemore() {
    window.dispatchEvent(
      new CustomEvent("demore:review-ready", {
        detail: { reportId: report.recordId, brief: report.assistantBrief, open: true },
      }),
    );
  }

  return (
    <section className="review-result mt-8 space-y-6" aria-label="Website review results">
      <div>
        <p className="kicker text-volt">Your website opportunity report</p>
        <h3 className="mt-2 font-display text-2xl font-semibold">{report.current.title}</h3>
        <p className="mt-1 break-all text-sm text-muted">{report.current.url}</p>
        {report.industry ? (
          <p className="mt-3 text-sm">
            <strong>Industry: {report.industry.name}</strong> · {report.industry.source}
            <span className="mt-1 block text-xs text-muted">{report.industry.evidence}</span>
          </p>
        ) : null}
        <p className="mt-3 text-sm text-muted">
          Compare observable website features with Demore Exterior Solutions and plan the next
          improvements.
        </p>
      </div>

      <div className="flex flex-wrap gap-5 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-volt" />
          Your page
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-muted" />
          Demore Exterior Solutions
        </span>
      </div>

      <div className="space-y-5">
        {report.categories.map((category) => {
          const refs = report.benchmark.checks.filter(
            (row) =>
              row.category === category.name &&
              row.status !== "Not applicable" &&
              row.status !== "Unavailable",
          );
          const count = refs.filter((row) => row.status === "Detected").length;
          const refTotal = report.benchmark.unavailable ? 0 : refs.length;
          return (
            <div key={category.name} className="space-y-2">
              <strong className="text-sm">{category.name}</strong>
              <Bar value={category.detected} total={category.total} tone="your" label="Your page" />
              <Bar
                value={count}
                total={refTotal}
                tone="reference"
                label="Demore Exterior Solutions"
              />
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted">
        Bars show detected HTML and public-file signals, not speed, rankings, or revenue. Missing
        signals need verification. Private Analytics and Search Console data were not opened.
      </p>
      {report.benchmark.unavailable ? (
        <p
          role="status"
          className="rounded-md border border-sun/40 bg-bg px-3 py-2 text-sm text-sun"
        >
          The reference website was unavailable. Its results are not scored.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="px-3 py-2 text-left text-xs font-medium text-muted">
            Current page compared with Demore Exterior Solutions
          </caption>
          <thead className="bg-bg text-muted">
            <tr>
              <th className="p-3 font-medium">Capability</th>
              <th className="font-medium">Your page</th>
              <th className="font-medium">Demore Exterior</th>
              <th className="pr-3 font-medium">Demore can help with</th>
            </tr>
          </thead>
          <tbody>
            {report.current.checks.map((item) => {
              const reference =
                report.benchmark.checks.find((row) => row.id === item.id)?.status || "Unavailable";
              return (
                <tr key={item.id} className="border-t border-line">
                  <th scope="row" className="p-3 font-medium text-fg">
                    {item.label}
                  </th>
                  <td className="py-3">
                    <span className={statusClass(item.status)}>{item.status}</span>
                  </td>
                  <td className="py-3">
                    <span className={statusClass(reference)}>{reference}</span>
                  </td>
                  <td className="pr-3 text-muted">{item.offer}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold">Measurement</h3>
        <p className="mt-2 text-sm text-muted">
          Google Analytics, Search Console, and conversion tracking are checked from public tags and
          files only. This does not log into those accounts.
        </p>
        <div className="mt-3 divide-y divide-line">
          {measurement.map((item) => (
            <CheckDetail key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold">AI and search visibility</h3>
        <p className="mt-2 text-sm text-muted">
          These signals help people and answer engines understand the business. AI citations are not
          guaranteed.
        </p>
        <div className="mt-3 divide-y divide-line">
          {visibility.map((item) => (
            <CheckDetail key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold">Industry-specific capabilities</h3>
        <p className="mt-2 text-sm text-muted">
          These are scoped opportunities for {report.industry.name.toLowerCase()}, not confirmed
          installations. They do not name third-party model vendors.
        </p>
        <div className="mt-3 divide-y divide-line">
          {(report.industry.capabilities || []).map((item) => (
            <CapabilityDetail key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold">Recommended next steps</h3>
        {report.recommendations.length ? (
          <div className="mt-3 divide-y divide-line">
            {report.recommendations.map((item) => (
              <div key={item.id} className="py-4">
                <p className={`kicker ${item.effort === "Quick win" ? "text-volt" : "text-sun"}`}>
                  {item.effort}
                </p>
                <h4 className="mt-1 font-display text-lg">{item.label}</h4>
                <p className="mt-1 text-sm text-muted">{item.action}</p>
                <p className="mt-2 text-sm">
                  <strong>Verify.</strong> {item.verify}
                </p>
                <p className="mt-1 text-sm">
                  <strong>Proposed improvement.</strong> {item.improve}
                </p>
                <p className="mt-1 text-xs text-faint">{item.offer}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            All applicable signals were detected. Next, test the full inquiry journey and review
            quality, accessibility, and measurement.
          </p>
        )}
      </div>

      <div>
        <h3 className="font-display text-xl font-semibold">
          Beyond the Exterior Solutions benchmark
        </h3>
        <p className="mt-2 text-sm text-muted">
          These Demore Technology Solutions recommendations are tailored to your industry, whether
          or not the reference site uses them. These are opportunities to scope, not confirmed
          installations or included deliverables.
        </p>
        <div className="mt-4 space-y-3">
          {report.offerings.map(([name, detail]) => (
            <p key={name} className="text-sm">
              <strong>{name}.</strong> {detail}
            </p>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">{report.methodology}</p>
      </div>

      <p className="text-sm text-muted">
        Record ID {report.recordId} — same number as Ask Demore and the project form.
      </p>
      <p className="text-xs text-muted">
        Rankings, AI citations, and conversion lifts are not guaranteed.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="volt" onClick={download} disabled={busy}>
          {busy ? "Preparing PDF…" : "Download branded PDF"}
        </Button>
        <Button type="button" variant="outline" onClick={askDemore}>
          Ask Demore about this review
        </Button>
        <Button asChild variant="primary">
          <Link to={contactHref.to} search={contactHref.search}>
            Discuss these improvements
          </Link>
        </Button>
      </div>
      {error ? (
        <p role="alert" className="rounded-md border border-hot/40 bg-hot-dim px-3 py-2 text-sm">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export function WebsiteReview() {
  const contactState = useReviewContact();
  const [industry, setIndustry] = useState("");
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<WebsiteReviewReport | null>(null);
  const [token, setToken] = useState("");
  const [recordId, setRecordId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = getRecordId(new URLSearchParams(window.location.search).get("rid") || "");
    setRecordId(id);
    storeReportId(id);
    const given = new URLSearchParams(window.location.search).get("url");
    if (given) setUrl(given);
    if (window.location.hash === "#website-review") {
      document
        .getElementById("website-review")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setReport(null);
    setError("");
    try {
      const res = await fetch("/api/website-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          industry,
          record_id: recordId || getRecordId(),
          contact: contactState.skipContact ? undefined : contactState.contact,
          skipContact: contactState.skipContact,
        }),
        signal: AbortSignal.timeout(28000),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Unable to complete the review.");
      const nextId = data.recordId || recordId;
      const brief = data.report?.assistantBrief || data.assistantBrief || "";
      setRecordId(nextId);
      storeReportId(nextId);
      storeReviewBrief(brief);
      window.dispatchEvent(
        new CustomEvent("demore:comparison-ready", { detail: { reportId: nextId } }),
      );
      window.dispatchEvent(
        new CustomEvent("demore:review-ready", { detail: { reportId: nextId, brief, open: true } }),
      );
      registerReview({ recordId: nextId, token: data.token, brief, revision: 1 });
      setToken(data.token);
      setReport(data.report);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setError(
        name === "TimeoutError"
          ? "The review timed out. Please try again."
          : err instanceof Error
            ? err.message
            : "Unable to complete the review.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="website-review" className="review-shell mt-16 scroll-mt-24">
      <p className="kicker text-volt">Ask Demore / Website Review</p>
      <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        See what your website could do next.
      </h2>
      <p className="mt-4 max-w-2xl text-muted">
        Enter a public website address for a side-by-side review, practical recommendations, and a
        professionally branded PDF.
      </p>
      {recordId ? <p className="review-chip mt-4">Record ID {recordId}</p> : null}
      <form onSubmit={submit} className="mt-8 space-y-4">
        <ReviewContactFields state={contactState} disabled={busy} />
        <label className="block text-sm font-medium" htmlFor="audit-industry">
          Industry, optional
          <input
            id="audit-industry"
            className="mt-1 min-h-12 w-full rounded-sm border border-line bg-bg px-3 text-base text-fg placeholder:text-faint"
            value={industry}
            onChange={(event) => setIndustry(event.target.value)}
            placeholder="e.g. restaurant, dental clinic, online retail"
            maxLength={120}
            disabled={busy}
            aria-describedby="industry-help"
          />
        </label>
        <p id="industry-help" className="text-xs text-muted">
          Leave blank to search your website for an industry suggestion. Enter or correct it here
          and run the review again.
        </p>
        <label className="block text-sm font-medium" htmlFor="audit-url">
          Public website address
          <div className="mt-1 flex flex-col gap-3 sm:flex-row">
            <input
              id="audit-url"
              className="min-h-12 min-w-0 flex-1 rounded-sm border border-line bg-bg px-3 text-base text-fg placeholder:text-faint"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="yourbusiness.com"
              required
              maxLength={2048}
              disabled={busy}
              autoComplete="url"
            />
            <Button type="submit" variant="volt" disabled={busy}>
              {busy ? "Reviewing website…" : "Review my website"}
            </Button>
          </div>
        </label>
      </form>
      {busy ? (
        <p role="status" className="mt-4 text-sm text-muted">
          Inspecting your page, public measurement files, and the Demore Exterior Solutions
          reference. This may take up to 25 seconds.
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-hot/40 bg-hot-dim px-3 py-2 text-sm"
        >
          {error}
        </p>
      ) : null}
      {report && token ? <ReviewResult report={report} token={token} /> : null}
    </section>
  );
}
