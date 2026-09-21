export default async function handler(event: { req: Request }) {
  const { requireAdmin, adminErrorResponse } = await import("../../../../src/lib/admin-auth.server");
  try { await requireAdmin(event.req); } catch (e) {
    const r = adminErrorResponse(e); r.headers.set("Cache-Control", "private, no-store"); return r;
  }
  const { leadErrorResponse } = await import("../../../../src/lib/control-leads");
  try {
    const { getSql } = await import("../../../../src/lib/db");
    const { readHealth } = await import("../../../../src/lib/inbox-health");
    const sql = await getSql();
    const { inboxAlertStatus } = await import("../../../../src/lib/inbox-alerts");
    return Response.json({ ...await readHealth(sql), alerts: await inboxAlertStatus(sql), emailConfigured: !!process.env.RESEND_API_KEY }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (e) { return leadErrorResponse(e); }
}
