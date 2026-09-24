import { billingFlags } from "../../../../src/lib/billing/config";
export default async function handler(event: { req: Request }) {
  const { UsageLedgerError } = await import("../../../../src/lib/billing/usage-ledger");
  try {
    if (!billingFlags(process.env).checkout) throw new UsageLedgerError("Checkout is not enabled.");
    const { checkout, billingOrigin } = await import("../../../../src/lib/billing/stripe");
    if (event.req.headers.get("origin") !== billingOrigin())
      throw new UsageLedgerError("Request origin rejected.", 403);
    const { resolveActiveOrganization, assertOrganizationAccess } =
      await import("../../../../src/lib/auth/tenant.server");
    const tenant = await resolveActiveOrganization(event.req);
    if (!tenant) throw new UsageLedgerError("Sign in to your company workspace.", 401);
    await assertOrganizationAccess(tenant.organizationId, { id: tenant.userId }, "client_admin");
    const { getSql } = await import("../../../../src/lib/db");
    return Response.json(await checkout(await getSql(), tenant.organizationId), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error && typeof error.status === "number"
        ? error.status
        : 503;
    return Response.json(
      {
        error:
          status === 503
            ? "Billing is temporarily unavailable."
            : error instanceof Error
              ? error.message
              : "Request rejected.",
      },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
