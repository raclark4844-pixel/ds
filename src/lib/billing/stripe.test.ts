import test from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { stripeClient, boundedStripeBody, billingOrigin } from "./stripe";
import { billingFlags } from "./config";
import { meterFailureState } from "./meter-worker";
test("permanent Stripe failures require reconciliation; transient failures retain stable retry identity", () => {
  for (const statusCode of [400, 401, 403, 404, 422])
    assert.equal(meterFailureState({ statusCode }), "RECONCILE");
  for (const statusCode of [408, 409, 429, 500, 503])
    assert.equal(meterFailureState({ statusCode }), "READY");
  assert.equal(meterFailureState(new Error("network timeout")), "READY");
  assert.equal(meterFailureState({ type: "StripeIdempotencyError", statusCode: 409 }), "RECONCILE");
});
test("billing configuration fails closed, live keys require explicit enablement", () => {
  assert.deepEqual(billingFlags({}), {
    ledger: false,
    checkout: false,
    webhook: false,
    worker: false,
  });
  assert.throws(() => stripeClient({ STRIPE_SECRET_KEY: "sk_live_synthetic" }));
  assert.throws(() => billingOrigin("http://example.com"));
  assert.throws(() => billingOrigin("https://example.com/path"));
  assert.equal(billingOrigin("https://example.com"), "https://example.com");
});
test("official Stripe signature verification rejects tampering and expired signatures", async () => {
  const stripe = new Stripe("sk_test_synthetic"),
    secret = "whsec_synthetic";
  const payload = JSON.stringify({
    id: "evt_synthetic",
    type: "invoice.paid",
    livemode: false,
    data: { object: { customer: "cus_test" } },
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  const raw = await boundedStripeBody(
    new Request("https://example.com", { method: "POST", body: payload }),
  );
  assert.equal(stripe.webhooks.constructEvent(raw, signature, secret).id, "evt_synthetic");
  assert.throws(() => stripe.webhooks.constructEvent(raw + " ", signature, secret));
  assert.throws(() =>
    stripe.webhooks.constructEvent(
      raw,
      stripe.webhooks.generateTestHeaderString({ payload, secret, timestamp: 1 }),
      secret,
    ),
  );
  await assert.rejects(
    boundedStripeBody(
      new Request("https://example.com", { method: "POST", body: "x".repeat(1048577) }),
    ),
    /too large/,
  );
});
