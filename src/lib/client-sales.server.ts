import {
  resolveActiveOrganization,
  assertOrganizationAccess,
  TenantAccessError,
} from "./auth/tenant.server";
import { getSql } from "./db";
import { requireLeadOrigin, readLeadBody, LeadError } from "./control-leads";
import { salesSnapshot, changeSales, SalesError } from "./client-sales";
import { ZodError } from "zod";
import { roleMeets } from "./auth/tenant-policy";
import { internalWorkspaceAllowed } from "./internal-release";
import { billingFlags } from "./billing/config";
export async function salesEndpoint(req: Request, write: boolean) {
  try {
    if (process.env.CLIENT_PORTAL_ENABLED !== "true")
      return Response.json({ error: "Client workspace is not enabled." }, { status: 503 });
    const tenant = await resolveActiveOrganization(req);
    if (!tenant) throw new TenantAccessError("Sign in to your workspace.", 401);
    if (process.env.BILLING_MODE !== "stripe" && !internalWorkspaceAllowed(tenant.organizationId))
      throw new TenantAccessError("This workspace is not enabled for the internal release.");
    const access = await assertOrganizationAccess(
      tenant.organizationId,
      { id: tenant.userId },
      write ? "client_admin" : "client_viewer",
    );
    if (write) requireLeadOrigin(req);
    const sql = await getSql();
    const result = write
      ? await changeSales(sql, tenant.organizationId, tenant.userId, await readLeadBody(req))
      : await salesSnapshot(sql, tenant.organizationId);
    const workspaces = write
      ? []
      : (
          await sql.query<{ id: string; name: string }>(
            'select o.id,o.name from "organization" o join "member" m on m."organizationId"=o.id where m."userId"=$1 order by o.name',
            [tenant.userId],
          )
        ).filter((o) => process.env.BILLING_MODE === "stripe" || internalWorkspaceAllowed(o.id));
    return Response.json(
      {
        ...result,
        ...(!write
          ? {
              canEdit: roleMeets(access.role, "client_admin"),
              workspaces,
              activeOrgId: tenant.organizationId,
              checkoutEnabled: billingFlags(process.env).checkout,
            }
          : {}),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const known =
      error instanceof TenantAccessError ||
      error instanceof SalesError ||
      error instanceof LeadError;
    return Response.json(
      {
        error: known
          ? error.message
          : error instanceof ZodError
            ? "Invalid workspace request."
            : "Workspace temporarily unavailable.",
      },
      {
        status: known ? error.status : error instanceof ZodError ? 400 : 503,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
}
