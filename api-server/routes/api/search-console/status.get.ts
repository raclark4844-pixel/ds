export default async function status(event: { req: Request }) {
  const url = new URL(event.req.url);
  const reportId = url.searchParams.get("reportId") || "";
  const { connectionStatus, googleConfigured } = await import("../../../../src/lib/search-console.server");
  const info = reportId ? await connectionStatus(reportId) : { status: googleConfigured() ? "authorization_required" : "unavailable", lastSuccess: null };
  return Response.json({
    reportId: reportId || null,
    configured: googleConfigured(),
    connected: info.status === "connected",
    status: info.status,
    lastSuccessfulRetrieval: info.lastSuccess,
  });
}
