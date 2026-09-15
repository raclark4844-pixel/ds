export default async function callback(event: { req: Request }) {
  const url = new URL(event.req.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const { handleCallback } = await import("../../../../src/lib/search-console.server");
  const result = await handleCallback(code, state);
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  const dest = new URL("https://www.demoretechnologysolutions.com/compare");
  dest.searchParams.set("reportId", result.reportId);
  dest.searchParams.set("gsc", "connected");
  return Response.redirect(dest.toString(), 302);
}
