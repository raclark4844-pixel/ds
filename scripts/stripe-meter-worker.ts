import { Pool } from "pg";
import { deliverMeterBatch } from "../src/lib/billing/meter-worker";
import { stripeClient } from "../src/lib/billing/stripe";
import { billingFlags } from "../src/lib/billing/config";
import type { Sql } from "../src/lib/db";

// Run using node --import tsx scripts/stripe-meter-worker.ts from an external
// scheduler after release approval. This script never applies migrations.
if (!billingFlags(process.env).worker || !process.env.DATABASE_URL)
  throw Error("Meter worker is disabled or database is not configured.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const sql: Pick<Sql, "query"> = {
  query: async <T>(text: string, params: unknown[] = []) =>
    (await pool.query(text, params)).rows as T[],
};
try {
  console.log(JSON.stringify(await deliverMeterBatch(sql, stripeClient())));
} catch {
  console.error("Meter delivery incomplete; inspect pending records before retrying.");
  process.exitCode = 1;
} finally {
  await pool.end();
}
