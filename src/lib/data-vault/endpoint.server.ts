import { auth } from "../auth/server";
import { getSql } from "../db";
import { requireLeadOrigin, readLeadBody, LeadError } from "../control-leads";
import { vaultAccess, listRecords, setGrant } from "./access";
import { VaultError, recordsCsv } from "./records";
import { z } from "zod";
const change = z.strictObject({
  orgId: z.string().min(1).max(160),
  email: z.string().email().max(254),
  action: z.enum(["grant", "revoke"]),
});
export async function vaultEndpoint(req: Request) {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
  try {
    if (process.env.PRIVATE_DATA_VAULT_ENABLED !== "true")
      throw new VaultError("Private data workspace is not enabled.", 503);
    // Owner passwords/admin access cookies are deliberately not accepted here.
    const session = await auth.api.getSession({
      headers: req.headers,
      query: { disableCookieCache: true },
    });
    if (!session?.user?.id || session.user.emailVerified !== true)
      throw new VaultError("Sign in with your verified account.", 401);
    const sql = await getSql(),
      user = session.user.id;
    if (req.method === "POST") {
      requireLeadOrigin(req);
      const input = change.parse(await readLeadBody(req));
      return Response.json(
        await setGrant(sql, input.orgId, user, input.email, input.action === "revoke"),
        { headers },
      );
    }
    const spaces = await sql.query<{ id: string; name: string; owner: boolean }>(
      `select v.organization_id as id,o.name,v.owner_user_id=$1 as owner
   from dts_data_vaults v join "organization" o on o.id=v.organization_id
   join "member" m on m."organizationId"=v.organization_id and m."userId"=$1
   where v.owner_user_id=$1 or exists(select 1 from dts_data_vault_grants g where g.organization_id=v.organization_id and g.user_id=$1) order by o.name`,
      [user],
    );
    if (!spaces.length) throw new VaultError("Private data access has not been granted.", 403);
    const url = new URL(req.url),
      org = url.searchParams.get("orgId") || spaces[0].id;
    const access = await vaultAccess(sql, org, user);
    const after = z
      .string()
      .max(160)
      .parse(url.searchParams.get("after") || "");
    const campaign = z
      .string()
      .max(160)
      .parse(url.searchParams.get("campaign") || "");
    const rows = await listRecords(
      sql,
      org,
      user,
      after,
      100,
      campaign,
      url.searchParams.get("format") === "csv" ? "export" : "read",
    );
    if (url.searchParams.get("format") === "csv")
      return new Response(recordsCsv(rows), {
        headers: {
          ...headers,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=batchdata-page.csv",
        },
      });
    const grants = access.owner
      ? await sql.query<{ email: string }>(
          `select u.email from dts_data_vault_grants g join "user" u on u.id=g.user_id where g.organization_id=$1 order by u.email`,
          [org],
        )
      : [];
    return Response.json(
      {
        spaces,
        orgId: org,
        owner: access.owner,
        rows,
        grants,
        next: rows.length === 100 ? rows[99].id : null,
      },
      { headers },
    );
  } catch (e) {
    const known = e instanceof VaultError || e instanceof LeadError;
    return Response.json(
      {
        error: known
          ? e.message
          : e instanceof z.ZodError
            ? "Invalid private-data request."
            : "Private data is temporarily unavailable.",
      },
      { status: known ? e.status : e instanceof z.ZodError ? 400 : 503, headers },
    );
  }
}
