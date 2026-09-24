import {
  stripeClient,
  boundedStripeBody,
  reconcileStripeEvent,
} from "../../../../src/lib/billing/stripe";
import { billingFlags } from "../../../../src/lib/billing/config";
import { UsageLedgerError } from "../../../../src/lib/billing/usage-ledger";
export default async function handler(event: { req: Request }) {
  if (!billingFlags(process.env).webhook || !process.env.STRIPE_WEBHOOK_SECRET)
    return Response.json({ error: "Stripe webhook is not enabled." }, { status: 503 });
  const signature = event.req.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature." }, { status: 400 });
  let stripe, notification;
  try {
    stripe = stripeClient();
    notification = stripe.webhooks.constructEvent(
      await boundedStripeBody(event.req),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    if (notification.livemode !== process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_"))
      throw Error("Mode mismatch");
  } catch (error) {
    return Response.json(
      { error: "Invalid webhook." },
      { status: error instanceof UsageLedgerError ? error.status : 400 },
    );
  }
  try {
    const { getSql } = await import("../../../../src/lib/db");
    await reconcileStripeEvent(await getSql(), notification, stripe);
    return Response.json({ received: true });
  } catch {
    return Response.json({ error: "Reconciliation incomplete; retry required." }, { status: 503 });
  }
}
