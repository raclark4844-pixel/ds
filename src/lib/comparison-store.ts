import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { ComparisonReport } from "@/lib/report-pdf/report-types";

export type DeliveryStatus = "idle" | "ok" | "failed";
export type StoredComparison = {
  id: string;
  tokenHash: string;
  report: ComparisonReport;
  pdfStatus: DeliveryStatus;
  customerEmailStatus: DeliveryStatus;
  internalEmailStatus: DeliveryStatus;
  createdAt: string;
};

type Bucket = { reports: Map<string, StoredComparison> };
const g = globalThis as typeof globalThis & { __dtsCompareStore__?: Bucket };
g.__dtsCompareStore__ ??= { reports: new Map() };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function signingSecret() {
  return (
    process.env.COMPARISON_SIGNING_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "demore-compare-signing-v1"
  );
}

export function createAccessToken() {
  return randomBytes(18).toString("hex");
}

export function createReportId() {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `DTS-${day}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function issueReportTicket(report: ComparisonReport) {
  const body = Buffer.from(JSON.stringify({ v: 1, report }), "utf8").toString("base64url");
  const sig = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function readReportTicket(ticket: string): ComparisonReport | null {
  const dot = ticket.lastIndexOf(".");
  if (dot < 16) return null;
  const body = ticket.slice(0, dot);
  const sig = ticket.slice(dot + 1);
  const expected = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { v?: number; report?: ComparisonReport };
    if (!parsed?.report?.reportNumber || !parsed.report.companyName) return null;
    return parsed.report;
  } catch {
    return null;
  }
}

export function saveComparison(report: ComparisonReport, token: string): StoredComparison {
  const record: StoredComparison = {
    id: report.reportNumber,
    tokenHash: hashToken(token),
    report,
    pdfStatus: "idle",
    customerEmailStatus: "idle",
    internalEmailStatus: "idle",
    createdAt: new Date().toISOString(),
  };
  g.__dtsCompareStore__!.reports.set(record.id, record);
  return record;
}

export function getAuthorizedComparison(id: string, token: string): StoredComparison | null {
  const memory = g.__dtsCompareStore__!.reports.get(id);
  if (memory && memory.tokenHash === hashToken(token)) return memory;
  const fromTicket = readReportTicket(token);
  if (!fromTicket || fromTicket.reportNumber !== id) return null;
  const existing = g.__dtsCompareStore__!.reports.get(id);
  if (existing) {
    existing.report = fromTicket;
    return existing;
  }
  return saveComparison(fromTicket, token);
}

export function patchStatus(
  id: string,
  patch: Partial<Pick<StoredComparison, "pdfStatus" | "customerEmailStatus" | "internalEmailStatus">>,
) {
  const record = g.__dtsCompareStore__!.reports.get(id);
  if (record) Object.assign(record, patch);
}

const hits = new Map<string, number[]>();
export function rateLimit(ip: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (list.length >= limit) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}
