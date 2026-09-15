import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { ComparisonReport } from "@/lib/report-pdf/report-types";

const industries = [
  ["contractors", "Contractors & home services"],
  ["landscaping", "Landscaping & outdoor"],
  ["hospitality", "Hospitality"],
  ["service-companies", "Service companies"],
  ["stores-ecommerce", "Online stores"],
  ["professional-services", "Professional services"],
  ["other", "Other"],
];

export function ComparisonApp() {
  const [busy, setBusy] = useState<"off" | "analyze" | "pdf" | "email">("off");
  const [error, setError] = useState("");
  const [emailNote, setEmailNote] = useState("");
  const [reportId, setReportId] = useState("");
  const [token, setToken] = useState("");
  const [report, setReport] = useState<ComparisonReport | null>(null);

  async function analyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy !== "off") return;
    setError("");
    setEmailNote("");
    const form = new FormData(event.currentTarget);
    const competitors = String(form.get("competitors") || "").split(/\n|,/).map((s) => s.trim()).filter(Boolean).slice(0, 3);
    setBusy("analyze");
    try {
      const res = await fetch("/api/comparison-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.get("companyName"),
          website: form.get("website"),
          industry: form.get("industry"),
          market: form.get("market"),
          contactFirstName: form.get("contactFirstName"),
          contactLastName: form.get("contactLastName"),
          contactPhone: form.get("contactPhone"),
          contactEmail: form.get("contactEmail"),
          timeframe: form.get("timeframe"),
          competitors,
          confirmedTools: form.get("confirmedTools"),
          access: form.get("access"),
          domainRegistrar: form.get("domainRegistrar"),
          websiteHost: form.get("websiteHost"),
          siteBuilder: form.get("siteBuilder"),
          codeAccess: form.get("codeAccess"),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Comparison failed.");
      setReportId(data.reportId);
      setToken(data.token);
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setBusy("off");
    }
  }

  async function downloadPdf() {
    if (!reportId || !token || busy !== "off") return;
    setBusy("pdf");
    setError("");
    try {
      const res = await fetch("/api/comparison-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, token, email: true }),
      });
      const type = res.headers.get("content-type") || "";
      if (!res.ok || !type.includes("application/pdf")) {
        let message = "PDF generation failed. Retry — the comparison is still saved.";
        try { const data = await res.json(); if (data.error) message = data.error; } catch {}
        throw new Error(message);
      }
      const blob = await res.blob();
      const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer());
      if (String.fromCharCode(...head) !== "%PDF-") throw new Error("Server did not return a PDF file.");
      const name = res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1]
        || `demore-website-comparison-${(report?.companyName || "company").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setEmailNote("PDF downloaded. Emails are marked sent only if Resend accepted them.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF download failed.");
    } finally {
      setBusy("off");
    }
  }

  async function retryEmail() {
    if (!reportId || !token || busy !== "off") return;
    setBusy("email");
    setError("");
    try {
      const res = await fetch("/api/comparison-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, token, target: "both" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email retry failed.");
      setEmailNote(`${data.customerEmail ? "Customer email sent." : "Customer email not sent."} ${data.internalEmail ? "Internal email sent." : "Internal email not sent."}`);
      if (!data.customerEmail && !data.internalEmail) setError(data.customerError || data.internalError || "Email was not accepted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email retry failed.");
    } finally {
      setBusy("off");
    }
  }

  return (
    <div className="mt-10 space-y-8">
      <form onSubmit={analyze} className="space-y-4 rounded-xl border border-line bg-surface p-5">
        <p className="kicker">Intake</p>
        <h2 className="font-display text-2xl">Tell us the site to compare.</h2>
        <label className="block text-sm">Company<input required name="companyName" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
        <label className="block text-sm">Website<input required name="website" placeholder="https://" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
        <label className="block text-sm">Industry<select required name="industry" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2">{industries.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label className="block text-sm">Market analyzed<input required name="market" placeholder="County, metro, or nationwide" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm">First name<input required name="contactFirstName" autoComplete="given-name" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label><label className="block text-sm">Last name<input required name="contactLastName" autoComplete="family-name" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label></div>
        <label className="block text-sm">Phone number<input required type="tel" name="contactPhone" autoComplete="tel" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
        <label className="block text-sm">Email<input required type="email" name="contactEmail" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
        <label className="block text-sm">Desired implementation timeframe<select required name="timeframe" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2"><option value="">Select a timeframe</option><option value="As soon as possible">As soon as possible</option><option value="Within 30 days">Within 30 days</option><option value="Within 60 days">Within 60 days</option><option value="Within 90 days">Within 90 days</option><option value="More than 90 days">More than 90 days</option><option value="Researching options">Researching options</option></select></label>
        <label className="block text-sm">Backup competitor websites, optional<span className="mt-1 block text-xs text-muted">Used only if live Google discovery is unavailable.</span><textarea name="competitors" rows={3} className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
        <label className="block text-sm">Tools you already use, optional<input name="confirmedTools" placeholder="Toast, Shopify, HubSpot, Mailchimp…" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
        <fieldset className="space-y-4 rounded-lg border border-line p-4">
          <legend className="px-2 font-display text-lg">Ownership &amp; access <span className="font-sans text-xs text-muted">optional</span></legend>
          <p className="text-sm text-muted">More detail improves the enhance-versus-rebuild recommendation. Do not enter passwords, API keys or login links.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">Domain registrar<input name="domainRegistrar" list="registrar-options" placeholder="GoDaddy, Namecheap, Cloudflare, not sure…" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
            <label className="block text-sm">Website host or platform<input name="websiteHost" list="host-options" placeholder="Vercel, Wix, Squarespace, Shopify, not sure…" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
            <label className="block text-sm">Who created or maintains it?<input name="siteBuilder" placeholder="Agency, freelancer, employee, platform vendor, not sure…" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2" /></label>
            <label className="block text-sm">Source-code access<select name="codeAccess" defaultValue="" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2"><option value="">Not provided</option><option value="full-source">Full source/repository access</option><option value="cms-admin">CMS or site-builder access only</option><option value="vendor-managed">Vendor manages it; source access unknown</option><option value="no-source">No source-code access</option><option value="unknown">Not sure</option></select></label>
          </div>
          <label className="block text-sm">Overall account access<select name="access" defaultValue="" className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2"><option value="">Not provided</option><option value="owner-controls">We control the domain and website accounts</option><option value="shared-controls">We share access with a provider</option><option value="provider-controls">A provider controls the website</option><option value="needs-recovery">Access is unclear or needs recovery</option></select></label>
          <datalist id="registrar-options"><option value="GoDaddy" /><option value="Namecheap" /><option value="Cloudflare" /><option value="Squarespace Domains" /><option value="Network Solutions" /></datalist>
          <datalist id="host-options"><option value="GoDaddy" /><option value="Vercel" /><option value="Netlify" /><option value="Cloudflare" /><option value="WordPress" /><option value="Wix" /><option value="Squarespace" /><option value="Shopify" /><option value="Toast" /></datalist>
        </fieldset>
        <Button type="submit" disabled={busy !== "off"}>{busy === "analyze" ? "Scoring public pages…" : "Run comparison"}</Button>
      </form>
      {error ? <p className="rounded-md border border-hot/40 bg-hot-dim px-3 py-2 text-sm">{error}</p> : null}
      {emailNote ? <p className="text-sm text-muted">{emailNote}</p> : null}
      {report ? (
        <section className="space-y-4 rounded-xl border border-line bg-surface p-5">
          <p className="kicker">Result {report.reportNumber}</p>
          <h2 className="font-display text-2xl">{report.companyName}</h2>
          <p className="text-muted">{report.summary.current}</p>
          <div className="grid gap-3 sm:grid-cols-4">{[["Current", report.currentTotal],["Competitor avg", report.competitorAverage],["Leader", report.marketLeader],["Potential", report.potential]].map(([label, value]) => (<div key={String(label)} className="rounded-md border border-line p-3"><p className="kicker">{label}</p><p className="font-display text-3xl text-volt">{value}</p></div>))}</div>
          <div className="overflow-x-auto rounded-md border border-line"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-bg text-muted"><tr><th className="p-3">Competitor / benchmark</th><th>Source</th><th>Maps</th><th>Organic</th><th>Rating</th><th>Site score</th></tr></thead><tbody>{report.competitors.map((row) => <tr key={`${row.name}-${row.website}`} className="border-t border-line"><td className="p-3 font-medium">{row.name}</td><td>{row.source || row.evidence}</td><td>{row.mapsRank ? `#${row.mapsRank}` : "—"}</td><td>{row.organicRank ? `#${row.organicRank}` : "—"}</td><td>{row.rating ? `${row.rating}/5 (${row.reviewCount ?? 0})` : "—"}</td><td>{row.total}</td></tr>)}</tbody></table></div>
          <p className="text-sm text-muted">{report.competitorSelection}</p>
          {report.accessComparison ? (
            <div className="space-y-4 rounded-lg border border-line bg-bg p-4">
              <div>
                <p className="kicker">Delivery path</p>
                <h3 className="font-display text-xl">Enhance the current site or rebuild?</h3>
                <p className="mt-1 text-sm text-muted">{report.accessComparison.explanation}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-line p-3"><div className="flex justify-between text-sm"><span>Enhance current site</span><strong>{report.accessComparison.enhanceFit}/100</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full bg-volt" style={{ width: `${report.accessComparison.enhanceFit}%` }} /></div></div>
                <div className="rounded-md border border-line p-3"><div className="flex justify-between text-sm"><span>Strategic rebuild</span><strong>{report.accessComparison.rebuildFit}/100</strong></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-surface"><div className="h-full bg-sun" style={{ width: `${report.accessComparison.rebuildFit}%` }} /></div></div>
              </div>
              <div className="overflow-x-auto rounded-md border border-line"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-surface text-muted"><tr><th className="p-3">Decision factor</th><th>Enhance current site</th><th>Strategic rebuild</th><th>Business advantage</th></tr></thead><tbody>{report.accessComparison.rows.map((row) => <tr key={row.factor} className="border-t border-line"><td className="p-3 font-medium">{row.factor}</td><td className="pr-3">{row.enhanceCurrent}</td><td className="pr-3">{row.rebuild}</td><td className="pr-3">{row.advantage}</td></tr>)}</tbody></table></div>
              <div><h3 className="font-display text-lg">Bot and automation opportunities</h3><div className="mt-2 grid gap-2 sm:grid-cols-2">{report.accessComparison.botOpportunities.map((bot) => <div key={bot.name} className="rounded-md border border-line p-3"><p className="font-medium">{bot.name}</p><p className="mt-1 text-sm text-muted">{bot.businessValue}</p></div>)}</div></div>
            </div>
          ) : null}
          <p>Recommended path: <strong>{report.path}</strong>. Confidence {report.confidence}%. Rankings and lifts are not guaranteed.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={downloadPdf} disabled={busy !== "off"}>{busy === "pdf" ? "Generating PDF…" : "Download My Comparison Report"}</Button>
            <Button type="button" variant="outline" onClick={retryEmail} disabled={busy !== "off"}>{busy === "email" ? "Retrying email…" : "Retry email delivery"}</Button>
            <Button asChild variant="outline"><Link to="/contact" search={{ need: "platform" }}>Start a project</Link></Button>
            <Button type="button" variant="outline" onClick={() => window.print()}>Print this page</Button>
          </div>
          <p className="text-xs text-faint">Download My Comparison Report requests a real application/pdf file from the server. It does not open the print dialog. Print this page is a separate browser print option.</p>
        </section>
      ) : null}
    </div>
  );
}
