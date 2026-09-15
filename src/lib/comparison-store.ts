import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { CATEGORY_KEYS, DEFAULT_WEIGHTS, type ScoringWeights } from "@/lib/comparison";
import { getSql } from "@/lib/db";
import type { ComparisonReport } from "@/lib/report-pdf/report-types";

export type DeliveryStatus = "idle" | "ok" | "failed";
export type AdminStatus = "new" | "reviewing" | "contacted" | "closed";
export type StoredComparison = {
  id: string;
  tokenHash: string;
  report: ComparisonReport;
  pdfStatus: DeliveryStatus;
  customerEmailStatus: DeliveryStatus;
  internalEmailStatus: DeliveryStatus;
  adminStatus: AdminStatus;
  internalNotes: string;
  handoff: Record<string, unknown> | null;
  handoffStatus: "not_started" | "submitted" | "crm_sent" | "crm_failed";
  discoverySource: string;
  discoveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ScoringSettings = {
  weights: ScoringWeights;
  version: number;
  updatedBy: string;
  updatedAt: string;
};

type DbRow = {
  id: string;
  token_hash: string;
  report: ComparisonReport | string;
  pdf_status: DeliveryStatus;
  customer_email_status: DeliveryStatus;
  internal_email_status: DeliveryStatus;
  admin_status: AdminStatus;
  internal_notes: string;
  handoff: Record<string, unknown> | string | null;
  handoff_status: StoredComparison["handoffStatus"];
  discovery_source: string;
  discovered_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

function iso(value: string | Date | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

function toRecord(row: DbRow): StoredComparison {
  return {
    id: row.id,
    tokenHash: row.token_hash,
    report: typeof row.report === "string" ? JSON.parse(row.report) : row.report,
    pdfStatus: row.pdf_status,
    customerEmailStatus: row.customer_email_status,
    internalEmailStatus: row.internal_email_status,
    adminStatus: row.admin_status,
    internalNotes: row.internal_notes,
    handoff: typeof row.handoff === "string" ? JSON.parse(row.handoff) : row.handoff,
    handoffStatus: row.handoff_status,
    discoverySource: row.discovery_source,
    discoveredAt: iso(row.discovered_at),
    createdAt: iso(row.created_at) as string,
    updatedAt: iso(row.updated_at) as string,
  };
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function signingSecret() {
  return process.env.COMPARISON_SIGNING_SECRET || process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "demore-compare-signing-v1";
}

export function createReportId() {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `DTS-${day}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function issueReportTicket(report: ComparisonReport) {
  const body = Buffer.from(JSON.stringify({ v: 1, report }), "utf8").toString("base64url");
  const sig = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function issueHandoffToken(reportId: string) {
  return createHmac("sha256", signingSecret()).update(`handoff:${reportId}`).digest("base64url");
}

export function verifyHandoffToken(reportId: string, token: string) {
  const actual = Buffer.from(token);
  const wanted = Buffer.from(issueHandoffToken(reportId));
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}

export function readReportTicket(ticket: string): ComparisonReport | null {
  const dot = ticket.lastIndexOf(".");
  if (dot < 16) return null;
  const body = ticket.slice(0, dot);
  const expected = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  const actual = Buffer.from(ticket.slice(dot + 1));
  const wanted = Buffer.from(expected);
  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { report?: ComparisonReport };
    return parsed?.report?.reportNumber && parsed.report.companyName ? parsed.report : null;
  } catch {
    return null;
  }
}

function reportDiscovery(report: ComparisonReport) {
  const live = report.competitors.some((row) => row.source === "Google Maps" || row.source === "Google organic");
  return {
    source: live ? "DataForSEO live SERP" : report.competitors.some((row) => row.evidence === "Customer provided") ? "customer supplied" : "benchmark",
    at: live ? report.competitors.find((row) => row.discoveredAt)?.discoveredAt ?? new Date().toISOString() : null,
  };
}

export async function saveComparison(report: ComparisonReport, token: string): Promise<StoredComparison> {
  const sql = await getSql();
  const discovery = reportDiscovery(report);
  const rows = await sql.query<DbRow>(
    `insert into comparison_reports (id, token_hash, report, discovery_source, discovered_at)
     values ($1, $2, $3::jsonb, $4, $5)
     on conflict (id) do update set report = excluded.report, token_hash = excluded.token_hash,
       discovery_source = excluded.discovery_source, discovered_at = excluded.discovered_at, updated_at = now()
     returning *`,
    [report.reportNumber, hashToken(token), JSON.stringify(report), discovery.source, discovery.at],
  );
  return toRecord(rows[0]);
}

export async function getAuthorizedComparison(id: string, token: string): Promise<StoredComparison | null> {
  const sql = await getSql();
  const rows = await sql.query<DbRow>("select * from comparison_reports where id = $1", [id]);
  if (rows[0] && rows[0].token_hash === hashToken(token)) return toRecord(rows[0]);
  const fromTicket = readReportTicket(token);
  if (!fromTicket || fromTicket.reportNumber !== id) return null;
  return saveComparison(fromTicket, token);
}

export async function patchStatus(
  id: string,
  patch: Partial<Pick<StoredComparison, "pdfStatus" | "customerEmailStatus" | "internalEmailStatus">>,
) {
  const sql = await getSql();
  await sql.query(
    `update comparison_reports set pdf_status = coalesce($2, pdf_status),
       customer_email_status = coalesce($3, customer_email_status),
       internal_email_status = coalesce($4, internal_email_status), updated_at = now()
     where id = $1`,
    [id, patch.pdfStatus ?? null, patch.customerEmailStatus ?? null, patch.internalEmailStatus ?? null],
  );
}

export async function recordProjectHandoff(
  id: string,
  handoff: Record<string, unknown>,
  status: StoredComparison["handoffStatus"] = "submitted",
) {
  const sql = await getSql();
  const rows = await sql.query<DbRow>(
    `update comparison_reports
       set handoff = $2::jsonb, handoff_status = $3, updated_at = now()
     where id = $1 returning *`,
    [id, JSON.stringify({ ...handoff, reportId: id }), status],
  );
  return rows[0] ? toRecord(rows[0]) : null;
}

export async function listComparisons(status?: AdminStatus, limit = 50, offset = 0) {
  const sql = await getSql();
  const params: unknown[] = status ? [status] : [];
  const where = status ? "where admin_status = $1" : "";
  const limitParam = params.length + 1;
  const offsetParam = params.length + 2;
  params.push(Math.min(100, Math.max(1, limit)), Math.max(0, offset));
  const rows = await sql.query<DbRow>(
    `select * from comparison_reports ${where} order by created_at desc limit $${limitParam} offset $${offsetParam}`,
    params,
  );
  const counts = await sql.query<{ count: number }>(
    `select count(*)::bigint as count from comparison_reports ${where}`,
    status ? [status] : [],
  );
  return { items: rows.map(toRecord), total: counts[0]?.count ?? 0 };
}

export async function updateComparisonAdmin(id: string, status: AdminStatus, notes: string) {
  const sql = await getSql();
  const rows = await sql.query<DbRow>(
    "update comparison_reports set admin_status = $2, internal_notes = $3, updated_at = now() where id = $1 returning *",
    [id, status, notes.slice(0, 10000)],
  );
  return rows[0] ? toRecord(rows[0]) : null;
}

function validWeights(value: unknown): value is ScoringWeights {
  if (!value || typeof value !== "object") return false;
  const weights = value as Record<string, unknown>;
  return CATEGORY_KEYS.every((key) => Number.isInteger(weights[key]) && Number(weights[key]) >= 0 && Number(weights[key]) <= 100)
    && CATEGORY_KEYS.reduce((sum, key) => sum + Number(weights[key]), 0) === 100;
}

export function assertScoringWeights(value: unknown): ScoringWeights {
  if (!validWeights(value)) throw new Error("Scoring weights must be whole numbers from 0–100 and total exactly 100.");
  return value;
}

export async function getScoringSettings(): Promise<ScoringSettings> {
  const sql = await getSql();
  const rows = await sql.query<{ weights: ScoringWeights | string; version: number; updated_by: string; updated_at: string | Date }>(
    "select weights, version, updated_by, updated_at from comparison_scoring_settings where id = 'active'",
  );
  if (!rows[0]) return { weights: { ...DEFAULT_WEIGHTS }, version: 0, updatedBy: "system default", updatedAt: new Date(0).toISOString() };
  const weights = typeof rows[0].weights === "string" ? JSON.parse(rows[0].weights) : rows[0].weights;
  return { weights: validWeights(weights) ? weights : { ...DEFAULT_WEIGHTS }, version: rows[0].version, updatedBy: rows[0].updated_by, updatedAt: iso(rows[0].updated_at) as string };
}

export async function updateScoringSettings(weights: ScoringWeights, updatedBy: string): Promise<ScoringSettings> {
  assertScoringWeights(weights);
  const sql = await getSql();
  const rows = await sql.query<{ version: number; updated_at: string | Date }>(
    `with saved as (
       insert into comparison_scoring_settings (id, weights, version, updated_by)
       values ('active', $1::jsonb, 1, $2)
       on conflict (id) do update set weights = excluded.weights,
         version = comparison_scoring_settings.version + 1, updated_by = excluded.updated_by, updated_at = now()
       returning version, weights, updated_by, updated_at
     ), revision as (
       insert into comparison_scoring_revisions (version, weights, updated_by, updated_at)
       select version, weights, updated_by, updated_at from saved
     ) select version, updated_at from saved`,
    [JSON.stringify(weights), updatedBy],
  );
  return { weights, version: rows[0].version, updatedBy, updatedAt: iso(rows[0].updated_at) as string };
}

const hits = new Map<string, number[]>();
export function rateLimit(ip: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((time) => now - time < windowMs);
  if (list.length >= limit) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}
