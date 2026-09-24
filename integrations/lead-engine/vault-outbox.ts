import { createHash, createHmac, randomUUID } from "node:crypto";
import { z } from "zod";
import { importSchema } from "../../src/lib/data-vault/records";
type Query = {
  query: <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<T[]>;
};
/** Invoke within the SAME transaction that commits the source page/lookup receipt.
 * A replay sends the saved result; it never calls BatchData again. */
export async function saveVaultBatch(tx: Query, customerId: string, input: unknown) {
  if (!customerId) throw Error("Customer binding required.");
  const payload = importSchema.parse(input),
    body = JSON.stringify(payload);
  const id = createHash("sha256")
    .update(JSON.stringify([customerId, payload.requestId]))
    .digest("hex");
  const digest = createHash("sha256").update(body).digest("hex");
  const rows = await tx.query<{ id: string }>(
    `insert into "DtsVaultOutbox"(id,customer_id,payload,digest) values($1,$2,$3::jsonb,$4)
 on conflict(id) do update set id=excluded.id where "DtsVaultOutbox".digest=excluded.digest returning id`,
    [id, customerId, body, digest],
  );
  if (!rows.length) throw Error("Saved BatchData result conflicts with an earlier capture.");
  return id;
}
const route = z.strictObject({
  integrationId: z.string().min(1).max(100),
  secret: z.string().min(32),
});
const ack = z.strictObject({
  accepted: z.literal(true),
  requestId: z.string(),
  duplicate: z.boolean(),
});
export async function deliverVaultBatches(
  sql: Query,
  env: NodeJS.ProcessEnv = process.env,
  fetcher: typeof fetch = fetch,
) {
  if (env.BATCHDATA_VAULT_SENDER_ENABLED !== "true")
    throw Error("Private result delivery is disabled.");
  const mappings = z
    .record(z.string(), route)
    .parse(JSON.parse(env.BATCHDATA_VAULT_CUSTOMERS_JSON || "{}"));
  // Fixed first-party destination; mappings cannot redirect private records elsewhere.
  const endpoint = "https://demoretechnologysolutions.com/api/webhooks/batchdata-results";
  const summary = { accepted: 0, retry: 0, review: 0 };
  for (let n = 0; n < 20; n++) {
    const token = randomUUID();
    const rows = await sql.query<{
      id: string;
      customer_id: string;
      payload: unknown;
      attempts: number;
    }>(
      `with next as (
   select id from "DtsVaultOutbox" where status in ('ready','sending') and next_attempt_at<=now()
   and (lease_until is null or lease_until<now()) order by created_at,id for update skip locked limit 1)
   update "DtsVaultOutbox" o set status='sending',attempts=attempts+1,lease_token=$1,lease_until=now()+interval '2 minutes'
   from next where o.id=next.id returning o.id,o.customer_id,o.payload,o.attempts`,
      [token],
    );
    if (!rows.length) break;
    const row = rows[0],
      config = Object.hasOwn(mappings, row.customer_id) ? mappings[row.customer_id] : null;
    let status: "accepted" | "ready" | "review" = "review";
    if (config)
      try {
        const payload = importSchema.parse(row.payload),
          body = JSON.stringify(payload),
          ts = String(Math.floor(Date.now() / 1000));
        const response = await fetcher(endpoint, {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.timeout(15000),
          headers: {
            "Content-Type": "application/json",
            "x-dts-integration": config.integrationId,
            "x-dts-timestamp": ts,
            "x-dts-signature": createHmac("sha256", config.secret)
              .update(`${ts}.${body}`)
              .digest("hex"),
          },
          body,
        });
        if (response.status === 202) {
          const accepted = ack.parse(await response.json());
          status = accepted.requestId === payload.requestId ? "accepted" : "review";
        } else status = response.status === 429 || response.status >= 500 ? "ready" : "review";
      } catch {
        status = "ready";
      }
    if (row.attempts >= 6 && status === "ready") status = "review";
    const saved = await sql.query<{ id: string }>(
      `update "DtsVaultOutbox" set status=$3,lease_token=null,lease_until=null,
   next_attempt_at=now()+interval '5 minutes',accepted_at=case when $3='accepted' then now() else null end
   where id=$1 and lease_token=$2 returning id`,
      [row.id, token, status],
    );
    if (saved.length) summary[status === "ready" ? "retry" : status]++;
  }
  return summary;
}
