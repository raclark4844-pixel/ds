import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { authenticateCallback } from "./callback";
test("Base44 signatures bind integration to tenant and reject tampering, stale timestamps and unknown properties", () => {
  const secret = "synthetic-secret-not-used-by-any-service",
    timestamp = String(Math.floor(Date.now() / 1000));
  const config = JSON.stringify({ test: { orgId: "a", secret } });
  const body = JSON.stringify({
    envelope: {
      version: "1",
      requestId: randomUUID(),
      orgId: "a",
      actorId: "model-actor-is-ignored",
      workflow: "chatSupport",
      issuedAt: new Date().toISOString(),
    },
    leadId: "lead-a",
    input: {
      documents: [{ sourceId: "faq", page: 1, text: "Contact our team." }],
      approvedCatalog: [],
      messages: [{ role: "visitor", text: "I need a person." }],
    },
    output: {
      answer: "I can help request a person.",
      catalogIds: [],
      citations: [],
      escalation: {
        requested: true,
        reason: "human_requested",
        summary: "Visitor requested a person.",
      },
    },
  });
  const headers = new Headers({
    "x-dts-integration": "test",
    "x-dts-timestamp": timestamp,
    "x-dts-signature": createHmac("sha256", secret)
      .update(timestamp + "." + body)
      .digest("hex"),
  });
  assert.equal(authenticateCallback(headers, body, config).actorId, "base44:test");
  assert.throws(() => authenticateCallback(headers, body + " ", config), /signature/);
  assert.throws(
    () => authenticateCallback(headers, body, config, Date.now() + 360000),
    /signature/,
  );
  assert.throws(
    () => authenticateCallback(headers, body, JSON.stringify({ test: { orgId: "b", secret } })),
    /scope/,
  );
});
