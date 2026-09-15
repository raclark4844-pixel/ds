import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertUnifiedPayload, crmHandoffPayload, unifiedIds } from "./unified-ids.ts";
import { signOauthState, readOauthState } from "./oauth-state.ts";

describe("unified reportId", () => {
  it("keeps compatibility IDs equal to reportId", () => {
    const ids = unifiedIds("DTS-20260915-ABC123");
    assert.equal(ids.reportId, "DTS-20260915-ABC123");
    assert.equal(ids.customerId, ids.reportId);
    assert.equal(ids.leadId, ids.reportId);
    assert.equal(ids.comparisonId, ids.reportId);
  });

  it("rejects a CRM payload when IDs differ", () => {
    assert.throws(() => assertUnifiedPayload({ reportId: "A", customerId: "B" }, "A"));
  });

  it("builds a CRM payload that retains reportId", () => {
    const payload = crmHandoffPayload("DTS-1", { companyName: "Acme" });
    assert.equal(payload.reportId, "DTS-1");
    assert.equal(payload.customerId, "DTS-1");
    assert.equal(payload.leadId, "DTS-1");
    assert.equal(payload.comparisonId, "DTS-1");
  });

  it("does not let OAuth state change reportId", () => {
    const state = signOauthState("DTS-KEEP");
    const parsed = readOauthState(state);
    assert.equal(parsed?.reportId, "DTS-KEEP");
    const [payload] = state.split(".");
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    decoded.reportId = "DTS-OTHER";
    const tampered = `${Buffer.from(JSON.stringify(decoded)).toString("base64url")}.${state.split(".")[1]}`;
    assert.equal(readOauthState(tampered), null);
  });
});
