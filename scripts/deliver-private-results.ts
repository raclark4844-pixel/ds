import { Pool } from "pg";
import { deliverVaultBatches } from "../integrations/lead-engine/vault-outbox";
if (!process.env.LEAD_ENGINE_DATABASE_URL || process.env.BATCHDATA_VAULT_SENDER_ENABLED !== "true")
  throw Error("Campaign database and private result sender must be configured explicitly.");
const pool = new Pool({ connectionString: process.env.LEAD_ENGINE_DATABASE_URL, max: 2 });
try {
  console.log(
    JSON.stringify(
      await deliverVaultBatches({
        query: async <T>(text: string, params: unknown[] = []) =>
          (await pool.query(text, params)).rows as T[],
      }),
    ),
  );
} catch {
  console.error(
    "Private result delivery needs review. Saved batches remain in the campaign database.",
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
