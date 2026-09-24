import { createHmac, timingSafeEqual, randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import type { Sql } from "../db";
import { trustedEnvelopeSchema, validateWorkflowResult } from "./contracts";
export class CallbackError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const configSchema = z.record(
  z.string().min(1).max(100),
  z.strictObject({ orgId: z.string().min(1).max(100), secret: z.string().min(32).max(500) }),
);
const messageSchema = z.strictObject({
  envelope: trustedEnvelopeSchema,
  leadId: z.string().min(1).max(100),
  input: z.unknown(),
  output: z.unknown(),
});
export function authenticateCallback(
  headers: Headers,
  body: string,
  rawConfig: string | undefined,
  now = Date.now(),
) {
  let config: z.infer<typeof configSchema>;
  try {
    config = configSchema.parse(JSON.parse(rawConfig || ""));
  } catch {
    throw new CallbackError("Workflow integration is not configured.", 503);
  }
  const key = headers.get("x-dts-integration") || "",
    timestamp = headers.get("x-dts-timestamp") || "",
    provided = headers.get("x-dts-signature") || "";
  const integration = Object.prototype.hasOwnProperty.call(config, key) ? config[key] : undefined;
  if (
    !integration ||
    !/^\d{10}$/.test(timestamp) ||
    Math.abs(now - Number(timestamp) * 1000) > 300000 ||
    !/^[a-f0-9]{64}$/i.test(provided)
  )
    throw new CallbackError("Invalid workflow signature.", 401);
  const expected = createHmac("sha256", integration.secret)
    .update(timestamp + "." + body)
    .digest();
  if (!timingSafeEqual(expected, Buffer.from(provided, "hex")))
    throw new CallbackError("Invalid workflow signature.", 401);
  const message = messageSchema.parse(JSON.parse(body));
  const age = now - Date.parse(message.envelope.issuedAt);
  if (message.envelope.orgId !== integration.orgId || age < -300000 || age > 86400000)
    throw new CallbackError("Workflow scope rejected.", 403);
  const output = validateWorkflowResult(message.envelope.workflow, message.input, message.output);
  return {
    message,
    output,
    orgId: integration.orgId,
    actorId: `base44:${key}`,
    digest: createHash("sha256").update(body).digest("hex"),
  };
}
export async function persistCallback(
  sql: Pick<Sql, "query">,
  verified: ReturnType<typeof authenticateCallback>,
) {
  const { message, output, orgId, actorId, digest } = verified;
  const requestId = message.envelope.requestId;
  // Include digest in immutable workflow value to reject idempotency-key reuse
  // with different content while never logging the full source documents.
  const workflow = `${message.envelope.workflow}:${digest}`;
  const escalation =
    "escalation" in output && output.escalation.requested ? output.escalation : null;
  const prose =
    "answer" in output ? output.answer : "body" in output ? output.body : JSON.stringify(output);
  const rows = await sql.query(
    `with receipt as (
  insert into dts_client_webhook_logs(id,organization_id,request_id,workflow,status)
   select $1,$2,$3,$4,'accepted' where exists(select 1 from dts_control_leads where organization_id=$2 and id=$5)
   on conflict(organization_id,request_id) do nothing returning id
 ), activity as (
  insert into dts_client_activity(id,organization_id,lead_id,channel,body,delivery_status,actor_id)
   select $6,$2,$5,$7,$8,'received',$9 from receipt returning id
 ), details as (
  insert into dts_client_lead_details(organization_id,lead_id,enrichment,tech_stack,document_text)
   select $2,$5,case when $13='grokExtraction' then $14::jsonb else '{}'::jsonb end,
    case when $13='grokExtraction' then $14::jsonb->'technology' else '[]'::jsonb end,
    case when $13='claudeProposal' then $8 else '' end from receipt where $13<>'chatSupport'
   on conflict(organization_id,lead_id) do update set
    enrichment=case when $13='grokExtraction' then excluded.enrichment else dts_client_lead_details.enrichment end,
    tech_stack=case when $13='grokExtraction' then excluded.tech_stack else dts_client_lead_details.tech_stack end,
    document_text=case when $13='claudeProposal' then excluded.document_text else dts_client_lead_details.document_text end
 ), escalation as (
  insert into dts_support_escalations(id,organization_id,request_id,reason,summary)
   select $10,$2,$3,$11,$12 from receipt where $11::text is not null returning id
 ) select id from receipt`,
    [
      randomUUID(),
      orgId,
      requestId,
      workflow,
      message.leadId,
      randomUUID(),
      message.envelope.workflow === "chatSupport" ? "chat" : "document",
      prose.slice(0, 10000),
      actorId,
      randomUUID(),
      escalation?.reason ?? null,
      escalation?.summary ?? null,
      message.envelope.workflow,
      JSON.stringify(output),
    ],
  );
  if (!rows.length) {
    const duplicate = await sql.query(
      "select id from dts_client_webhook_logs where organization_id=$1 and request_id=$2 and workflow=$3",
      [orgId, requestId, workflow],
    );
    if (!duplicate.length)
      throw new CallbackError("Workflow request conflicts or lead is unavailable.", 409);
  }
  return { accepted: true, requestId, escalation: escalation ? "queued" : "none" };
}
export async function boundedCallbackBody(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new CallbackError("Missing body.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 2500000) {
        await reader.cancel();
        throw new CallbackError("Workflow body too large.", 413);
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks).toString("utf8");
  } finally {
    reader.releaseLock();
  }
}
