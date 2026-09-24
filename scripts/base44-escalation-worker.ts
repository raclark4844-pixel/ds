import { Pool } from "pg";
import { deliverEscalations } from "../src/lib/base44/escalation-worker";
import type { Sql } from "../src/lib/db";
if (
  process.env.BASE44_ESCALATION_WORKER_ENABLED !== "true" ||
  !process.env.DATABASE_URL ||
  !process.env.BASE44_TEAM_ROUTING_JSON
)
  throw Error("Escalation worker is disabled or unconfigured.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const sql: Pick<Sql, "query"> = {
  query: async <T>(text: string, params: unknown[] = []) =>
    (await pool.query(text, params)).rows as T[],
};
try {
  console.log(JSON.stringify(await deliverEscalations(sql, process.env.BASE44_TEAM_ROUTING_JSON)));
} catch {
  console.error("Escalation delivery incomplete; review pending records.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
