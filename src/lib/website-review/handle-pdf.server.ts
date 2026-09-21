import { z } from "zod";
import { renderWebsiteReviewPdf, websiteReviewFilename } from "./render-pdf.server";
import { readReviewTicket } from "./ticket.ts";

const schema = z.object({
  recordId: z.string().trim().min(8).max(20),
  token: z.string().trim().min(16).max(400000),
});

export async function handleWebsiteReviewPdf(req: Request) {
  if (req.method.toUpperCase() !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });
  const { rateLimit } = await import("@/lib/comparison-store");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`review-pdf:${ip}`, 12)) return Response.json({ error: "Too many download requests." }, { status: 429 });
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Report access is invalid." }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Report access is invalid." }, { status: 400 });
  const report = readReviewTicket(parsed.data.token);
  if (!report || report.recordId !== parsed.data.recordId) {
    return Response.json({ error: "That report is not available." }, { status: 404 });
  }
  try {
    const pdf = await renderWebsiteReviewPdf(report);
    if (!pdf.subarray(0, 5).toString().startsWith("%PDF-")) throw new Error("renderer-did-not-return-pdf");
    const filename = websiteReviewFilename(report.recordId);
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Report-Id": report.recordId,
      },
    });
  } catch (err) {
    console.error("[website-review-report] pdf failed", err instanceof Error ? err.message : "unknown");
    return Response.json({ error: "The PDF could not be generated. Retry without losing the review." }, { status: 500 });
  }
}
