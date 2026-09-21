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
  const { addLead, requireLeadOrigin, readLeadBody, leadErrorResponse } =
    await import("../../../../src/lib/control-leads");
  try {
    requireLeadOrigin(event.req);
    const body = await readLeadBody(event.req);
    const { getSql } = await import("../../../../src/lib/db");
    const result = await addLead(await getSql(), body, actor.id);
    return Response.json(result, {
      status: result.duplicate ? 200 : 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (e) {
    return leadErrorResponse(e);
  }
}
