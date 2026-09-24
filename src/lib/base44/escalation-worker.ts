import { createHmac, randomUUID } from "node:crypto";
import { z } from "zod";
import type { Sql } from "../db";
const routingSchema = z.record(
  z.string().min(1).max(100),
  z.strictObject({
    endpoint: z.string().url(),
    secret: z.string().min(32).max(500),
    idempotencyVerified: z.literal(true),
  }),
);
type Escalation = {
  id: string;
  organization_id: string;
  request_id: string;
  reason: string;
  summary: string;
  attempts: number;
  created_at: string | Date;
};
/** The configured Base44 receiver MUST deduplicate idempotency-key before sending
 * any notification. Routing/recipients never come from the model or visitor. */
export async function deliverEscalations(
  sql: Pick<Sql, "query">,
  rawRouting: string,
  send: typeof fetch = fetch,
  maximum = 20,
) {
  const routing = routingSchema.parse(JSON.parse(rawRouting));
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 100)
    throw Error("Invalid batch size.");
  const result = { acknowledged: 0, retry: 0, reconcile: 0 };
  for (let i = 0; i < maximum; i++) {
    const token = randomUUID();
    const row = (
      await sql.query<Escalation>(
        `with pending as (
   select id from dts_support_escalations where status in ('queued','sending') and next_attempt_at<=now()
    and (lease_until is null or lease_until<now()) order by created_at for update skip locked limit 1
  ) update dts_support_escalations set status='sending',lease_token=$1,lease_until=now()+interval '1 minute',attempts=attempts+1
   where id in(select id from pending) returning *`,
        [token],
      )
    )[0];
    if (!row) break;
    const destination = Object.prototype.hasOwnProperty.call(routing, row.organization_id)
      ? routing[row.organization_id]
      : undefined;
    let state = "reconcile";
    if (
      destination &&
      row.attempts <= 6 &&
      Date.now() - new Date(row.created_at).getTime() < 22 * 3600000
    ) {
      const url = new URL(destination.endpoint);
      if (
        url.protocol === "https:" &&
        url.hostname === "app.base44.com" &&
        !url.username &&
        !url.password &&
        !url.hash &&
        !url.search
      ) {
        const timestamp = String(Math.floor(Date.now() / 1000));
        const body = JSON.stringify({
          version: "1",
          requestId: row.request_id,
          orgId: row.organization_id,
          event: "support.escalation",
          data: { reason: row.reason, summary: row.summary },
        });
        try {
          const response = await send(url, {
            method: "POST",
            redirect: "error",
            signal: AbortSignal.timeout(5000),
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": row.id,
              "x-dts-timestamp": timestamp,
              "x-dts-signature": createHmac("sha256", destination.secret)
                .update(timestamp + "." + body)
                .digest("hex"),
            },
            body,
          });
          if (response.ok) {
            const ack = z
              .strictObject({ accepted: z.literal(true), requestId: z.literal(row.request_id) })
              .parse(await response.json());
            state = ack.accepted ? "acknowledged" : "reconcile";
          } else state = response.status === 429 || response.status >= 500 ? "queued" : "reconcile";
        } catch {
          state = "queued";
        }
      }
    }
    const changed = await sql.query(
      `update dts_support_escalations set status=$3,lease_token=null,lease_until=null,
    next_attempt_at=now()+($4*interval '1 second') where id=$1 and lease_token=$2 and lease_until>now() returning id`,
      [row.id, token, state, Math.min(3600, 30 * 2 ** row.attempts)],
    );
    if (changed.length)
      result[
        state === "acknowledged" ? "acknowledged" : state === "queued" ? "retry" : "reconcile"
      ]++;
  }
  return result;
}
