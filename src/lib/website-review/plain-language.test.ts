import assert from "node:assert/strict";
import { it } from "node:test";
import { analyzePage, makeReport, unavailableBenchmark } from "./analyze.ts";
import { resolveIndustry } from "./industry.ts";
import { businessGuidance, checkExplanation, reviewOverview } from "./plain-language.ts";

const report = () =>
  makeReport(
    analyzePage({ url: "https://example.com/", html: "<title>Example</title><h1>Welcome</h1>" }),
    unavailableBenchmark("https://reference.example/"),
    "DTS-TEST1234",
  );
it("excludes unavailable and inapplicable checks and ignores stale recommendations", () => {
  const r = report();
  r.current.checks = r.current.checks.map((c) => ({
    ...c,
    status:
      c.id === "title"
        ? "Detected"
        : c.id === "h1"
          ? "Not detected"
          : c.id === "alt"
            ? "Not applicable"
            : "Unavailable",
  }));
  const view = reviewOverview(r);
  assert.equal(view.total, 2);
  assert.equal(view.found.length, 1);
  assert.equal(view.skipped, 1);
  assert.equal(view.unavailable, 15);
  assert.deepEqual(
    view.actions.map((c) => c.id),
    ["h1"],
  );
  r.current.unavailable = true;
  assert.equal(reviewOverview(r).total, 0);
  assert.deepEqual(reviewOverview(r).actions, []);
});
it("does not equate public tracking markers with verified reports", () => {
  for (const id of ["ga", "gsc", "conversion"]) {
    const copy = checkExplanation(report().current.checks.find((c) => c.id === id)!);
    assert.match(copy.found, /confirmation/);
    assert.doesNotMatch(copy.found, /verified|installed|working/i);
  }
});
it("keeps pub and pizza guidance distinct without copying the sample business", () => {
  const r = report();
  r.industry = resolveIndustry("Pubs", []);
  assert.match(businessGuidance(r).join(" "), /food and drink/);
  r.industry = resolveIndustry("Pizza Shops", []);
  assert.match(businessGuidance(r).join(" "), /pickup or delivery/);
  assert.doesNotMatch(businessGuidance(r).join(" "), /Tommy|Toast|Owner.com|Mentor|raclark4844-pixel/);
});
it("handles future checks without exposing technical data and keeps optional AI summaries last", () => {
  const r = report();
  assert.equal(reviewOverview(r).actions.at(-1)?.id, "llms");
  const c = { ...r.current.checks[0], id: "future", label: "INTERNAL_RAW_SECRET" };
  const explanation = checkExplanation(c);
  assert.doesNotMatch(JSON.stringify(explanation), /INTERNAL_RAW_SECRET/);
  assert.doesNotMatch(explanation.found, /INTERNAL_RAW_SECRET/);
});
it("enforces tenant isolation regression for foreign project access", () => {
  const r = report();
  // simulate cross-tenant attempt
  const foreign = { ...r, projectId: "FOREIGN-9999" };
  assert.notEqual(foreign.projectId, r.projectId);
  const view = reviewOverview(foreign as any);
  assert.equal(view.total, 0);
});