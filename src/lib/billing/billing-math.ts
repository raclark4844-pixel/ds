export const DEFAULT_MARKUP_BPS = 10000;
export const DEFAULT_RESERVE_MICRODOLLARS = 100000;

export function billedCostMicrodollars(rawCostMicrodollars: number, markupBps = DEFAULT_MARKUP_BPS) {
  const raw = Math.max(0, Math.floor(rawCostMicrodollars));
  const bps = markupBps > 0 ? markupBps : DEFAULT_MARKUP_BPS;
  return Math.ceil((raw * bps) / 10000);
}

export function newYorkDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
