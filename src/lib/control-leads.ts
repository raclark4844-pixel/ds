import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import type { Sql } from "./db";
type LeadSql = Pick<Sql, "query">;
export const siteSchema = z.enum(["demore", "demore-technology"]);
export const leadSchema = z
  .object({
    siteId: siteSchema,
    source: z.enum(["manual", "website-test", "website-brief", "base44-contact", "comparison-report"]),
    sourceRecordId: z.string().trim().min(8).max(100),
    name: z.string().trim().min(2).max(120),
    email: z
      .union([z.literal(""), z.string().trim().email().max(254)])
      .default("")
      .transform((s) => s.toLowerCase()),
    phone: z
      .string()
      .trim()
      .max(40)
      .default("")
      .refine((s) => !s || s.replace(/\D/g, "").length >= 7, "Enter a valid phone number."),
    interest: z.string().trim().max(2000).default(""),
  })
  .strict()
  .refine((s) => s.email || s.phone, "Email or phone is required.");
export const routeSchema = z
  .object({
    siteId: siteSchema,
    id: z.string().uuid(),
    version: z.number().int().positive(),
    stage: z.enum(["new", "qualified", "contacted", "won", "lost"]),
    owner: z.enum(["unassigned", "ryan"]),
  })
  .strict();
export class LeadError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export function requireLeadOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const allowed = [
    "https://www.demoretechnologysolutions.com",
    "https://demoretechnologysolutions.com",
  ];
  if (process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1")
    allowed.push("http://127.0.0.1:4320", "http://localhost:4320");
  if (!origin || !allowed.includes(origin)) throw new LeadError(403, "Same-site request required.");
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw new LeadError(415, "JSON required.");
}
export async function readLeadBody(req: Request) {
  const reader = req.body?.getReader();
  if (!reader) throw new LeadError(400, "Request body required.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 12000) {
      await reader.cancel();
      throw new LeadError(413, "Request too large.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new LeadError(400, "Invalid JSON.");
  }
}
const publicColumns =
  "id, site_id, source, source_record_id, name, email, phone, interest, stage, owner, version, created_at, updated_at";
export async function listLeads(sql: LeadSql, site: unknown) {
  const siteId = siteSchema.parse(site);
  const items = await sql.query(
    `SELECT ${publicColumns} FROM dts_control_leads WHERE site_id=$1 ORDER BY created_at DESC,id LIMIT 100`,
    [siteId],
  );
  return { items, limit: 100 };
}
export async function addLead(sql: LeadSql, input: unknown, actor: string) {
  const lead = leadSchema.parse(input);
  const id = randomUUID();
  const digest = createHash("sha256").update(JSON.stringify(lead)).digest("hex");
  const digits = lead.phone.replace(/\D/g, "");
  const phoneKey = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  const inserted = await sql.query(
    `WITH added AS (
 INSERT INTO dts_control_leads(id,site_id,source,source_record_id,request_hash,name,email,phone,phone_key,interest)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(site_id,source,source_record_id) DO NOTHING RETURNING *
 ), audited AS (INSERT INTO dts_control_lead_events(site_id,lead_id,actor,action,details) SELECT site_id,id,$11,'captured',jsonb_build_object('source',source,'stage',stage,'owner',owner) FROM added)
 SELECT ${publicColumns} FROM added`,
    [
      id,
      lead.siteId,
      lead.source,
      lead.sourceRecordId,
      digest,
      lead.name,
      lead.email,
      lead.phone,
      phoneKey,
      lead.interest,
      actor,
    ],
  );
  if (!inserted.length) {
    const existing = await sql.query<{ id: string; request_hash: string }>(
      "SELECT id,request_hash FROM dts_control_leads WHERE site_id=$1 AND source=$2 AND source_record_id=$3",
      [lead.siteId, lead.source, lead.sourceRecordId],
    );
    if (!existing.length)
      throw new LeadError(409, "Submission is being processed; retry with the same reference.");
    if (existing[0].request_hash !== digest)
      throw new LeadError(409, "This submission reference was already used for different details.");
    return { id: existing[0].id, duplicate: true, possibleDuplicates: [] };
  }
  const possibleDuplicates = await sql.query<{ id: string }>(
    "SELECT id FROM dts_control_leads WHERE site_id=$1 AND id<>$2 AND (($3<>'' AND email=$3) OR ($4<>'' AND phone_key=$4)) ORDER BY created_at DESC LIMIT 10",
    [lead.siteId, id, lead.email, phoneKey],
  );
  return { id, duplicate: false, possibleDuplicates: possibleDuplicates.map((x) => x.id) };
}
export async function routeLead(sql: LeadSql, input: unknown, actor: string) {
  const v = routeSchema.parse(input);
  const rows = await sql.query(
    `WITH changed AS (
 UPDATE dts_control_leads SET stage=$4,owner=$5,version=version+1,updated_at=now() WHERE site_id=$1 AND id=$2 AND version=$3 RETURNING *
 ), audited AS (INSERT INTO dts_control_lead_events(site_id,lead_id,actor,action,details) SELECT site_id,id,$6,'routed',jsonb_build_object('stage',stage,'owner',owner,'version',version) FROM changed)
 SELECT ${publicColumns} FROM changed`,
    [v.siteId, v.id, v.version, v.stage, v.owner, actor],
  );
  if (!rows.length)
    throw new LeadError(
      409,
      "Lead not found in this pipeline or changed since loading. Refresh and try again.",
    );
  return rows[0];
}
export async function leadHistory(sql: LeadSql, site: unknown, id: unknown) {
  return sql.query(
    "SELECT action,details,created_at FROM dts_control_lead_events WHERE site_id=$1 AND lead_id=$2 ORDER BY id DESC LIMIT 100",
    [siteSchema.parse(site), z.string().uuid().parse(id)],
  );
}
export function leadErrorResponse(error: unknown) {
  const status =
    error instanceof LeadError ? error.status : error instanceof z.ZodError ? 400 : 500;
  return Response.json(
    {
      error:
        error instanceof LeadError
          ? error.message
          : error instanceof z.ZodError
            ? "Check the required fields and contact details."
            : "Lead operation could not be completed.",
    },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}
