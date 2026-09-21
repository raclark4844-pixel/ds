export default async function handler(event: { req: Request }) {
  const { requireAdmin, adminErrorResponse } =
    await import("../../../../src/lib/admin-auth.server");
  try {
    await requireAdmin(event.req);
  } catch (e) {
    const r = adminErrorResponse(e);
    r.headers.set("Cache-Control", "private, no-store");
    return r;
  }
  const { listLeads, leadHistory, leadErrorResponse } =
    await import("../../../../src/lib/control-leads");
  try {
    const url = new URL(event.req.url);
    const { getSql } = await import("../../../../src/lib/db");
    const sql = await getSql();
    return Response.json(
      url.searchParams.has("leadId")
        ? {
            events: await leadHistory(
              sql,
              url.searchParams.get("siteId"),
              url.searchParams.get("leadId"),
            ),
          }
        : await listLeads(sql, url.searchParams.get("siteId")),
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return leadErrorResponse(e);
  }
}
