import { randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import { tryResolveTenant } from "@/lib/auth/tenant.server";
import {
  billedCostMicrodollars,
  DEFAULT_RESERVE_MICRODOLLARS,
} from "./billing-math";

export class TenantSpendCapError extends Error {
  readonly status = 429;
  constructor(message = "This workspace has reached its daily AI spend cap.") {
    super(message);
    this.name = "TenantSpendCapError";
  }
}

export type BilledAiRun<T> = {
  result: T;
  provider?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  rawCostMicrodollars: number;
};

export async function processBilledAiRequest<T>(opts: {
  organizationId: string;
  actorUserId?: string;
  feature: string;
  estimatedMicrodollars?: number;
  run: () => Promise<BilledAiRun<T>>;
}): Promise<T> {
  const estimate = Math.max(1, Math.floor(opts.estimatedMicrodollars || DEFAULT_RESERVE_MICRODOLLARS));
  const sql = await getSql();
  const reserved = (
    await sql.query<{
      allowed: boolean;
      day: string;
      cap: string | number;
      spend: string | number;
      markup_bps: number;
      reason: string;
    }>("select * from dts_reserve_tenant_spend($1,$2)", [opts.organizationId, estimate])
  )[0];

  if (!reserved?.allowed) {
    throw new TenantSpendCapError();
  }

  try {
    const outcome = await opts.run();
    const raw = Math.max(0, Math.floor(outcome.rawCostMicrodollars || 0));
    const billed = billedCostMicrodollars(raw, Number(reserved.markup_bps));
    await sql.query("select dts_commit_tenant_spend($1,$2,$3)", [
      opts.organizationId,
      estimate,
      billed,
    ]);
    await sql.query(
      `insert into dts_api_usage_logs(
        id, organization_id, actor_user_id, feature, provider, model,
        input_tokens, output_tokens, raw_cost_microdollars, billed_cost_microdollars, day
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        randomUUID(),
        opts.organizationId,
        opts.actorUserId || null,
        opts.feature,
        outcome.provider || null,
        outcome.model || null,
        outcome.inputTokens ?? null,
        outcome.outputTokens ?? null,
        raw,
        billed,
        reserved.day,
      ],
    );
    return outcome.result;
  } catch (error) {
    await sql.query("select dts_release_tenant_spend($1,$2)", [opts.organizationId, estimate]);
    throw error;
  }
}

export async function billTenantAiIfPresent<T>(
  req: Request,
  feature: string,
  run: () => Promise<T>,
  cost: (result: T) => { rawCostMicrodollars: number; provider?: string; model?: string },
): Promise<T> {
  const tenant = await tryResolveTenant(req);
  if (!tenant) return run();
  return processBilledAiRequest({
    organizationId: tenant.organizationId,
    actorUserId: tenant.userId,
    feature,
    run: async () => {
      const result = await run();
      return { result, ...cost(result) };
    },
  });
}
