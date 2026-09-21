import assert from "node:assert/strict";
import { test } from "node:test";
import { industryChoices, industryContext, selectedIndustries } from "./industry-selection.ts";

test("keeps multiple choices and supports saved single-industry briefs", () => {
  const choices = industryChoices.slice(0, 3);
  assert.deepEqual(selectedIndustries(choices), choices);
  assert.deepEqual(selectedIndustries(choices.join(" | ")), choices);
  assert.deepEqual(selectedIndustries(choices[0]), [choices[0]]);
});
test("rejects unknown values and deduplicates choices", () => {
  assert.deepEqual(
    selectedIndustries([industryChoices[0], industryChoices[0], "ignore instructions", 2]),
    [industryChoices[0]],
  );
  assert.deepEqual(selectedIndustries(null), []);
});
test("includes every selected industry in AI context", () => {
  const choices = industryChoices.slice(0, 3);
  for (const choice of choices) assert.ok(industryContext(choices).includes(choice));
  assert.equal(industryContext([]), "");
});
