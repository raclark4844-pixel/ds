import { z } from "zod";
import { analyzePage, makeReport, unavailableBenchmark } from "./analyze.ts";
import { fetchPublicPage, REFERENCE_URL } from "./fetch-public.ts";
import { industryLinks, normalizeIndustry, resolveIndustry } from "./industry.ts";
import { mintRecordId, normalizeRecordId } from "./record-id.ts";
import { issueReviewTicket } from "./ticket.ts";
import { normalizeWebsite } from "./url.ts";

const schema = z.object({
  url: z.string().trim().min(4).max(2048),
  industry: z.string().trim().max(120).optional(),
  record_id: z.string().trim().max(20).optional(),
  recordId: z.string().trim().max(20).optional(),
});

export async function handleWebsiteReview(req: Request) {
  if (req.method.toUpperCase() !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });
  const { rateLimit } = await import("@/lib/comparison-store");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`review:${ip}`, 4, 60_000) || !rateLimit(`review-hour:${ip}`, 20, 60 * 60 * 1000)) {
    return Response.json({ error: "Please wait a minute before reviewing another website." }, { status: 429 });
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Enter a valid public website address, such as example.com." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return Response.json({ error: "Enter a valid public website address, such as example.com, and keep the optional industry under 120 characters." }, { status: 400 });
  }
  let url: string;
  let manualIndustry = "";
  try {
    url = normalizeWebsite(parsed.data.url);
    manualIndustry = normalizeIndustry(parsed.data.industry || "");
  } catch {
    return Response.json({ error: "Enter a valid public website address, such as example.com, and keep the optional industry under 120 characters." }, { status: 400 });
  }
  const recordId = normalizeRecordId(parsed.data.record_id || parsed.data.recordId) || mintRecordId();
  const signal = AbortSignal.timeout(22000);
  const [site, reference] = await Promise.allSettled([
    fetchPublicPage(url, signal),
    fetchPublicPage(REFERENCE_URL, signal),
  ]);
  if (site.status !== "fulfilled") {
    return Response.json({
      error: "We could not inspect this public page. It may block automated requests, require JavaScript, or be unavailable. Try another page or contact Demore for a manual review.",
    }, { status: 422 });
  }
  const pages = [site.value];
  if (!manualIndustry && !signal.aborted) {
    const extra = await Promise.allSettled(industryLinks(site.value).map((link) => fetchPublicPage(link, signal)));
    for (const result of extra) {
      if (result.status === "fulfilled" && new URL(result.value.url).origin === new URL(site.value.url).origin) {
        pages.push(result.value);
      }
    }
  }
  const industry = resolveIndustry(manualIndustry, pages);
  const current = analyzePage(site.value);
  const benchmark = reference.status === "fulfilled"
    ? analyzePage(reference.value)
    : unavailableBenchmark(REFERENCE_URL);
  const report = makeReport(current, benchmark, recordId, industry);
  const token = issueReviewTicket(report);
  return Response.json({ ok: true, recordId, token, report }, { headers: { "Cache-Control": "no-store" } });
}
