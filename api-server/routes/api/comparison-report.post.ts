import { z } from "zod";
const schema = z.object({
  reportId: z.string().trim().min(8).max(40),
  token: z.string().trim().min(16).max(200000),
  email: z.boolean().optional(),
});
export default async function comparisonReport(event: { req: Request }) {
  const req = event.req;
  if (req.method.toUpperCase() !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });
  const { rateLimit, getAuthorizedComparison, patchStatus } = await import("../../../src/lib/comparison-store");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`pdf:${ip}`, 12)) return Response.json({ error: "Too many download requests." }, { status: 429 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Report access is invalid." }, { status: 400 });
  const record = await getAuthorizedComparison(parsed.data.reportId, parsed.data.token);
  if (!record) return Response.json({ error: "That report is not available." }, { status: 404 });
  try {
    const { renderComparisonPdf, reportFilename } = await import("../../../src/lib/report-pdf/render-report.server");
    const pdf = await renderComparisonPdf(record.report);
    if (!pdf.subarray(0, 5).toString().startsWith("%PDF-")) throw new Error("renderer-did-not-return-pdf");
    await patchStatus(record.id, { pdfStatus: "ok" });
    if (parsed.data.email) {
      const { sendReportEmails } = await import("../../../src/lib/report-mail");
      const mailed = await sendReportEmails(record.report, pdf);
      await patchStatus(record.id, {
        customerEmailStatus: mailed.customer.ok ? "ok" : "failed",
        internalEmailStatus: mailed.internal.ok ? "ok" : "failed",
      });
    }
    const filename = reportFilename(record.report);
    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Report-Id": record.id,
      },
    });
  } catch (err) {
    console.error("[comparison-report] pdf failed", err instanceof Error ? err.message : "unknown");
    await patchStatus(record.id, { pdfStatus: "failed" });
    return Response.json({ error: "The PDF could not be generated. Retry without losing the comparison." }, { status: 500 });
  }
}
