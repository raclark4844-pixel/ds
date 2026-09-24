import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import type { Sql } from "../db";
import { meterCatalog } from "./stripe";
type Delivery = {
  operation_id: string;
  organization_id: string;
  stripe_customer_id: string;
  event_name: string;
  price_id: string;
  value_microdollars: number | string;
  occurred_at: string | Date;
  first_attempt_at: string | Date;
  attempts: number;
};
export function meterFailureState(error: unknown): "READY" | "RECONCILE" {
  const value = error as { type?: string; statusCode?: number } | null;
  if (value?.type === "StripeIdempotencyError") return "RECONCILE";
  const status = value?.statusCode;
  if (
    typeof status === "number" &&
    status >= 400 &&
    status < 500 &&
    status !== 408 &&
    status !== 409 &&
    status !== 429
  )
    return "RECONCILE";
  return "READY";
}
/** Acceptance is not invoice settlement: Stripe processes meter events asynchronously. */
export async function deliverMeterBatch(
  sql: Pick<Sql, "query">,
  stripe: Stripe,
  maximum = 50,
  env: NodeJS.ProcessEnv = process.env,
) {
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 100)
    throw Error("Invalid batch size.");
  const catalog = await meterCatalog(stripe, env);
  const summary = { accepted: 0, retry: 0, reconcile: 0 };
  for (let i = 0; i < maximum; i++) {
    const token = randomUUID();
    const row = (await sql.query<Delivery>("select * from dts_claim_meter($1)", [token]))[0];
    if (!row) break;
    let state = "RECONCILE";
    try {
      const age = Date.now() - new Date(row.occurred_at).getTime();
      const retryAge = Date.now() - new Date(row.first_attempt_at).getTime();
      const matches = await sql.query(
        `select 1 from dts_stripe_accounts a join dts_meter_bindings b on b.organization_id=a.organization_id
        where a.organization_id=$1 and b.operation_id=$2 and a.enabled=true and a.stripe_customer_id=$3
        and a.meter_price_id=$4 and a.meter_event_name=$5 and a.subscription_id=b.subscription_id
        and b.stripe_customer_id=$3 and b.price_id=$4 and b.event_name=$5
        and a.meter_lease_token=$6 and a.meter_lease_until>now()`,
        [
          row.organization_id,
          row.operation_id,
          row.stripe_customer_id,
          row.price_id,
          row.event_name,
          token,
        ],
      );
      const value = Number(row.value_microdollars);
      if (
        matches.length &&
        row.price_id === catalog.priceId &&
        row.event_name === catalog.eventName &&
        Number.isSafeInteger(value) &&
        value >= 0 &&
        age >= 0 &&
        age < 34 * 86400000 &&
        retryAge >= 0 &&
        retryAge < 22 * 3600000
      ) {
        try {
          const identifier = `dts-usage-${row.operation_id}`;
          await stripe.billing.meterEvents.create(
            {
              event_name: row.event_name,
              identifier,
              timestamp: Math.floor(new Date(row.occurred_at).getTime() / 1000),
              payload: { stripe_customer_id: row.stripe_customer_id, value: String(value) },
            },
            { idempotencyKey: identifier },
          );
          state = "ACCEPTED";
        } catch (error) {
          state = meterFailureState(error);
        }
      }
      const updated = await sql.query(
        `update dts_stripe_meter_outbox set state=$3,lease_token=null,lease_until=null,
        next_attempt_at=now()+($4*interval '1 second') where operation_id=$1 and lease_token=$2 and lease_until>now() returning operation_id`,
        [row.operation_id, token, state, Math.min(3600, 30 * 2 ** Math.min(row.attempts, 7))],
      );
      if (updated.length)
        summary[state === "ACCEPTED" ? "accepted" : state === "READY" ? "retry" : "reconcile"]++;
    } finally {
      await sql.query(
        "update dts_stripe_accounts set meter_lease_token=null,meter_lease_until=null where organization_id=$1 and meter_lease_token=$2",
        [row.organization_id, token],
      );
    }
  }
  return summary;
}
