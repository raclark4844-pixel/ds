import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  claimInternalCopy,
  mailConfig,
  releaseInternalCopy,
  websiteReviewCopySubject,
  websiteReviewCopyText,
} from "./report-mail-copy.ts";
import type { WebsiteReviewReport } from "./website-review/types.ts";

function sampleReport(): WebsiteReviewReport {
  return {
    version: 2,
    recordId: "DTS-41F6B18F",
    createdAt: "2026-09-20T00:00:00.000Z",
    current: {
      url: "https://example.com/",
      title: "Example Landscaping",
      checks: [
        { id: "title", category: "Search foundations", label: "Page title", offer: "SEO", action: "Write a title.", effort: "Quick win", status: "Detected", evidence: "Example Landscaping" },
        { id: "form", category: "Lead capture", label: "On-page inquiry form", offer: "Intake", action: "Add a short form.", effort: "Build next", status: "Not detected", evidence: "" },
      ],
    },
    benchmark: { url: "https://demoreexteriorsolutions.com/", title: "Demore Exterior Solutions", checks: [] },
    industry: {
      id: "landscaping",
      name: "Landscaping",
      source: "copy",
      evidence: "lawn",
      journey: "",
      conversion: "",
      measure: "",
      sources: [],
    },
    categories: [{ name: "Search foundations", detected: 1, total: 1 }, { name: "Lead capture", detected: 0, total: 1 }],
    recommendations: [
      { id: "form", category: "Lead capture", label: "On-page inquiry form", offer: "Intake", action: "Add a short form.", effort: "Build next", status: "Not detected", evidence: "" },
    ],
    offerings: [["AI qualification", "Route qualified inquiries"]],
    methodology: "Public HTML signals only.",
  };
}

describe("internal PDF copy", () => {
  afterEach(() => {
    releaseInternalCopy("DTS-41F6B18F");
  });

  it("addresses the shop inbox and keeps the Cc out of the body", () => {
    const report = sampleReport();
    const text = websiteReviewCopyText(report);
    const subject = websiteReviewCopySubject(report);
    assert.equal(mailConfig().internal[0], "ryan@demoretechnologysolutions.com");
    assert.match(subject, /DTS-41F6B18F/);
    assert.match(text, /Record ID: DTS-41F6B18F/);
    assert.match(text, /https:\/\/example\.com\//);
    assert.match(text, /Rankings, AI citations, and conversion lifts are not guaranteed/);
    assert.match(text, /source=website-review&rid=DTS-41F6B18F/);
    assert.doesNotMatch(text, /ryan@demoreexteriorsolutions\.com/);
    assert.doesNotMatch(text, /password/i);
    assert.doesNotMatch(text, /\$\d/);
    assert.doesNotMatch(text, /guaranteed ranking/i);
  });

  it("claims a record id once so re-downloads do not spam", () => {
    assert.equal(claimInternalCopy("DTS-41F6B18F"), true);
    assert.equal(claimInternalCopy("dts-41f6b18f"), false);
    releaseInternalCopy("DTS-41F6B18F");
    assert.equal(claimInternalCopy("DTS-41F6B18F"), true);
  });
});
