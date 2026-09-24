import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Sql } from "./db";
export const salesAction = z.discriminatedUnion("action", [
  z.strictObject({
    action: z.literal("stage"),
    leadId: z.string().min(1).max(100),
    version: z.number().int().positive(),
    stage: z.enum(["new", "qualified", "contacted", "won", "lost"]),
  }),
  z.strictObject({
    action: z.literal("draft"),
    leadId: z.string().min(1).max(100),
    channel: z.enum(["sms", "email"]),
    body: z.string().trim().min(1).max(8000),
    requestId: z.string().uuid(),
  }),
  z.strictObject({ action: z.literal("preferences"), showCompleted: z.boolean() }),
]);
export class SalesError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function salesSnapshot(sql: Pick<Sql, "query">, org: string) {
  if (!org) throw new SalesError("Workspace required.", 403);
  const [leads, activity, campaigns, webhooks, billing, preferences] = await Promise.all([
    sql.query(
      `select l.id,l.name,l.email,l.phone,l.interest,l.stage,l.version,d.enrichment,d.tech_stack,d.document_text
   from dts_control_leads l left join dts_client_lead_details d on d.organization_id=l.organization_id and d.lead_id=l.id
   where l.organization_id=$1 order by l.created_at desc,l.id limit 100`,
      [org],
    ),
    sql.query(
      "select id,lead_id,channel,body,delivery_status,created_at from dts_client_activity where organization_id=$1 order by created_at desc,id limit 200",
      [org],
    ),
    sql.query(
      "select id,name,status from dts_client_campaigns where organization_id=$1 order by created_at desc limit 100",
      [org],
    ),
    sql.query(
      "select id,workflow,status,created_at from dts_client_webhook_logs where organization_id=$1 order by created_at desc limit 100",
      [org],
    ),
    sql.query(
      "select daily_cap_microdollars,current_day_spend_microdollars,usage_halted from dts_tenant_billing where organization_id=$1",
      [org],
    ),
    sql.query("select show_completed from dts_client_preferences where organization_id=$1", [org]),
  ]);
  return {
    leads,
    activity,
    campaigns,
    webhooks,
    billing: billing[0] ?? null,
    showCompleted: preferences[0]?.show_completed ?? true,
    limits: { leads: 100, activity: 200 },
  };
}
export async function changeSales(
  sql: Pick<Sql, "query">,
  org: string,
  actor: string,
  input: unknown,
) {
  if (!org || !actor) throw new SalesError("Workspace membership required.", 403);
  const value = salesAction.parse(input);
  if (value.action === "preferences") {
    await sql.query(
      `insert into dts_client_preferences(organization_id,show_completed,updated_by) values($1,$2,$3)
    on conflict(organization_id) do update set show_completed=$2,updated_by=$3,updated_at=now()`,
      [org, value.showCompleted, actor],
    );
    return { saved: true };
  }
  if (value.action === "stage") {
    const rows = await sql.query(
      `with changed as (
   update dts_control_leads set stage=$4,version=version+1,updated_at=now() where organization_id=$1 and id=$2 and version=$3 returning id
  ) insert into dts_client_activity(id,organization_id,lead_id,channel,body,delivery_status,actor_id)
    select $5,$1,id,'status',$6,'recorded',$7 from changed returning id`,
      [
        org,
        value.leadId,
        value.version,
        value.stage,
        randomUUID(),
        `Status changed to ${value.stage}`,
        actor,
      ],
    );
    if (!rows.length)
      throw new SalesError("Lead changed or is unavailable. Refresh before retrying.", 409);
    return { saved: true };
  }
  const id = `draft:${org}:${value.requestId}`;
  const rows = await sql.query(
    `insert into dts_client_activity(id,organization_id,lead_id,channel,body,delivery_status,actor_id)
  select $1,$2,id,$4,$5,'draft',$6 from dts_control_leads where organization_id=$2 and id=$3
  on conflict(id) do nothing returning id`,
    [id, org, value.leadId, value.channel, value.body, actor],
  );
  if (!rows.length) {
    const previous = await sql.query(
      "select id from dts_client_activity where id=$1 and organization_id=$2 and lead_id=$3 and channel=$4 and body=$5 and actor_id=$6",
      [id, org, value.leadId, value.channel, value.body, actor],
    );
    if (!previous.length) throw new SalesError("Lead unavailable or draft request conflicts.", 409);
  }
  return { saved: true, deliveryStatus: "draft" };
}
