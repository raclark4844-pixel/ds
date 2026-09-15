import { getSql } from "@/lib/db";
import { getAuthorizedComparison } from "@/lib/comparison-store";
import { readOauthState, signOauthState } from "@/lib/oauth-state";

export type SearchConsoleStatus =
  | "configured"
  | "connected"
  | "quota_error"
  | "authorization_required"
  | "unavailable";

export type SearchConsoleSnapshot = {
  status: SearchConsoleStatus;
  propertyUrl?: string | null;
  lastSuccess?: string | null;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
  message?: string;
};

type ConnectionRow = {
  report_id: string;
  google_sub: string;
  property_url: string | null;
  token_blob: string;
  last_success_at: string | Date | null;
  last_status: SearchConsoleStatus;
};

function iso(value: string | Date | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
}

function redirectUri() {
  return (
    process.env.GOOGLE_REDIRECT_URI?.trim() ||
    "https://www.demoretechnologysolutions.com/api/search-console/callback"
  );
}

async function loadConnection(reportId: string) {
  try {
    const sql = await getSql();
    const rows = await sql.query<ConnectionRow>(
      "select report_id, google_sub, property_url, token_blob, last_success_at, last_status from search_console_connections where report_id = $1",
      [reportId],
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function startConnect(reportId: string, token: string) {
  if (!googleConfigured()) return { error: "Google Search Console is not configured.", status: 503 as const };
  if (!reportId || !token) return { error: "Report id and token are required.", status: 400 as const };
  const row = await getAuthorizedComparison(reportId, token);
  if (!row) return { error: "Report not found or token invalid.", status: 401 as const };
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    access_type: "offline",
    prompt: "consent",
    state: signOauthState(reportId),
  });
  return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` };
}

export async function handleCallback(code: string, state: string) {
  if (!googleConfigured()) return { error: "Google Search Console is not configured.", status: 503 as const };
  const parsed = readOauthState(state);
  if (!parsed?.reportId) return { error: "OAuth state is invalid or expired.", status: 400 as const };
  if (!code) return { error: "Missing authorization code.", status: 400 as const };
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!.trim(),
        client_secret: process.env.GOOGLE_CLIENT_SECRET!.trim(),
        redirect_uri: redirectUri(),
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return { error: "Google token exchange failed.", status: 502 as const };
    const tokens = (await tokenRes.json()) as { access_token?: string; refresh_token?: string };
    const sql = await getSql();
    await sql.query(
      `insert into search_console_connections (report_id, google_sub, property_url, token_blob, last_status)
       values ($1, '', null, $2, 'authorization_required')
       on conflict (report_id) do update set token_blob = excluded.token_blob, last_status = 'authorization_required', updated_at = now()`,
      [parsed.reportId, JSON.stringify(tokens)],
    );
    return { reportId: parsed.reportId };
  } catch {
    return { error: "Could not store Search Console connection.", status: 500 as const };
  }
}

export async function disconnectSearchConsole(reportId: string, token: string) {
  const row = await getAuthorizedComparison(reportId, token);
  if (!row) return false;
  try {
    const sql = await getSql();
    await sql.query("delete from search_console_connections where report_id = $1", [reportId]);
    return true;
  } catch {
    return false;
  }
}

export async function connectionStatus(reportId: string) {
  if (!googleConfigured()) return { status: "unavailable" as const, lastSuccess: null as string | null };
  const row = await loadConnection(reportId);
  if (!row) return { status: "authorization_required" as const, lastSuccess: null as string | null };
  return { status: row.last_status || "authorization_required", lastSuccess: iso(row.last_success_at) };
}

export async function fetchSearchConsoleSnapshot(reportId: string, token: string): Promise<SearchConsoleSnapshot> {
  if (!googleConfigured()) {
    return { status: "unavailable", message: "Google Search Console is not configured." };
  }
  const authorized = await getAuthorizedComparison(reportId, token);
  if (!authorized) return { status: "authorization_required", message: "Report token is invalid." };
  const row = await loadConnection(reportId);
  if (!row?.token_blob) return { status: "authorization_required", lastSuccess: null };
  return {
    status: row.last_status === "connected" ? "connected" : "authorization_required",
    propertyUrl: row.property_url,
    lastSuccess: iso(row.last_success_at),
  };
}
