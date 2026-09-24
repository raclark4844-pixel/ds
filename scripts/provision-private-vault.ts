import { Pool } from "pg";
import { randomUUID } from "node:crypto";
// Operator-only provisioning. No runtime endpoint may choose or replace an owner.
const email = process.env.PRIVATE_VAULT_OWNER_EMAIL?.trim().toLowerCase();
const apply = process.argv.includes("--apply");
if (!email || !process.env.DATABASE_URL)
  throw Error("Set the approved owner email and scoped database connection privately.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const client = await pool.connect();
const orgs = ["org_demore_technology_solutions", "org_demore_exterior_solutions"];
try {
  await client.query(apply ? "begin" : "begin read only");
  const users = await client.query(
    'select id from "user" where lower(email)=$1 and "emailVerified"=true',
    [email],
  );
  if (users.rows.length !== 1)
    throw Error("Exactly one existing verified owner account is required.");
  const owner = users.rows[0].id;
  const spaces = await client.query('select id from "organization" where id=any($1::text[])', [
    orgs,
  ]);
  if (spaces.rows.length !== 2) throw Error("Both approved company migrations must be present.");
  const existing = await client.query(
    "select owner_user_id from dts_data_vaults where organization_id=any($1::text[])",
    [orgs],
  );
  if (existing.rows.some((r) => r.owner_user_id !== owner))
    throw Error("Existing vault ownership differs. Reassignment is not supported by this script.");
  if (apply)
    for (const org of orgs) {
      await client.query(
        'insert into "member"(id,"organizationId","userId",role) values($1,$2,$3,\'owner\') on conflict("userId","organizationId") do nothing',
        [randomUUID(), org, owner],
      );
      await client.query(
        "insert into dts_data_vaults(organization_id,owner_user_id) values($1,$2) on conflict do nothing",
        [org, owner],
      );
    }
  await client.query("commit");
  console.log(
    JSON.stringify({
      mode: apply ? "applied" : "read-only",
      verifiedOwner: true,
      companies: 2,
      additionalGrantsCreated: 0,
    }),
  );
} catch {
  await client.query("rollback");
  console.error(
    "Private vault provisioning stopped. Verify owner, existing ownership and company schema.",
  );
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
