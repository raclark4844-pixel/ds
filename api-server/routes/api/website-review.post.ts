export default async function websiteReview(event: { req: Request }) {
  const { handleWebsiteReview } = await import("../../../src/lib/website-review/handle-review.server");
  return handleWebsiteReview(event.req);
}
