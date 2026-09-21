export default async function reviewAccess(event: { req: Request }) {
  const { requireAdmin } = await import("../../../../src/lib/admin-auth.server");
  try {
    await requireAdmin(event.req);
    return Response.json({ canSkipContact: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ canSkipContact: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
