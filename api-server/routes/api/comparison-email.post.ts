import { z } from "zod";
const schema = z.object({
  reportId: z.string().trim().min(8).max(40),
  token: z.string().trim().min(16).max(80),
  target: z.enum(["customer", "internal", "both"]).optional(),
});
export default async function comparisonEmail(event: { req: Request }) {
  const req = event.req;
  if (req.method.toUpperCase() !== "POST") return Response.json({ error: "Method not allowed." }, { status: 405 });
  const { getAuthorizedComparison, patchStatus, rateLimit } = await import("../../../src/lib/comparison-store");
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`mail:${ip}`, 8)) return Response.json({ error: "Too many email retries." }, { status: 429 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Report access is invalid." }, { status: 400 });
  const record = getAuthorizedComparison(parsed.data.reportId, parsed.data.token);
  if (!record) return Response.json({ error: "That report is not available." }, { status: 404 });
  try {
    const { renderComparisonPdf } = await import("../../../src/lib/report-pdf/render-report.server");
    const { sendReportEmails } = await import("../../../src/lib/report-mail");
    const pdf = await renderComparisonPdf(record.report);
    const mailed = await sendReportEmails(record.report, pdf);
    patchStatus(record.id, {
      pdfStatus: "ok",
      customerEmailStatus: mailed.customer.ok ? "ok" : "failed",
      internalEmailStatus: mailed.internal.ok ? "ok" : "failed",
    });
    return Response.json({
      ok: mailed.customer.ok || mailed.internal.ok,
      customerEmail: mailed.customer.ok,
      internalEmail: mailed.internal.ok,
      customerError: mailed.customer.ok ? undefined : mailed.customer.error,
      internalError: mailed.internal.ok ? undefined : mailed.internal.error,
    });
  } catch {
    patchStatus(record.id, { customerEmailStatus: "failed", internalEmailStatus: "failed" });
    return Response.json({ error: "Email retry failed. The comparison is still saved." }, { status: 502 });
  }
}
