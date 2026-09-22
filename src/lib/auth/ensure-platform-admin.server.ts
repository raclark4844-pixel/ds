import { randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import {
  PLATFORM_ORG_ID,
  isPlatformOwnerEmail,
} from "./platform-owners";

export async function ensurePlatformSuperAdmin(input: {
  id?: string | null;
  userId?: string | null;
  email?: string | null;
}) {
  const userId = input.id || input.userId || "";
  if (!userId && !input.email) return null;
  const sql = await getSql();

  const users = userId
    ? await sql.query<{ id: string; email: string }>(
        `select id, email from "user" where id = $1 limit 1`,
        [userId],
      )
    : await sql.query<{ id: string; email: string }>(
        `select id, email from "user" where lower(email) = lower($1) limit 1`,
        [input.email],
      );
  const user = users[0];
  if (!user || !isPlatformOwnerEmail(user.email)) return null;

  const existing = await sql.query<{ role: string }>(
    `select role from "member" where "userId" = $1 and "organizationId" = $2 limit 1`,
    [user.id, PLATFORM_ORG_ID],
  );
  if (existing[0]?.role !== "super_admin") {
    await sql.query(
      `insert into "organization" ("id", "name", "slug", "metadata", "createdAt")
       values ($1, 'Demore Technology Solutions', 'demore-technology-solutions', '{"platformOperator":true}', now())
       on conflict ("slug") do nothing`,
      [PLATFORM_ORG_ID],
    );
    await sql.query(
      `insert into dts_tenant_billing(organization_id, current_day)
       values ($1, to_char(now() at time zone 'America/New_York','YYYY-MM-DD'))
       on conflict (organization_id) do nothing`,
      [PLATFORM_ORG_ID],
    );
    await sql.query(
      `insert into "member" ("id", "organizationId", "userId", "role", "createdAt")
       values ($1, $2, $3, 'super_admin', now())
       on conflict ("userId", "organizationId") do update set role = 'super_admin'`,
      ["mem_" + randomUUID(), PLATFORM_ORG_ID, user.id],
    );
  }

  await sql.query(
    `update "session" set "activeOrganizationId" = $2, "updatedAt" = now()
     where "userId" = $1 and ("activeOrganizationId" is null or "activeOrganizationId" = '')`,
    [user.id, PLATFORM_ORG_ID],
  );
  return { userId: user.id, organizationId: PLATFORM_ORG_ID, role: "super_admin" as const };
}
