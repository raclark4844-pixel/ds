import { z } from "zod";
import type { Sql } from "./db";
export const healthSchema = z.object({
  observedAt: z.string().datetime(),
  enabled: z.boolean(),
  lastRunAt: z.string().datetime().nullable(),
  runFailed: z.boolean(),
  pending: z.number().int().min(0).max(100),
  retry: z.number().int().min(0).max(100),
  failed: z.number().int().min(0).max(100),
}).strict();
export async function saveHealth(sql: Pick<Sql, "query">, body: unknown) {
  const report = healthSchema.parse(body);
  await sql.query(`insert into dts_inbox_health(site_id, report) values ('demore', $1::jsonb)
    on conflict(site_id) do update set report=excluded.report, received_at=now()
    where (excluded.report->>'observedAt')::timestamptz >= (dts_inbox_health.report->>'observedAt')::timestamptz`, [JSON.stringify(report)]);
  return { accepted: true };
}
export async function readHealth(sql: Pick<Sql, "query">) {
  const rows = await sql.query(`select report, received_at from dts_inbox_health where site_id='demore'`);
  return { health: rows[0] || null };
}
