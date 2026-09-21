import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { analyzePage, categoryScores, unavailableBenchmark } from "./analyze.ts";
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
    const search = categoryScores(page.checks).find((row) => row.name === "Search foundations");
    assert.equal(search?.detected, 3);
    assert.equal(search?.total, 3);
  });

  it("does not invent reference scores when the benchmark is unavailable", () => {
    const missing = unavailableBenchmark("https://demoreexteriorsolutions.com/");
    assert.equal(missing.unavailable, true);
    assert.ok(missing.checks.every((item) => item.status === "Unavailable"));
    const scores = categoryScores(missing.checks);
    assert.ok(scores.every((row) => row.detected === 0 && row.total === 0));
  });
});
