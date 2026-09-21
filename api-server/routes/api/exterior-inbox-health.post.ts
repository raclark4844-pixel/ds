export default async function handler(event: { req: Request; waitUntil?: (promise:Promise<unknown>)=>void }) {
  const { requireExteriorBridge } = await import("../../../src/lib/exterior-lead-bridge");
  const { readLeadBody, leadErrorResponse } = await import("../../../src/lib/control-leads");
  try {
    requireExteriorBridge(event.req, process.env.DEMORE_LEAD_BRIDGE_SECRET);
    const body = await readLeadBody(event.req);
    const { getSql } = await import("../../../src/lib/db");
    const { saveHealth } = await import("../../../src/lib/inbox-health");
    const sql = await getSql();
    const result = await saveHealth(sql, body);
    // Mail failure must not fail the sync heartbeat or lead delivery.
    try {
      const { queueInboxAlert, deliverInboxAlert } = await import("../../../src/lib/inbox-alerts");
      await queueInboxAlert(sql, "Demore Control Center <projects@demorehomesolutions.com>");
      await deliverInboxAlert(sql, process.env.RESEND_API_KEY || "");
    } catch { console.error("[inbox-alert] Alert processing incomplete"); }
    const {runAutomation}=await import("../../../src/lib/workspace-automation");
    const background=runAutomation(sql).catch(()=>console.error("[automation] Scheduled worker failed"));
    const {retainBackgroundWork}=await import("../../../src/lib/background-work");
    await retainBackgroundWork(background);
    return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return leadErrorResponse(error); }
}
