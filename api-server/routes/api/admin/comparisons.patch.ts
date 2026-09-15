import { z } from "zod";

const schema = z.object({
  id: z.string().trim().min(8).max(40),
  status: z.enum(["new", "reviewing", "contacted", "closed"]),
  notes: z.string().max(10000).default(""),
});

export default async function updateAdminComparison(event: { req: Request }) {
  const { adminErrorResponse, requireAdmin } = await import("../../../../src/lib/admin-auth.server");
  try {
    await requireAdmin(event.req);
    const parsed = schema.parse(await event.req.json());
    const { updateComparisonAdmin } = await import("../../../../src/lib/comparison-store");
    const item = await updateComparisonAdmin(parsed.id, parsed.status, parsed.notes);
    if (!item) return Response.json({ error: "Comparison not found." }, { status: 404 });
    return Response.json({ ok: true, item });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
