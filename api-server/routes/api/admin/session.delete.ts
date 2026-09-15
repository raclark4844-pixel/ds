export default async function clearAdminSession() {
  const { clearAdminAccessCookie } = await import("../../../../src/lib/admin-auth.server");
  return Response.json({ ok: true }, { headers: { "Set-Cookie": clearAdminAccessCookie(), "Cache-Control": "no-store" } });
}
