export default async function controlCenter(event: { req: Request }) {
  const { requireAdmin, adminErrorResponse } =
    await import("../../../../src/lib/admin-auth.server");
  try {
    await requireAdmin(event.req);
    const { capabilities } = await import("../../../../src/lib/control-capabilities");
    return Response.json(
      {
        mode: "Hosted specialist analysis and review; automatic lead routing",
        updatedAt: "2026-09-21",
        executionConnected: false,
        hostedAnalysisConnected: true,
        leadRoutingConnected: process.env.INBOX_AUTO_ROUTING_DISABLED !== "1",
        sites: [
          {
            id: "demore",
            name: "Demore Exterior Solutions",
            url: "https://demoreexteriorsolutions.com/",
            email: "ryan@demoreexteriorsolutions.com",
            platform: "Base44",
            status: "Existing Grok roles preserved; automatic inbox first-assignment connected; hosted specialist analysis/review available; external bot actions inactive",
          },
          {
            id: "demore-technology",
            name: "Demore Technology Solutions",
            url: "https://www.demoretechnologysolutions.com/",
            email: "ryan@demoretechnologysolutions.com",
            platform: "Vercel",
            status: "Hosted specialist analysis/review and automatic inbox assignment; website-writing connectors not connected",
          },
        ],
        capabilities,
        providers: ["OpenAI", "xAI Grok", "Anthropic Claude", "Base44"],
        gates: [
          "Low: automatic within configured permissions, with independent review and verification",
          "Medium: automatic after independent review and verification; no human approval required",
          "High/RED: human approval required; protected resources, customer messaging and production deployment retain high-risk gates",
        ],
        nextSteps: [
          "Configure hosted provider credentials. The shared ledger enforces $2/day and $40/month across both sites, including local carryover.",
          "Verify isolated lead capture, deduplication and CRM routing for both sites.",
          "Connect analytics and check real events before experiments or reporting claims.",
          "Validate consent and approved templates before email/SMS or social publishing.",
          "Verify phone handoffs, knowledge synchronization and uptime/error alert delivery.",
        ],
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const response = adminErrorResponse(error);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
}
