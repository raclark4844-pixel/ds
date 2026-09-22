import { z } from "zod";
import { readReviewTicket, issueReviewTicket } from "../../../src/lib/website-review/ticket";
import { revisedReport } from "../../../src/lib/website-review/revision";
import { runAssistant, assistantRateLimit } from "../../../src/lib/assistant.server";
const schema = z.object({
  recordId: z.string().max(20),
  token: z.string().max(400000),
  message: z.string().trim().min(1).max(3000),
  industries: z.array(z.string().max(120)).max(20).optional(),
});
export default async function revise(event: { req: Request }) {
  const parsed = schema.safeParse(await event.req.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "Enter the changes you want and generate a website review first." },
      { status: 400 },
    );
  const report = readReviewTicket(parsed.data.token);
  if (!report || report.recordId !== parsed.data.recordId || (!report.contact && !report.ownerReview))
    return Response.json(
      { error: "Generate a website review with your contact details first." },
      { status: 403 },
    );
  const ip = event.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!assistantRateLimit(ip))
    return Response.json({ error: "Please wait before updating another report." }, { status: 429 });
  if ((report.revisions?.length || 0) >= 10)
    return Response.json(
      { error: "This report has reached 10 revisions. Generate a new review to continue." },
      { status: 400 },
    );
  const { billTenantAiIfPresent, TenantSpendCapError } = await import(
    "../../../src/lib/billing/process-billed-ai-request.server"
  );
  let result;
  try {
    result = await billTenantAiIfPresent(
      event.req,
      "website-review-revise",
      () =>
        runAssistant({
          message: `Prepare the revised recommendations for this website improvement PDF based on this customer request: ${parsed.data.message}. Explain the resulting changes directly. Treat additions and corrections as customer-provided information, not new scanned findings. Return only the revised improvement recommendations, consolidating prior requested changes with this request. Do not discuss PDF generation, email delivery, download links, or what the application can or cannot do.`,
          industries: parsed.data.industries,
          reviewBrief: report.assistantBrief,
          reportId: report.recordId,
        }),
      (outcome) => ({
        rawCostMicrodollars: Math.max(1, Math.ceil(((outcome.text || "").length || 1) / 4)),
        provider: "xai",
        model: outcome.model,
      }),
    );
  } catch (error) {
    if (error instanceof TenantSpendCapError) {
      return Response.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
  if (!result.ok || result.endpoint === "local")
    return Response.json(
      {
        error:
          "The live assistant could not revise the report. Your previous PDF is still available. Please retry.",
      },
      { status: 503 },
    );
  const updated = revisedReport(report, parsed.data.message, result.text.slice(0, 12000));
  return Response.json(
    {
      recordId: updated.recordId,
      token: issueReviewTicket(updated),
      brief: updated.assistantBrief,
      revision: (updated.revisions?.length || 0) + 1,
      text: result.text,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
