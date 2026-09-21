import { createHash, randomUUID } from "node:crypto";
import type { Sql } from "./db";
type DB = Pick<Sql, "query">;
export const ALERT_TO = ["ryan@demoretechnologysolutions.com", "ryan@demoreexteriorsolutions.com"];
const URL = "https://www.demoretechnologysolutions.com/lead-inbox";
export async function queueInboxAlert(sql: DB, from: string, now = new Date()) {
  // Only identifiers and operational status are used. Customer content never enters email.
  const leads = await sql.query<{site_id:string; total:number; fingerprint:string}>(`select site_id, count(*)::int as total,
    md5(string_agg(id || ':' || version::text, ',' order by id)) as fingerprint
    from dts_control_leads where stage in ('new','qualified') group by site_id order by site_id`);
  const health = await sql.query<{report:{enabled:boolean;runFailed:boolean;failed:number;retry:number;pending:number;lastRunAt:string|null};received_at:string}>(`select report, received_at from dts_inbox_health where site_id='demore'`);
  const h = health[0];
  const stale = !!h && (!h.report.lastRunAt || now.getTime()-Date.parse(h.report.lastRunAt)>900000 || now.getTime()-new Date(h.received_at).getTime()>900000);
  const issue = h && (!h.report.enabled || h.report.runFailed || h.report.failed>0 || h.report.retry>0 || stale)
    ? {paused:!h.report.enabled,runFailed:h.report.runFailed,failed:h.report.failed,retry:h.report.retry,stale} : null;
  if (!leads.length && !issue) return null;
  const day = now.toISOString().slice(0,10);
  const id = createHash('sha256').update(JSON.stringify({day,leads,issue})).digest('hex');
  const lines = leads.map(l => `${l.site_id === 'demore' ? 'Demore Exterior Solutions' : 'Demore Technology Solutions'}: ${l.total} lead(s) awaiting review (new or qualified).`);
  if (issue) lines.push(`Exterior sync needs attention: ${issue.failed} failed, ${issue.retry} retrying${issue.paused?', paused':''}${issue.runFailed?', run incomplete':''}${issue.stale?', report or run overdue':''}.`);
  const text = ["Shared inbox — action needed", "", ...lines, "", "Review and authorize:", URL,
    "Sign in as administrator, review the lead, choose its owner and stage, then confirm the exact change. Opening this link does not authorize an action.",
    "Sync delivery failures can be reviewed in the existing Exterior Solutions Base44 delivery queue.",
    "Replying to this email does not execute commands. Customer messages, spending and website deployments are not authorized by this email.",
    "Unresolved work is summarized again once per UTC day, or when the pending work changes. Leads leave this reminder when marked contacted, won or lost.",
    "", "https://demoreexteriorsolutions.com/", "https://www.demoretechnologysolutions.com/"].join("\n");
  await sql.query(`insert into dts_inbox_alerts(id,payload,created_at) values($1,$2::jsonb,$3) on conflict(id) do nothing`, [id,JSON.stringify({from,to:ALERT_TO,subject:"Demore shared inbox — action needed",text}),now.toISOString()]);
  return id;
}
export async function deliverInboxAlert(sql: DB, apiKey: string, fetcher = fetch) {
  if (!apiKey) return {status:"unconfigured"};
  // Never retry outside the provider's 24-hour idempotency window.
  await sql.query(`update dts_inbox_alerts set status='failed',last_error='Retry window expired; review email delivery' where status='pending' and created_at < now()-interval '23 hours' and lease_until < now()`);
  const token = randomUUID();
  const rows = await sql.query<{id:string;payload:unknown;attempts:number}>(`update dts_inbox_alerts set lease_token=$1,lease_until=now()+interval '60 seconds',attempts=attempts+1
    where id=(select id from dts_inbox_alerts where status='pending' and next_attempt_at<=now() and lease_until<now() and attempts<6 order by created_at for update skip locked limit 1)
    returning id,payload,attempts`, [token]);
  const row = rows[0];
  if (!row) return {status:"idle"};
  let status=0;
  try {
    const response = await fetcher('https://api.resend.com/emails',{method:'POST',redirect:'error',signal:AbortSignal.timeout(5000),headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':`inbox-alert/${row.id}`},body:JSON.stringify(row.payload)});
    status=response.status;
    if(response.ok) {
      const result=await response.json();
      if(typeof result.id !== 'string') throw new Error('Missing receipt');
      await sql.query(`update dts_inbox_alerts set status='accepted',accepted_at=now(),provider_id=$3,last_error=null,lease_until='1970-01-01' where id=$1 and lease_token=$2`,[row.id,token,result.id]);
      return {status:'accepted'};
    }
  } catch { /* Raw provider errors may contain sensitive data. */ }
  const failed = row.attempts>=6 || (status>=400 && status<500 && status!==429 && status!==409);
  await sql.query(`update dts_inbox_alerts set status=$3,last_error=$4,next_attempt_at=now()+interval '15 minutes',lease_until='1970-01-01' where id=$1 and lease_token=$2`,[row.id,token,failed?'failed':'pending',status?`Email provider returned ${status}`:'Email acceptance not confirmed']);
  return {status:failed?'failed':'retry'};
}
export async function inboxAlertStatus(sql: DB) {
  const rows=await sql.query(`select status,attempts,accepted_at,last_error,created_at from dts_inbox_alerts order by created_at desc limit 1`);
  return {recipients:ALERT_TO,latest:rows[0] || null};
}
