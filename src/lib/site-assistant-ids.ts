const KEY = "demore-report-id";

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
