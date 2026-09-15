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
  const id = [rec.reportId, rec.customerId, rec.leadId, rec.comparisonId, rec.reportNumber]
    .find((item): item is string => typeof item === "string" && item.trim().length > 0);
  return id ? unifiedIds(id) : null;
}
