import { z } from "zod";

const querySchema = z.object({
  status: z.enum(["new", "reviewing", "contacted", "closed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export default async function adminComparisons(event: { req: Request }) {
  const { adminErrorResponse, requireAdmin } = await import("../../../../src/lib/admin-auth.server");
  try {
    await requireAdmin(event.req);
    const url = new URL(event.req.url);
    const parsed = querySchema.parse(Object.fromEntries(url.searchParams));
    const { listComparisons } = await import("../../../../src/lib/comparison-store");
    const result = await listComparisons(parsed.status, parsed.limit, parsed.offset);
    const items = result.items.map(({ tokenHash: _tokenHash, ...item }) => item);
    return Response.json({ items, total: result.total }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
