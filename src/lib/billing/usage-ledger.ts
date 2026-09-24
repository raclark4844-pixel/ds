import { randomUUID } from "node:crypto";
import type { Sql } from "../db";
import { DEFAULT_RESERVE_MICRODOLLARS, billedCostMicrodollars } from "./billing-math";
export class TenantSpendCapError extends Error {
  readonly status = 429;
  constructor(message = "This workspace has reached its daily AI spend cap.") {
    super(message);
    this.name = "TenantSpendCapError";
  }
}
export class UsageLedgerError extends Error {
  constructor(
    message: string,
    public status = 503,
  ) {
    super(message);
    this.name = "UsageLedgerError";
  }
}
export type BilledAiRun<T> = {
  result: T;
  provider?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  rawCostMicrodollars: number;
  providerReceipt?: string;
  costBasis?: "ESTIMATE" | "VERIFIED";
};
export type UsageRequest<T> = {
  organizationId: string;
  actorUserId?: string;
  feature: string;
  operationKey?: string;
  estimatedMicrodollars?: number;
  beforeProvider?: (operationId: string) => Promise<void>;
  afterSettlement?: (operationId: string, billedMicrodollars: number) => Promise<void>;
  requireVerifiedCost?: boolean;
  run: () => Promise<BilledAiRun<T>>;
};
/** All SQL functions execute in a single DB transaction per call. Never refund an
 * uncertain provider result. The stored operation id is the reconciliation handle. */
export async function runWithUsageLedger<T>(sql: Pick<Sql, "query">, opts: UsageRequest<T>) {
  const rawQuery = sql.query.bind(sql);
  sql = {
    query: async <R>(text: string, values?: unknown[]): Promise<R[]> => {
      try {
        return await rawQuery<R>(text, values);
      } catch (error) {
        const conflict = /^(OPERATION_CONFLICT|SETTLEMENT_CONFLICT)$/.test(
          String((error as Error).message),
        );
        throw new UsageLedgerError(
          conflict
            ? "Usage request conflicts with an existing operation."
            : "Usage persistence requires reconciliation.",
          conflict ? 409 : 503,
        );
      }
    },
  };
  const maximum = opts.estimatedMicrodollars ?? DEFAULT_RESERVE_MICRODOLLARS;
  if (!Number.isSafeInteger(maximum) || maximum < 1 || maximum > 1e12)
    throw new UsageLedgerError("Invalid approved reservation maximum.");
  const id = randomUUID(),
    key = opts.operationKey ?? id;
  const reservation = (
    await sql.query<{ operation_id: string; execute: boolean; reason: string; markup_bps: number }>(
      "select * from dts_reserve_usage($1,$2,$3,$4,$5,$6)",
      [id, opts.organizationId, key, opts.feature, opts.actorUserId ?? null, maximum],
    )
  )[0];
  if (!reservation?.execute) {
    if (reservation?.reason === "CAP") throw new TenantSpendCapError();
    if (reservation?.reason === "REPLAY")
      throw new UsageLedgerError(
        "This operation already exists; review its result before retrying.",
        409,
      );
    throw new UsageLedgerError("Workspace billing requires configuration or reconciliation.");
  }
  let outcome: BilledAiRun<T>;
  try {
    await opts.beforeProvider?.(id);
  } catch (error) {
    // The provider has not been called: release is proven safe here only.
    await sql.query(
      "select dts_settle_usage($1,$2,'NO_CHARGE',null,null,null,null,null,null,'ESTIMATE')",
      [opts.organizationId, id],
    );
    throw error instanceof TenantSpendCapError || error instanceof UsageLedgerError
      ? error
      : new UsageLedgerError("Provider admission is temporarily unavailable.");
  }
  try {
    outcome = await opts.run();
  } catch (error) {
    try {
      await sql.query(
        "select dts_settle_usage($1,$2,'UNKNOWN',null,null,null,null,null,null,'ESTIMATE')",
        [opts.organizationId, id],
      );
    } catch {
      console.warn(
        JSON.stringify({ event: "billing.unknown_outcome_persist_failed", operationId: id }),
      );
    }
    // A timeout can still have incurred a provider charge. Credit remains reserved.
    throw new UsageLedgerError("Provider outcome is uncertain; usage remains reserved.");
  }
  if (
    opts.requireVerifiedCost &&
    (outcome.costBasis !== "VERIFIED" || !outcome.providerReceipt || !outcome.provider)
  )
    throw new UsageLedgerError(
      "Verified provider cost and receipt are required; usage remains reserved.",
    );
  const billed = billedCostMicrodollars(outcome.rawCostMicrodollars, reservation.markup_bps);
  const settled = (
    await sql.query<{ state: string }>(
      "select dts_settle_usage($1,$2,'SUCCESS',$3,$4,$5,$6,$7,$8,$9) as state",
      [
        opts.organizationId,
        id,
        outcome.rawCostMicrodollars,
        outcome.provider ?? null,
        outcome.model ?? null,
        outcome.inputTokens ?? null,
        outcome.outputTokens ?? null,
        outcome.providerReceipt ?? null,
        outcome.costBasis ?? "ESTIMATE",
      ],
    )
  )[0];
  if (settled?.state === "RECONCILE") {
    console.warn(JSON.stringify({ event: "billing.reservation_exceeded", operationId: id }));
    throw new UsageLedgerError(
      "Recorded cost exceeded the reservation; further usage is paused for review.",
    );
  }
  if (settled?.state !== "SETTLED")
    throw new UsageLedgerError("Usage settlement could not be confirmed.");
  try {
    await opts.afterSettlement?.(id, billed);
  } catch {
    console.warn(JSON.stringify({ event: "billing.redis_projection_stale", operationId: id }));
  }
  return outcome.result;
}
/** Public tools already have route-level IP/request limits. Only these explicitly
 * public features can run without a signed-in tenant; auth errors never get here. */
export const PUBLIC_AI_FEATURES = new Set([
  "assistant",
  "comparison-analyze",
  "website-review-revise",
  "website-review-personalize",
]);
