import { z } from "zod";
import { unifiedIds } from "../../../src/lib/unified-ids";

const schema = z.object({
  companyName: z.string().trim().min(2).max(160),
  website: z.string().trim().min(4).max(300),
  industry: z.string().trim().min(2).max(80),
  market: z.string().trim().min(2).max(160),
  contactFirstName: z.string().trim().min(1).max(80),
  contactLastName: z.string().trim().min(1).max(80),
  contactPhone: z.string().trim().min(7).max(40),
  contactEmail: z.string().trim().min(5).max(254).refine((v) => v.includes("@")),
  timeframe: z.string().trim().min(2).max(120),
  competitors: z.array(z.string().trim().max(300)).max(3).optional(),
  confirmedTools: z.string().trim().max(400).optional(),
  access: z.string().trim().max(80).optional(),
  domainRegistrar: z.string().trim().max(120).optional(),
  websiteHost: z.string().trim().max(120).optional(),
  siteBuilder: z.string().trim().max(160).optional(),
  codeAccess: z.string().trim().max(80).optional(),
});

export default async function comparisonAnalyze(event: { req: Request }) {
  const req = event.req;
  if (req.method.toUpperCase() !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });
  const { rateLimit, issueHandoffToken, issueReportTicket, saveComparison } = await import("../../../src/lib/comparison-store");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) return Response.json({ error: "Too many comparison requests. Try again later." }, { status: 429 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Check the company, website, industry, market, name, and email." }, { status: 400 });
  const { buildComparisonReport } = await import("../../../src/lib/comparison-engine");
  const report = await buildComparisonReport({
    ...parsed.data,
    contactName: `${parsed.data.contactFirstName} ${parsed.data.contactLastName}`,
    competitors: parsed.data.competitors || [],
    confirmedTools: parsed.data.confirmedTools || "",
    access: parsed.data.access || "",
    domainRegistrar: parsed.data.domainRegistrar || "",
    websiteHost: parsed.data.websiteHost || "",
    siteBuilder: parsed.data.siteBuilder || "",
    codeAccess: parsed.data.codeAccess || "",
  });
  const token = issueReportTicket(report);
  await saveComparison(report, token);
  const ids = unifiedIds(report.reportNumber);
  return Response.json({
    ok: true,
    ...ids,
    token,
    handoffToken: issueHandoffToken(report.reportNumber),
    report,
  });
}
