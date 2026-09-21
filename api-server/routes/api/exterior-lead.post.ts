export default async function handler(event: { req: Request }) {
  const { requireExteriorBridge, captureExteriorLead } =
    await import("../../../src/lib/exterior-lead-bridge");
  const { readLeadBody, leadErrorResponse } = await import("../../../src/lib/control-leads");
  try {
    requireExteriorBridge(event.req, process.env.DEMORE_LEAD_BRIDGE_SECRET);
    const body = await readLeadBody(event.req);
    const { getSql } = await import("../../../src/lib/db");
    const result = await captureExteriorLead(await getSql(), body);
    return Response.json(result, {
      status: result.duplicate ? 200 : 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return leadErrorResponse(error);
  }
}
