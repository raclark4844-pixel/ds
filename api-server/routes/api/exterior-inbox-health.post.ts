export default async function handler(event: { req: Request }) {
  const { requireExteriorBridge } = await import("../../../src/lib/exterior-lead-bridge");
  const { readLeadBody, leadErrorResponse } = await import("../../../src/lib/control-leads");
  try {
    requireExteriorBridge(event.req, process.env.DEMORE_LEAD_BRIDGE_SECRET);
    const body = await readLeadBody(event.req);
    const { getSql } = await import("../../../src/lib/db");
    const { saveHealth } = await import("../../../src/lib/inbox-health");
    return Response.json(await saveHealth(await getSql(), body), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return leadErrorResponse(error); }
}
