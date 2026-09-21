export const RECORD_PATTERN = /^DTS-[A-Z0-9]{8}$/;
const RECORD_KEY = "dts-record-id";

export function isRecordId(value: unknown): value is string {
  return typeof value === "string" && RECORD_PATTERN.test(value.trim().toUpperCase());
}

export function normalizeRecordId(value: unknown) {
  if (typeof value !== "string") return "";
  const next = value.trim().toUpperCase();
  return RECORD_PATTERN.test(next) ? next : "";
}

export function mintRecordId() {
  const raw =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}${Math.random()}`;
  return `DTS-${raw.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function getRecordId(fromUrl?: string) {
  const incoming = normalizeRecordId(fromUrl);
  if (typeof window === "undefined") return incoming || mintRecordId();
  try {
    if (incoming) {
      localStorage.setItem(RECORD_KEY, incoming);
      return incoming;
    }
    const existing = normalizeRecordId(localStorage.getItem(RECORD_KEY) || "");
    if (existing) return existing;
    const id = mintRecordId();
    localStorage.setItem(RECORD_KEY, id);
    return id;
  } catch {
    return incoming || mintRecordId();
  }
}
