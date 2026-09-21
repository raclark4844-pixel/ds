export default async function websiteReviewReport(event: { req: Request }) {
  const { handleWebsiteReviewPdf } = await import("../../../src/lib/website-review/handle-pdf.server");
  return handleWebsiteReviewPdf(event.req);
}
