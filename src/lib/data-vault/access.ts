import type { Sql } from "../db";
import { VaultError } from "./records";
export async function vaultAccess(sql: Pick<Sql, "query">, org: string, user: string) {
  const rows = await sql.query<{ owner: boolean }>(
    `select v.owner_user_id=$2 as owner from dts_data_vaults v
 join "member" m on m."organizationId"=v.organization_id and m."userId"=$2
 where v.organization_id=$1 and (v.owner_user_id=$2 or exists(select 1 from dts_data_vault_grants g where g.organization_id=v.organization_id and g.user_id=$2))`,
    [org, user],
  );
  if (!rows.length)
    throw new VaultError("Private data access is not available for this account.", 403);
  return rows[0];
}
export async function listRecords(
  sql: Pick<Sql, "query">,
  org: string,
  user: string,
  after = "",
  limit = 100,
  campaign = "",
  action: "read" | "export" = "read",
) {
  await vaultAccess(sql, org, user);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000)
    throw new VaultError("Invalid page size.");
  // Recheck membership/grants in the data query so revocation cannot expose a subsequent page.
  return sql.query<{
    id: string;
    data: Record<string, unknown>;
    version: number;
    updated_at: string;
  }>(
    `with records as (select r.id,r.data,r.version,r.updated_at from dts_batchdata_records r
 join dts_data_vaults v on v.organization_id=r.organization_id
 join "member" m on m."organizationId"=r.organization_id and m."userId"=$2
 where r.organization_id=$1 and r.id>$3
 and (v.owner_user_id=$2 or exists(select 1 from dts_data_vault_grants g where g.organization_id=r.organization_id and g.user_id=$2))
 and ($5='' or exists(select 1 from dts_batchdata_observations o join dts_batchdata_imports i on i.organization_id=o.organization_id and i.request_id=o.request_id where o.organization_id=r.organization_id and o.record_id=r.id and i.campaign_id=$5))
 order by r.id limit $4), audited as (insert into dts_data_vault_reads(organization_id,actor_id,action,record_ids) select $1,$2,$6,coalesce(array_agg(id),array[]::text[]) from records returning id) select records.* from records cross join (select count(*) from audited) audit order by records.id`,
    [org, user, after, limit, campaign, action],
  );
}
export async function setGrant(
  sql: Pick<Sql, "query">,
  org: string,
  owner: string,
  email: string,
  revoke: boolean,
) {
  const access = await vaultAccess(sql, org, owner);
  if (!access.owner) throw new VaultError("Only the data owner can manage access.", 403);
  // A grant never creates membership or promotes a user. Existing verified members only.
  const rows = await sql.query<{ id: string }>(
    revoke
      ? `select u.id from "user" u join dts_data_vault_grants g on g.user_id=u.id where g.organization_id=$1 and lower(u.email)=$2 and u.id<>$3`
      : `select u.id from "user" u join "member" m on m."userId"=u.id
 where m."organizationId"=$1 and lower(u.email)=$2 and u."emailVerified"=true and u.id<>$3`,
    [org, email.toLowerCase(), owner],
  );
  if (revoke && rows.length === 0) return { saved: true };
  if (rows.length !== 1)
    throw new VaultError("Choose one verified workspace member other than the owner.", 400);
  const target = rows[0].id;
  const mutation = revoke
    ? `delete from dts_data_vault_grants where organization_id=$1 and user_id=$3 and exists(select 1 from dts_data_vaults where organization_id=$1 and owner_user_id=$2 and exists(select 1 from "member" where "organizationId"=$1 and "userId"=$2)) returning user_id`
    : `insert into dts_data_vault_grants(organization_id,user_id,granted_by)
 select $1,$3,$2 from dts_data_vaults v join "member" m on m."organizationId"=v.organization_id and m."userId"=$3
 where v.organization_id=$1 and v.owner_user_id=$2 and exists(select 1 from "member" where "organizationId"=$1 and "userId"=$2) on conflict do nothing returning user_id`;
  await sql.query(
    `with changed as (${mutation}) insert into dts_data_vault_access_events(organization_id,actor_id,target_user_id,action) select $1,$2,user_id,$4 from changed`,
    [org, owner, target, revoke ? "revoke" : "grant"],
  );
  return { saved: true };
}
