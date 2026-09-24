import assert from "node:assert/strict";
import test from "node:test";
import {
  billedCostMicrodollars,
  DEFAULT_MARKUP_BPS,
  FIXED_MARKUP_BPS,
  newYorkDay,
} from "./billing-math";
test("approved usage markup is 1.6x; internal and fixed rates are explicit", () => {
  assert.equal(DEFAULT_MARKUP_BPS, 16000);
  for (const [cost, rate, result] of [
    [1000, 16000, 1600],
    [70000, 16000, 112000],
    [1000, 10000, 1000],
    [1000, FIXED_MARKUP_BPS, 1400],
    [3, 15000, 5],
    [70000, 20000, 140000],
  ])
    assert.equal(billedCostMicrodollars(cost, rate), result);
  assert.equal(billedCostMicrodollars(1), 2);
});
test("invalid costs and unsafe results fail instead of silently becoming free", () => {
  for (const cost of [NaN, Infinity, -1, 0.5, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => billedCostMicrodollars(cost));
  for (const rate of [NaN, Infinity, 0, -1, 20001, 10000.5])
    assert.throws(() => billedCostMicrodollars(1, rate));
  assert.throws(() => billedCostMicrodollars(Number.MAX_SAFE_INTEGER, 20000));
});
test("existing New York business day is preserved at midnight and DST boundaries", () => {
  assert.equal(newYorkDay(new Date("2026-09-24T03:59:59Z")), "2026-09-23");
  assert.equal(newYorkDay(new Date("2026-09-24T04:00:00Z")), "2026-09-24");
  assert.equal(newYorkDay(new Date("2026-11-01T06:30:00Z")), "2026-11-01");
});
