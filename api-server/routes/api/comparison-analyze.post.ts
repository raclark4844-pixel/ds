import { z } from "zod";

const schema = z.object({
  companyName: z.string().trim().min(2).max(160),
  website: z.string().trim().min(4).max(300),
  industry: z.string().trim().min(2).max(80),
  market: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(120),
  contactEmail: z.string().trim().min(5).max(254).refine((v) => v.includes("@")),
  competitors: z.array(z.string().trim().max(300)).max(3).optional(),
  confirmedTools: z.string().trim().max(400).optional(),
  access: z.string().trim().max(80).optional(),
});

export default async function comparisonAnalyze(event: { req: Request }) {
  const req = event.req;
  if (req.method.toUpperCase() !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });
  const { rateLimit, createAccessToken, saveComparison } = await import("../../../src/lib/comparison-store");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(ip)) return Response.json({ error: "Too many comparison requests. Try again later." }, { status: 429 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Check the company, website, industry, market, name, and email." }, { status: 400 });
  const { buildComparisonReport } = await import("../../../src/lib/comparison-engine");
  const report = await buildComparisonReport({
    ...parsed.data,
    competitors: parsed.data.competitors || [],
    confirmedTools: parsed.data.confirmedTools || "",
    access: parsed.data.access || "",
  });
  const token = createAccessToken();
  saveComparison(report, token);
  return Response.json({ ok: true, reportId: report.reportNumber, token, report });
}
