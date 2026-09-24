import test from "node:test";
import assert from "node:assert/strict";
import { billingFlags } from "./config";
test("Stripe remains disabled without explicit Stripe mode, even with old flags", () => {
  for (const mode of [undefined, "", "deferred", "internal", "true", "Stripe"]) {
    const flags = billingFlags({
      BILLING_MODE: mode,
      STRIPE_CHECKOUT_ENABLED: "true",
      STRIPE_WEBHOOK_ENABLED: "true",
      STRIPE_METER_WORKER_ENABLED: "true",
      TENANT_LEDGER_ENABLED: "true",
    });
    assert.deepEqual(flags, { ledger: true, checkout: false, webhook: false, worker: false });
  }
  assert.equal(
    billingFlags({ BILLING_MODE: "stripe", STRIPE_CHECKOUT_ENABLED: "true" }).checkout,
    true,
  );
});
