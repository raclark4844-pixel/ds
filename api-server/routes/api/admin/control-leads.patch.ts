export default async function handler(event: { req: Request }) {
  const { requireAdmin, adminErrorResponse } =
    await import("../../../../src/lib/admin-auth.server");
  let actor;
  try {
    actor = await requireAdmin(event.req);
  } catch (e) {
    const r = adminErrorResponse(e);
    r.headers.set("Cache-Control", "private, no-store");
    return r;
  }
  const { routeLead, requireLeadOrigin, readLeadBody, leadErrorResponse } =
    await import("../../../../src/lib/control-leads");
  try {
    requireLeadOrigin(event.req);
    const body = await readLeadBody(event.req);
    const { getSql } = await import("../../../../src/lib/db");
    return Response.json(
      { item: await routeLead(await getSql(), body, actor.id) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return leadErrorResponse(e);
  }
}
