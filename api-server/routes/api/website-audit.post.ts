import { z } from "zod";

const schema = z.object({
  url: z.string().trim().min(4).max(2048),
  recordId: z.string().trim().max(20).optional(),
});

export default async function websiteAudit(event: { req: Request }) {
  const req = event.req;
  if (req.method.toUpperCase() !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });
  const { rateLimit } = await import("../../../src/lib/comparison-store");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`audit:${ip}`, 8)) return Response.json({ error: "Please wait a minute before reviewing another website." }, { status: 429 });
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Enter a valid public website address." }, { status: 400 });
  const { normalizeWebsite } = await import("../../../src/lib/audit/url");
  const { normalizeRecordId, mintRecordId } = await import("../../../src/lib/audit/record");
  const { analyzePage, makeReport, unavailableProfile } = await import("../../../src/lib/audit/analyze");
  let url: string;
  try {
    url = normalizeWebsite(parsed.data.url);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Enter a valid public website address." }, { status: 400 });
  }
  const referenceSite = "https://demoreexteriorsolutions.com/";
  const { fetchPublicPage } = await import("../../../src/lib/audit/fetch.server");
  const signal = AbortSignal.timeout(22000);
  const [site, reference] = await Promise.allSettled([
    fetchPublicPage(url, signal),
    fetchPublicPage(referenceSite, signal),
  ]);
  if (site.status !== "fulfilled") {
    return Response.json({
      error:
        "We could not inspect this public page. It may block automated requests, require JavaScript, or be unavailable. Try another page or file a project for a manual review.",
    }, { status: 422 });
  }
  const current = analyzePage(site.value);
  const benchmark =
    reference.status === "fulfilled"
      ? analyzePage(reference.value)
      : unavailableProfile(referenceSite, "Demore Exterior Solutions");
  const report = makeReport(current, benchmark, normalizeRecordId(parsed.data.recordId) || mintRecordId());
  return Response.json({ ok: true, report });
}
