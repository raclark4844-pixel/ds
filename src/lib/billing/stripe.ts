import Stripe from "stripe";
import { randomUUID } from "node:crypto";
import type { Sql } from "../db";
import { UsageLedgerError } from "./usage-ledger";
type Store = Pick<Sql, "query">;
export function stripeClient(env: NodeJS.ProcessEnv = process.env) {
  const key = env.STRIPE_SECRET_KEY;
  if (
    !key ||
    !(
      key.startsWith("sk_test_") ||
      (key.startsWith("sk_live_") && env.STRIPE_LIVE_ENABLED === "true")
    )
  )
    throw new UsageLedgerError("Stripe test configuration is required.");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 10000 });
}
export function billingOrigin(raw = process.env.BETTER_AUTH_URL) {
  let url: URL;
  try {
    url = new URL(raw || "");
  } catch {
    throw new UsageLedgerError("Website billing origin is not configured.");
  }
  if (url.protocol !== "https:" || url.origin !== raw)
    throw new UsageLedgerError("Billing requires an exact HTTPS website origin.");
  return url.origin;
}
export async function meterCatalog(stripe: Stripe, env: NodeJS.ProcessEnv = process.env) {
  const id = env.STRIPE_METER_PRICE_ID,
    name = env.STRIPE_METER_EVENT_NAME;
  if (!id || !name) throw new UsageLedgerError("Metered price is not configured.");
  const price = await stripe.prices.retrieve(id);
  if (
    !price.active ||
    price.currency !== "usd" ||
    price.billing_scheme !== "per_unit" ||
    price.recurring?.usage_type !== "metered" ||
    !price.recurring.meter ||
    Number(price.unit_amount_decimal) !== 0.0001 ||
    price.transform_quantity
  )
    throw new UsageLedgerError("Meter price must be USD 0.000001 per integer microdollar.");
  const meter = await stripe.billing.meters.retrieve(price.recurring.meter);
  if (
    meter.status !== "active" ||
    meter.event_name !== name ||
    meter.default_aggregation.formula !== "sum" ||
    meter.customer_mapping.event_payload_key !== "stripe_customer_id" ||
    meter.value_settings.event_payload_key !== "value"
  )
    throw new UsageLedgerError("Meter configuration does not match the ledger.");
  return { priceId: id, eventName: name };
}
type Account = {
  organization_id: string;
  stripe_customer_id: string;
  enabled: boolean;
  display_name: string;
  button_color: string;
  checkout_key: string | null;
  checkout_key_created_at: Date | string | null;
  checkout_session_id: string | null;
  meter_price_id: string | null;
  meter_event_name: string | null;
};
export async function checkout(
  sql: Store,
  org: string,
  stripe = stripeClient(),
  env: NodeJS.ProcessEnv = process.env,
) {
  const catalog = await meterCatalog(stripe, env),
    origin = billingOrigin(env.BETTER_AUTH_URL);
  // Persist the idempotency key BEFORE contacting Stripe; ambiguous failures retain it.
  const account = (
    await sql.query<Account>(
      `update dts_stripe_accounts set checkout_key=coalesce(checkout_key,$2),checkout_key_created_at=coalesce(checkout_key_created_at,now()) where organization_id=$1 and enabled=true returning *`,
      [org, randomUUID()],
    )
  )[0];
  if (!account) throw new UsageLedgerError("Billing is not provisioned for this company.", 409);
  if (account.meter_price_id !== catalog.priceId || account.meter_event_name !== catalog.eventName)
    throw new UsageLedgerError("Company meter configuration requires review.", 409);
  const subscriptions = await stripe.subscriptions.list({
    customer: account.stripe_customer_id,
    status: "all",
    limit: 100,
  });
  if (
    subscriptions.has_more ||
    subscriptions.data.some((s) => !["canceled", "incomplete_expired"].includes(s.status))
  )
    throw new UsageLedgerError(
      "An existing subscription requires management before new checkout.",
      409,
    );
  if (account.checkout_session_id) {
    const previous = await stripe.checkout.sessions.retrieve(account.checkout_session_id);
    if (previous.status === "open" && previous.url) return { url: previous.url };
    throw new UsageLedgerError(
      "Previous checkout requires reconciliation before a new attempt.",
      409,
    );
  }
  if (
    !account.checkout_key_created_at ||
    Date.now() - new Date(account.checkout_key_created_at).getTime() > 22 * 3600000
  )
    throw new UsageLedgerError("Checkout retry window expired; reconcile the prior attempt.", 409);
  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [{ price: catalog.priceId }];
  if (env.STRIPE_FIXED_PRICE_ID) {
    const fixed = await stripe.prices.retrieve(env.STRIPE_FIXED_PRICE_ID);
    if (!fixed.active || fixed.currency !== "usd" || fixed.recurring?.usage_type !== "licensed")
      throw new UsageLedgerError("Fixed recurring price is invalid.");
    items.push({ price: fixed.id, quantity: 1 });
  }
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      customer: account.stripe_customer_id,
      client_reference_id: org,
      metadata: { orgId: org },
      subscription_data: { metadata: { orgId: org } },
      line_items: items,
      success_url: `${origin}/workspace?checkout=returned`,
      cancel_url: `${origin}/workspace`,
      branding_settings: {
        display_name: account.display_name.slice(0, 100),
        button_color: /^#[a-f0-9]{6}$/i.test(account.button_color)
          ? account.button_color
          : "#2563eb",
      },
    },
    { idempotencyKey: `dts-checkout:${account.checkout_key}` },
  );
  if (!session.url) throw new UsageLedgerError("Checkout URL is unavailable.");
  await sql.query(
    "update dts_stripe_accounts set checkout_session_id=$3,checkout_url=$4,updated_at=now() where organization_id=$1 and checkout_key=$2",
    [org, account.checkout_key, session.id, session.url],
  );
  return { url: session.url };
}
const supported = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "invoice.paid",
  "invoice.payment_failed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);
export async function reconcileStripeEvent(sql: Store, event: Stripe.Event, stripe: Stripe) {
  if (!supported.has(event.type)) return;
  const object = event.data.object as unknown as { customer?: string | { id: string } };
  const customer = typeof object.customer === "string" ? object.customer : object.customer?.id;
  if (!customer) throw new UsageLedgerError("Stripe event has no customer mapping.");
  if ((await sql.query("select id from dts_stripe_receipts where id=$1", [event.id])).length)
    return;
  const token = randomUUID();
  const account = (
    await sql.query<Account>(
      `update dts_stripe_accounts set reconcile_token=$2,reconcile_until=now()+interval '2 minutes' where stripe_customer_id=$1 and (reconcile_until is null or reconcile_until<now()) returning *`,
      [customer, token],
    )
  )[0];
  if (!account)
    throw new UsageLedgerError("Stripe customer is unmapped or reconciliation is busy.");
  try {
    const subscriptions = await stripe.subscriptions.list({ customer, status: "all", limit: 100 });
    const matches = subscriptions.data.filter(
      (s) =>
        s.metadata.orgId === account.organization_id &&
        !["canceled", "incomplete_expired"].includes(s.status),
    );
    if (subscriptions.has_more || matches.length > 1)
      throw new UsageLedgerError("Subscription reconciliation requires review.");
    const current = matches[0];
    if (
      current &&
      (!process.env.STRIPE_METER_PRICE_ID ||
        current.items.has_more ||
        !current.items.data.some((item) => item.price.id === process.env.STRIPE_METER_PRICE_ID))
    )
      throw new UsageLedgerError("Subscription uses an unapproved price.");
    const rows = await sql.query(
      `with updated as (update dts_stripe_accounts set subscription_id=$3,subscription_status=$4,reconcile_token=null,reconcile_until=null,updated_at=now() where organization_id=$1 and reconcile_token=$2 and reconcile_until>now() returning organization_id)
   insert into dts_stripe_receipts(id,organization_id,type) select $5,organization_id,$6 from updated on conflict(id) do nothing returning id`,
      [
        account.organization_id,
        token,
        current?.id ?? null,
        current?.status ?? "canceled",
        event.id,
        event.type,
      ],
    );
    if (
      !rows.length &&
      !(await sql.query("select id from dts_stripe_receipts where id=$1", [event.id])).length
    )
      throw new UsageLedgerError("Reconciliation lease expired.");
  } finally {
    await sql.query(
      "update dts_stripe_accounts set reconcile_token=null,reconcile_until=null where organization_id=$1 and reconcile_token=$2",
      [account.organization_id, token],
    );
  }
}
export async function boundedStripeBody(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new UsageLedgerError("Missing body.", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 1048576) {
        await reader.cancel();
        throw new UsageLedgerError("Body too large.", 413);
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } finally {
    reader.releaseLock();
  }
}
