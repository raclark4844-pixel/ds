/** Integer microdollars, with markup applied exactly once. */
export const DEFAULT_MARKUP_BPS = 16000;
export const FIXED_MARKUP_BPS = 14000;
export const DEFAULT_RESERVE_MICRODOLLARS = 100000;
export function billedCostMicrodollars(
  rawCostMicrodollars: number,
  markupBps = DEFAULT_MARKUP_BPS,
) {
  if (!Number.isSafeInteger(rawCostMicrodollars) || rawCostMicrodollars < 0)
    throw new Error("Invalid integer cost.");
  if (!Number.isSafeInteger(markupBps) || markupBps < 10000 || markupBps > 20000)
    throw new Error("Invalid markup.");
  const amount = (BigInt(rawCostMicrodollars) * BigInt(markupBps) + 9999n) / 10000n;
  if (amount > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Cost exceeds supported bounds.");
  return Number(amount);
}
export function newYorkDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
