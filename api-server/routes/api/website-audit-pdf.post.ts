import { z } from "zod";

const schema = z.object({
  report: z.object({
    version: z.literal(1),
    recordId: z.string().trim().min(8).max(20),
    createdAt: z.string(),
    current: z.any(),
    benchmark: z.any(),
    offerings: z.array(z.tuple([z.string(), z.string()])),
    categories: z.array(z.object({ name: z.string(), detected: z.number(), total: z.number() })),
    methodology: z.string(),
    recommendations: z.array(z.any()),
  }),
});

export default async function websiteAuditPdf(event: { req: Request }) {
  const req = event.req;
  if (req.method.toUpperCase() !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });
  const { rateLimit } = await import("../../../src/lib/comparison-store");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`audit-pdf:${ip}`, 8)) return Response.json({ error: "Too many download requests." }, { status: 429 });
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "The report could not be turned into a PDF." }, { status: 400 });
  try {
    const { renderReviewPdf, reviewFilename } = await import("../../../src/lib/audit/render-review-pdf.server");
    const pdf = await renderReviewPdf(parsed.data.report);
    if (!pdf.subarray(0, 5).toString().startsWith("%PDF-")) throw new Error("renderer-did-not-return-pdf");
    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${reviewFilename(parsed.data.report)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[website-audit-pdf] failed", err instanceof Error ? err.message : "unknown");
    return Response.json({ error: "The PDF could not be generated. Please try again." }, { status: 500 });
  }
}
