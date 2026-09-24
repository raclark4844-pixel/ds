export function billingFlags(env: NodeJS.ProcessEnv) {
  // Stripe is opt-in as a whole. A stale per-feature flag cannot enable it
  // during an internal release, or when the deployment mode is misspelled.
  const stripe = env.BILLING_MODE === "stripe";
  return {
    ledger: env.TENANT_LEDGER_ENABLED === "true",
    checkout: stripe && env.STRIPE_CHECKOUT_ENABLED === "true",
    webhook: stripe && env.STRIPE_WEBHOOK_ENABLED === "true",
    worker: stripe && env.STRIPE_METER_WORKER_ENABLED === "true",
  };
}
