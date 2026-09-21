import { z } from "zod";
import { publicContacts, reviewContactSchema } from "./contact";
import { analyzePage, makeReport, unavailableBenchmark } from "./analyze.ts";
import { fetchPublicFile, fetchPublicPage, REFERENCE_URL } from "./fetch-public.ts";
import { industryLinks, normalizeIndustry, resolveIndustry } from "./industry.ts";
import { mintRecordId, normalizeRecordId } from "./record-id.ts";
import { issueReviewTicket } from "./ticket.ts";
import type { PublicFiles } from "./types.ts";
import { normalizeWebsite } from "./url.ts";

const schema = z.object({
  contact: reviewContactSchema.optional(),
  skipContact: z.boolean().optional(),
  url: z.string().trim().min(4).max(2048),
  industry: z.string().trim().max(120).optional(),
  record_id: z.string().trim().max(20).optional(),
  recordId: z.string().trim().max(20).optional(),
});

async function publicFiles(origin: string, signal: AbortSignal): Promise<PublicFiles> {
  const extras: PublicFiles = {};
  const [robots, sitemap, llms] = await Promise.allSettled([
    fetchPublicFile(`${origin}/robots.txt`, signal),
    fetchPublicFile(`${origin}/sitemap.xml`, signal),
    fetchPublicFile(`${origin}/llms.txt`, signal),
  ]);
  if (robots.status === "fulfilled") extras.robots = robots.value.html;
  if (sitemap.status === "fulfilled") extras.sitemap = sitemap.value.html;
  if (llms.status === "fulfilled") extras.llms = llms.value.html;
  return extras;
}

export async function handleWebsiteReview(req: Request) {
  if (req.method.toUpperCase() !== "POST")
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  const { rateLimit } = await import("@/lib/comparison-store");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (
    !rateLimit(`review:${ip}`, 4, 60_000) ||
    !rateLimit(`review-hour:${ip}`, 20, 60 * 60 * 1000)
  ) {
    return Response.json(
      { error: "Please wait a minute before reviewing another website." },
      { status: 429 },
    );
  }
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json(
      { error: "Enter a valid public website address, such as example.com." },
      { status: 400 },
    );
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Enter a valid website, your name, company name, phone, and email.",
      },
      { status: 400 },
    );
  }
  let ownerReview = false;
  if (parsed.data.skipContact) {
    const { requireAdmin } = await import("@/lib/admin-auth.server");
    try {
      await requireAdmin(req);
      ownerReview = true;
    } catch {
      return Response.json(
        { error: "Sign in as administrator to skip contact details." },
        { status: 403 },
      );
    }
  }
  if (!ownerReview && !parsed.data.contact)
    return Response.json(
      {
        error: "Please enter your name, company name, phone, and email before generating a report.",
      },
      { status: 400 },
    );
  let url: string;
  let manualIndustry = "";
  try {
    url = normalizeWebsite(parsed.data.url);
    manualIndustry = normalizeIndustry(parsed.data.industry || "");
  } catch {
    return Response.json(
      {
        error: "Enter a valid website, your name, company name, phone, and email.",
      },
      { status: 400 },
    );
  }
  const recordId =
    normalizeRecordId(parsed.data.record_id || parsed.data.recordId) || mintRecordId();
  const signal = AbortSignal.timeout(22000);
  const [site, reference] = await Promise.allSettled([
    fetchPublicPage(url, signal),
    fetchPublicPage(REFERENCE_URL, signal),
  ]);
  if (site.status !== "fulfilled") {
    return Response.json(
      {
        error:
          "We could not inspect this public page. It may block automated requests, require JavaScript, or be unavailable. Try another page or contact Demore for a manual review.",
      },
      { status: 422 },
    );
  }
  const pages = [site.value];
  if (!manualIndustry && !signal.aborted) {
    const extra = await Promise.allSettled(
      industryLinks(site.value).map((link) => fetchPublicPage(link, signal)),
    );
    for (const result of extra) {
      if (
        result.status === "fulfilled" &&
        new URL(result.value.url).origin === new URL(site.value.url).origin
      ) {
        pages.push(result.value);
      }
    }
  }
  const origin = new URL(site.value.url).origin;
  const [currentFiles, referenceFiles] = await Promise.all([
    publicFiles(origin, signal),
    reference.status === "fulfilled"
      ? publicFiles(new URL(reference.value.url).origin, signal)
      : Promise.resolve({} as PublicFiles),
  ]);
  const industry = resolveIndustry(manualIndustry, pages);
  const current = analyzePage({ ...site.value, extras: currentFiles });
  const benchmark =
    reference.status === "fulfilled"
      ? analyzePage({ ...reference.value, extras: referenceFiles })
      : unavailableBenchmark(REFERENCE_URL);
  const report = makeReport(current, benchmark, recordId, industry);
  report.contact = ownerReview ? undefined : parsed.data.contact;
  report.ownerReview = ownerReview;
  report.publicContacts = publicContacts(pages);
  const token = issueReviewTicket(report);
  return Response.json(
    { ok: true, recordId, token, report, assistantBrief: report.assistantBrief },
    { headers: { "Cache-Control": "no-store" } },
  );
}
