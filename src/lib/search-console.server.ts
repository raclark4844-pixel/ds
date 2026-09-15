export type SearchConsoleStatus =
  | "configured"
  | "connected"
  | "quota_error"
  | "authorization_required"
  | "unavailable";

export type SearchConsoleSnapshot = {
  status: SearchConsoleStatus;
  lastSuccess: string | null;
};

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export async function startConnect(reportId: string, token: string) {
  if (!reportId || !token) return { error: "Missing report credentials.", status: 400 };
  if (!googleConfigured()) return { error: "Google Search Console is not configured.", status: 503 };
  return { error: "Search Console connect is not available yet.", status: 503 };
}

export async function handleCallback(_code: string, _state: string) {
  return { error: "Search Console connect is not available yet.", status: 503 };
}

export async function fetchSearchConsoleSnapshot(
  _reportId: string,
  _token: string,
): Promise<SearchConsoleSnapshot> {
  return { status: "unavailable", lastSuccess: null };
}

export async function disconnectSearchConsole(_reportId: string, _token: string) {
  return false;
}

export async function connectionStatus(_reportId: string): Promise<SearchConsoleSnapshot> {
  return {
    status: googleConfigured() ? "authorization_required" : "unavailable",
    lastSuccess: null,
  };
}
