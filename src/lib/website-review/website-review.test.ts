import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzePage, categoryScores, looksLikeLlms, looksLikeRobots, looksLikeSitemap, makeReport, unavailableBenchmark } from "./analyze.ts";
import { resolveIndustry } from "./industry.ts";
import { isPublicUnicast } from "./public-ip.ts";
import { mintRecordId, normalizeRecordId } from "./record-id.ts";
import { normalizeWebsite } from "./url.ts";

describe("website review safety", () => {
  it("rejects private, loopback, and link-local addresses", () => {
    assert.equal(isPublicUnicast("127.0.0.1"), false);
    assert.equal(isPublicUnicast("10.0.0.4"), false);
    assert.equal(isPublicUnicast("192.168.1.9"), false);
    assert.equal(isPublicUnicast("169.254.1.1"), false);
    assert.equal(isPublicUnicast("172.16.0.1"), false);
    assert.equal(isPublicUnicast("100.64.1.1"), false);
    assert.equal(isPublicUnicast("::1"), false);
    assert.equal(isPublicUnicast("fc00::1"), false);
    assert.equal(isPublicUnicast("fe80::1"), false);
    assert.equal(isPublicUnicast("::ffff:127.0.0.1"), false);
  });

  it("accepts public unicast addresses", () => {
    assert.equal(isPublicUnicast("8.8.8.8"), true);
    assert.equal(isPublicUnicast("1.1.1.1"), true);
    assert.equal(isPublicUnicast("2606:4700:4700::1111"), true);
  });

  it("rejects credentials, custom ports, and local hostnames", () => {
    assert.throws(() => normalizeWebsite("http://user:pass@example.com"));
    assert.throws(() => normalizeWebsite("https://example.com:8443"));
    assert.throws(() => normalizeWebsite("localhost"));
    assert.equal(normalizeWebsite("example.com"), "https://example.com/");
  });

  it("mints DTS-XXXXXXXX record ids", () => {
    const id = mintRecordId();
    assert.match(id, /^DTS-[A-Z0-9]{8}$/);
    assert.equal(normalizeRecordId("dts-abcd1234"), "DTS-ABCD1234");
    assert.equal(normalizeRecordId("DTS-20260920-ABC123"), "");
  });
});

describe("website review html scan", () => {
  it("marks detected, not detected, and not applicable without inventing scores", () => {
    const page = analyzePage({
      url: "https://example.com/",
      html: `<!doctype html><html><head><title>Example Landscaping</title><meta name="description" content="Lawn care"><meta name="viewport" content="width=device-width"><script type="application/ld+json">{"@type":"LocalBusiness"}</script></head><body><h1>Lawn care</h1><nav><a href="/services">Services</a><a href="mailto:hi@example.com">Email</a></nav><a href="/contact">Contact</a><button>Request estimate</button><p>Frequently asked questions</p></body></html>`,
    });
    const byId = Object.fromEntries(page.checks.map((item) => [item.id, item.status]));
    assert.equal(byId.title, "Detected");
    assert.equal(byId.description, "Detected");
    assert.equal(byId.h1, "Detected");
    assert.equal(byId.viewport, "Detected");
    assert.equal(byId.https, "Detected");
    assert.equal(byId.alt, "Not applicable");
    assert.equal(byId.contact, "Detected");
    assert.equal(byId.form, "Not detected");
    assert.equal(byId.cta, "Detected");
    assert.equal(byId.schema, "Detected");
    assert.equal(byId.faq, "Detected");
    assert.equal(byId.services, "Detected");
    assert.equal(byId.ga, "Not detected");
    assert.equal(byId.gsc, "Not detected");
    assert.equal(byId.conversion, "Not detected");
    const search = categoryScores(page.checks).find((row) => row.name === "Search foundations");
    assert.equal(search?.detected, 3);
    assert.equal(search?.total, 3);
  });

  it("detects Google Analytics, Search Console verification, and conversion signals", () => {
    const page = analyzePage({
      url: "https://example.com/",
      html: `<!doctype html><html><head><title>Shop</title><meta name="google-site-verification" content="abc"><script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script><script>gtag('event','generate_lead');</script></head><body><h1>Shop</h1></body></html>`,
      extras: {
        robots: "User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml\n",
        sitemap: `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/</loc></url></urlset>`,
        llms: "# Example Shop\nWe sell outdoor goods. Contact via the website form.\nServices: lawn care, hardscape.",
      },
    });
    const byId = Object.fromEntries(page.checks.map((item) => [item.id, item.status]));
    assert.equal(byId.ga, "Detected");
    assert.equal(byId.gsc, "Detected");
    assert.equal(byId.conversion, "Detected");
    assert.equal(byId.robots, "Detected");
    assert.equal(byId.sitemap, "Detected");
    assert.equal(byId.llms, "Detected");
    assert.ok(page.checks.every((item) => item.verify && item.improve));
  });

  it("does not invent reference scores when the benchmark is unavailable", () => {
    const missing = unavailableBenchmark("https://demoreexteriorsolutions.com/");
    assert.equal(missing.unavailable, true);
    assert.ok(missing.checks.every((item) => item.status === "Unavailable"));
    const scores = categoryScores(missing.checks);
    assert.ok(scores.every((row) => row.detected === 0 && row.total === 0));
  });
});

describe("website review report v3", () => {
  it("builds a version 3 report with industry capabilities and an Ask Demore brief", () => {
    const current = analyzePage({
      url: "https://example.com/",
      html: `<!doctype html><html><head><title>Example Landscaping</title></head><body><h1>Lawn care</h1></body></html>`,
    });
    const industry = resolveIndustry("landscaping", []);
    const report = makeReport(current, unavailableBenchmark("https://demoreexteriorsolutions.com/"), "DTS-41F6B18F", industry);
    assert.equal(report.version, 3);
    assert.ok(report.industry.capabilities.length >= 3);
    assert.match(report.assistantBrief, /DTS-41F6B18F/);
    assert.match(report.assistantBrief, /Google Analytics|Search Console|conversion/i);
    assert.doesNotMatch(report.assistantBrief, /ChatGPT|Claude|Gemini|OpenAI/i);
    assert.doesNotMatch(JSON.stringify(report.industry.capabilities), /ChatGPT|Claude|Gemini|OpenAI/i);
    assert.doesNotMatch(JSON.stringify(report.offerings), /ChatGPT|Claude|Gemini|OpenAI/i);
    assert.ok(report.offerings.some(([name]) => /Measurement/i.test(name)));
    assert.ok(report.current.checks.some((item) => item.category === "Measurement"));
    assert.ok(report.current.checks.some((item) => item.category === "AI and search visibility"));
  });

  it("sniffs robots, sitemap, and llms files without treating HTML 404 pages as detected", () => {
    assert.equal(looksLikeRobots("User-agent: *\nDisallow:"), true);
    assert.equal(looksLikeRobots("<!doctype html><html>404</html>"), false);
    assert.equal(looksLikeSitemap("<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'></urlset>"), true);
    assert.equal(looksLikeLlms("# Business\nWe install roofs in Lake County and take estimate requests on this website."), true);
    assert.equal(looksLikeLlms("<html>not found</html>"), false);
  });
});
