export const RECORD_PATTERN = /^DTS-[A-Z0-9]{8}$/;

export function normalizeRecordId(value: unknown) {
  if (typeof value !== "string") return "";
  const next = value.trim().toUpperCase();
  return RECORD_PATTERN.test(next) ? next : "";
}

export function mintRecordId() {
  const raw = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}${Math.random()}`;
  return `DTS-${raw.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
