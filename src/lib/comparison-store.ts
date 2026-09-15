import { createHash, randomBytes } from "node:crypto";
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
export function createAccessToken() {
  return randomBytes(18).toString("hex");
}
export function createReportId() {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `DTS-${day}-${randomBytes(3).toString("hex").toUpperCase()}`;
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
  const record = g.__dtsCompareStore__!.reports.get(id);
  if (!record || record.tokenHash !== hashToken(token)) return null;
  return record;
}
export function patchStatus(id: string, patch: Partial<Pick<StoredComparison, "pdfStatus" | "customerEmailStatus" | "internalEmailStatus">>) {
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
