export default async function data(event: { req: Request }) {
  const url = new URL(event.req.url);
  const reportId = url.searchParams.get("reportId") || "";
  const token = url.searchParams.get("token") || "";
  const { fetchSearchConsoleSnapshot } = await import("../../../../src/lib/search-console.server");
  const { mergeSearchConsole } = await import("../../../../src/lib/comparison-store");
  const snapshot = await fetchSearchConsoleSnapshot(reportId, token);
  if (snapshot.status === "connected") await mergeSearchConsole(reportId, snapshot);
  return Response.json({ reportId, searchConsole: snapshot });
}
