import assert from "node:assert/strict";
import test from "node:test";
import { billedCostMicrodollars } from "./billing-math";

test("2x markup is the default", () => {
  assert.equal(billedCostMicrodollars(1000), 2000);
  assert.equal(billedCostMicrodollars(1), 2);
});

test("ceil keeps fractional microdollars from vanishing", () => {
  assert.equal(billedCostMicrodollars(3, 15000), 5);
});
