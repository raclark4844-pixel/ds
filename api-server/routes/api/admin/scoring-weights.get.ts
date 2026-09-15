export default async function scoringWeights(event: { req: Request }) {
  const { adminErrorResponse, requireAdmin } = await import("../../../../src/lib/admin-auth.server");
  try {
    await requireAdmin(event.req);
    const { getScoringSettings } = await import("../../../../src/lib/comparison-store");
    return Response.json(await getScoringSettings(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
