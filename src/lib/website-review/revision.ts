import type { WebsiteReviewReport } from "./types";
export function isPdfRevisionRequest(message: string) {
  return (
    /\b(update|revise|modify|change|add|include|remove|replace|incorporate)\b/i.test(message) &&
    /\b(pdf|report|plan|recommendations)\b/i.test(message)
  );
}
export function revisedReport(report: WebsiteReviewReport, request: string, response: string) {
  const revisions = report.revisions || [];
  if (revisions.length >= 10)
    throw new Error("This report has reached 10 revisions. Generate a new review to continue.");
  return {
    ...report,
    revisions: [
      ...revisions,
      { number: revisions.length + 2, at: new Date().toISOString(), request, response },
    ],
    assistantBrief:
      `${report.assistantBrief}\nCustomer-requested revision: ${request}\nProposed updates: ${response}`.slice(
        -24000,
      ),
  };
}
