export type UnifiedIds = {
  reportId: string;
  customerId: string;
  leadId: string;
  comparisonId: string;
};

/** reportId is canonical. Do not invent, shorten, or replace it. */
export function unifiedIds(reportId: string): UnifiedIds {
  const id = reportId.trim();
  return { reportId: id, customerId: id, leadId: id, comparisonId: id };
}

export function idsFromUnknown(value: unknown): UnifiedIds | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  const canonical = typeof rec.reportId === "string" && rec.reportId.trim()
    ? rec.reportId.trim()
    : typeof rec.reportNumber === "string" && rec.reportNumber.trim()
      ? rec.reportNumber.trim()
      : "";
  if (!canonical) return null;
  assertUnifiedPayload({ ...rec, reportId: canonical }, canonical);
  return unifiedIds(canonical);
}

export function assertUnifiedPayload(payload: Record<string, unknown>, reportId: string) {
  const expected = reportId.trim();
  if (!expected) throw new Error("reportId is required.");
  for (const key of ["reportId", "customerId", "leadId", "comparisonId"] as const) {
    const value = payload[key];
    if (value == null || value === "") continue;
    if (String(value).trim() !== expected) {
      throw new Error(`${key} must equal reportId.`);
    }
  }
}

export function crmHandoffPayload(reportId: string, extra: Record<string, unknown> = {}) {
  const ids = unifiedIds(reportId);
  assertUnifiedPayload({ ...extra, ...ids }, ids.reportId);
  return { ...extra, ...ids };
}
