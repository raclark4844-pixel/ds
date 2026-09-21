const KEY = "demore-report-id";
const BRIEF_KEY = "demore-review-brief";

export function readStoredReportId() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function storeReportId(reportId: string) {
  const id = reportId.trim();
  if (!id) return;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* ignore */
  }
}

export function readStoredReviewBrief() {
  try {
    return localStorage.getItem(BRIEF_KEY) || "";
  } catch {
    return "";
  }
}

export function storeReviewBrief(brief: string) {
  const text = brief.trim().slice(0, 8000);
  try {
    if (text) localStorage.setItem(BRIEF_KEY, text);
    else localStorage.removeItem(BRIEF_KEY);
  } catch {
    /* ignore */
  }
}
