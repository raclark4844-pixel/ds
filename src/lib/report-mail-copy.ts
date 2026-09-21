import type { WebsiteReviewReport } from "./website-review/types.ts";

export const INTERNAL_TO = ["ryan@demoretechnologysolutions.com"];
export const INTERNAL_CC = ["ryan@demoreexteriorsolutions.com"];
export const DISCLAIMER = "Rankings, AI citations, and conversion lifts are not guaranteed.";
const sentCopies = new Set<string>();

export function mailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || "",
    from: process.env.REPORT_FROM_EMAIL || "projects@demorehomesolutions.com",
    internal: INTERNAL_TO,
    internalCc: INTERNAL_CC,
    site: process.env.NEXT_PUBLIC_SITE_URL || "https://www.demoretechnologysolutions.com",
  };
}

export function claimInternalCopy(id: string) {
  const key = id.trim().toUpperCase();
  if (!key || sentCopies.has(key)) return false;
  sentCopies.add(key);
  return true;
}

export function releaseInternalCopy(id: string) {
  sentCopies.delete(id.trim().toUpperCase());
}

export function websiteReviewCopySubject(report: WebsiteReviewReport) {
  return `New Website Review — ${hostFromUrl(report.current.url)} — ${report.recordId}`;
}

export function websiteReviewCopyText(report: WebsiteReviewReport) {
  const cfg = mailConfig();
  const missing = report.current.checks.filter((row) => row.status === "Not detected").map((row) => row.label);
  const detected = report.categories.reduce((sum, row) => sum + row.detected, 0);
  const total = report.categories.reduce((sum, row) => sum + row.total, 0);
  const recs = report.recommendations.slice(0, 8).map((row) => `- ${row.effort}: ${row.label} — ${row.action}`);
  const handoff = `${cfg.site}/contact?need=platform&source=website-review&rid=${encodeURIComponent(report.recordId)}`;
  return [
    "New website review PDF",
    `Record ID: ${report.recordId}`,
    `Reviewed URL: ${report.current.url}`,
    `Page title: ${report.current.title || "—"}`,
    `Reference: ${report.benchmark.unavailable ? "Unavailable" : report.benchmark.url}`,
    `Industry: ${report.industry.name}`,
    `Detected HTML signals: ${total ? `${detected}/${total}` : "Unavailable"}`,
    `Not detected: ${missing.length ? missing.join(", ") : "None"}`,
    "",
    "Recommendations",
    ...(recs.length ? recs : ["- None from this scan"]),
    "",
    `Discuss these improvements: ${handoff}`,
    "",
    DISCLAIMER,
  ].join("\n");
}

function hostFromUrl(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "") || "website";
  } catch {
    return "website";
  }
}
