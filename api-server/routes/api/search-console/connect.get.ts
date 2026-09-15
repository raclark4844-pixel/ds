export default async function connect(event: { req: Request }) {
  const url = new URL(event.req.url);
  const reportId = url.searchParams.get("reportId") || "";
  const token = url.searchParams.get("token") || "";
  const { startConnect } = await import("../../../../src/lib/search-console.server");
  const result = await startConnect(reportId, token);
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.redirect(result.url, 302);
}
