export type ActiveReview = { recordId: string; token: string; brief: string; revision: number };
export type ReviewDownload = { href: string; filename: string; recordId: string; revision: number };
let current: ActiveReview | null = null;
let download: ReviewDownload | null = null;
export function activeReview() {
  return current;
}
export function latestReviewDownload() {
  return download;
}
export function registerReview(review: ActiveReview) {
  current = review;
}
export async function downloadReview(review: ActiveReview) {
  const response = await fetch("/api/website-review-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recordId: review.recordId, token: review.token }),
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Unable to generate the PDF. Please retry.");
  }
  const blob = await response.blob();
  if ((await blob.slice(0, 5).text()) !== "%PDF-")
    throw new Error("The server did not return a PDF.");
  download = {
    href: URL.createObjectURL(blob),
    filename: `Demore-${review.recordId}-v${review.revision}.pdf`,
    recordId: review.recordId,
    revision: review.revision,
  };
  current = review;
  // Keep earlier version URLs valid for their attachments until this page closes.
  window.dispatchEvent(
    new CustomEvent("demore:pdf-ready", { detail: { ...download, brief: review.brief } }),
  );
  return download;
}
