import assert from "node:assert/strict";
import { test } from "node:test";
import { isPdfRevisionRequest, revisedReport } from "./revision.ts";
import type { WebsiteReviewReport } from "./types.ts";
test("recognizes explicit PDF edits without treating ordinary questions as edits", () => {
  assert.equal(isPdfRevisionRequest("Update my PDF to include catering"), true);
  assert.equal(isPdfRevisionRequest("What does SEO mean?"), false);
  assert.equal(isPdfRevisionRequest("How do I download the PDF?"), false);
});
test("revisions preserve scan findings and contact while adding versioned changes", () => {
  const original = {
    recordId: "DTS-12345678",
    assistantBrief: "Original scan",
    current: { url: "https://example.com" },
    contact: { name: "Ryan", email: "ryan@example.com" },
  } as WebsiteReviewReport;
  const second = revisedReport(original, "Include catering", "Add a catering inquiry page.");
  const third = revisedReport(second, "Add bookings", "Include catering and bookings.");
  assert.equal(original.revisions, undefined);
  assert.equal(second.current, original.current);
  assert.equal(second.contact, original.contact);
  assert.equal(third.revisions.length, 2);
  assert.equal(third.revisions[1].number, 3);
  assert.match(third.assistantBrief, /Include catering/);
  assert.throws(() =>
    revisedReport({ ...third, revisions: Array(10).fill(third.revisions[0]) }, "extra", "extra"),
  );
});
