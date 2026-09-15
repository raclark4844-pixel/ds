export default async function updateScoringWeights(event: { req: Request }) {
  const { adminErrorResponse, requireAdmin } = await import("../../../../src/lib/admin-auth.server");
  try {
    const admin = await requireAdmin(event.req);
    const body = await event.req.json() as { weights?: unknown };
    const { assertScoringWeights, updateScoringSettings } = await import("../../../../src/lib/comparison-store");
    const weights = assertScoringWeights(body.weights);
    return Response.json(await updateScoringSettings(weights, admin.email));
  } catch (error) {
    return adminErrorResponse(error);
  }
}
