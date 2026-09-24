import { getSql } from "@/lib/db";
import { resolveActiveOrganization, TenantAccessError } from "@/lib/auth/tenant.server";
import { billingFlags } from "./config";
import { budgetClient, reserveRedisBudget, settleRedisBudget } from "./redis-budget";
import { meterCatalog, stripeClient } from "./stripe";
import {
  runWithUsageLedger,
  UsageLedgerError,
  PUBLIC_AI_FEATURES,
  type UsageRequest,
} from "./usage-ledger";
export { TenantSpendCapError } from "./usage-ledger";
export type { BilledAiRun } from "./usage-ledger";

export async function processBilledAiRequest<T>(opts: UsageRequest<T>): Promise<T> {
  if (!billingFlags(process.env).ledger)
    throw new UsageLedgerError("Tenant usage ledger is not enabled.");
  if (opts.requireVerifiedCost && process.env.BILLING_MODE !== "stripe")
    throw new UsageLedgerError("Paid provider execution is disabled while billing is deferred.");
  const sql = await getSql(),
    redis = budgetClient();
  let day = "";
  const catalog = opts.requireVerifiedCost ? await meterCatalog(stripeClient()) : null;
  return runWithUsageLedger(sql, {
    ...opts,
    beforeProvider: async (id) => {
      const row = (
        await sql.query<{ day: string; amount: number; cap: number }>(
          `select o.day,o.reserved_microdollars as amount,b.daily_cap_microdollars as cap
         from dts_usage_operations o join dts_tenant_billing b on b.organization_id=o.organization_id
         where o.id=$1 and o.organization_id=$2`,
          [id, opts.organizationId],
        )
      )[0];
      if (!row) throw new UsageLedgerError("Usage reservation is missing.");
      day = row.day;
      await reserveRedisBudget(
        redis,
        opts.organizationId,
        day,
        id,
        Number(row.amount),
        Number(row.cap),
      );
      if (catalog)
        await sql.query("select dts_bind_meter($1,$2,$3,$4)", [
          opts.organizationId,
          id,
          catalog.priceId,
          catalog.eventName,
        ]);
      await opts.beforeProvider?.(id);
    },
    afterSettlement: async (id, billed) => {
      await settleRedisBudget(redis, opts.organizationId, day, id, billed);
      await opts.afterSettlement?.(id, billed);
    },
  });
}
export async function billTenantAiIfPresent<T>(
  req: Request,
  feature: string,
  run: () => Promise<T>,
  cost: (result: T) => { rawCostMicrodollars: number; provider?: string; model?: string },
): Promise<T> {
  // Deliberately no catch-to-anonymous fallback: auth/DB failure blocks execution.
  const tenant = await resolveActiveOrganization(req);
  if (!tenant) {
    if (!PUBLIC_AI_FEATURES.has(feature)) throw new TenantAccessError("Sign-in is required.", 401);
    return run();
  }
  const requestKey = req.headers.get("idempotency-key");
  if (requestKey && !/^[A-Za-z0-9_-]{8,80}$/.test(requestKey))
    throw new UsageLedgerError("Invalid operation key.", 400);
  return processBilledAiRequest({
    organizationId: tenant.organizationId,
    actorUserId: tenant.userId,
    feature,
    operationKey: requestKey ? `${tenant.userId}:${feature}:${requestKey}` : undefined,
    run: async () => {
      const result = await run();
      return { result, ...cost(result), costBasis: "ESTIMATE" };
    },
  });
}
