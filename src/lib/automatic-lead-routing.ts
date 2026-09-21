import type { Sql } from './db';
/** Deterministic, bounded executor: only first-assignment work is authorized. */
export async function routeNewLeads(sql: Pick<Sql,'query'>) {
  // Lock and recheck eligibility in the same statement. A human edit increments
  // version and removes the record from this rule, including manual unassignment.
  const rows = await sql.query<{id:string;site_id:string}>(`with candidates as (
    select id,site_id from dts_control_leads
    where site_id in ('demore','demore-technology') and stage='new' and owner='unassigned' and version=1
    order by created_at,id for update skip locked limit 20
  ), changed as (
    update dts_control_leads l set owner='ryan',version=l.version+1,updated_at=now()
    from candidates c where l.id=c.id and l.site_id=c.site_id
      and l.stage='new' and l.owner='unassigned' and l.version=1
    returning l.id,l.site_id,l.version
  ), audited as (
    insert into dts_control_lead_events(site_id,lead_id,actor,action,details)
    select site_id,id,'bot:crm-routing-v1','auto_routed',
      jsonb_build_object('owner','ryan','previousOwner','unassigned','stage','new','version',version,
      'risk','medium','rule','first-assignment-v1','review','eligibility verified atomically; no prior human edits')
    from changed
  ) select id,site_id from changed`);
  return {assigned:rows.length};
}
