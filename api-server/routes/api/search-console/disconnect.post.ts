export default async function disconnect(event: { req: Request }) {
  let raw: { reportId?: string; token?: string };
  try { raw = await event.req.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const { disconnectSearchConsole } = await import("../../../../src/lib/search-console.server");
  const ok = await disconnectSearchConsole(raw.reportId || "", raw.token || "");
  return Response.json({ ok });
}
