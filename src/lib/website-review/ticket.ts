import { createHmac, timingSafeEqual } from "node:crypto";
import type { WebsiteReviewReport } from "./types.ts";

function signingSecret() {
  return process.env.COMPARISON_SIGNING_SECRET || process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "demore-compare-signing-v1";
}

export function issueReviewTicket(report: WebsiteReviewReport) {
  const body = Buffer.from(JSON.stringify({ v: 1, report }), "utf8").toString("base64url");
  const sig = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readReviewTicket(ticket: string): WebsiteReviewReport | null {
  const dot = ticket.lastIndexOf(".");
  if (dot < 16) return null;
  const body = ticket.slice(0, dot);
  const expected = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  const actual = Buffer.from(ticket.slice(dot + 1));
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { report?: WebsiteReviewReport };
    const report = parsed?.report;
    if (!report?.recordId || !report.current?.url || !Array.isArray(report.current.checks)) return null;
    return report;
  } catch {
    return null;
  }
}
