import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { TenantSpendCapError, UsageLedgerError } from "./usage-ledger";

// Each organization/day is one atomic hash. DB reservations remain authoritative
// across Redis eviction or outages; UNKNOWN provider outcomes never get refunded.
export const RESERVE_BUDGET = `
local prior = redis.call('HGET', KEYS[1], ARGV[1])
if prior then return 0 end
local total = tonumber(redis.call('HGET', KEYS[1], 'total') or '0')
local amount = tonumber(ARGV[2])
if total + amount > tonumber(ARGV[3]) then return -1 end
redis.call('HSET', KEYS[1], ARGV[1], amount, 'total', total + amount)
redis.call('EXPIRE', KEYS[1], 3888000)
return 1`;
export const SETTLE_BUDGET = `
local prior = redis.call('HGET', KEYS[1], ARGV[1])
if not prior then return 0 end
local marker = ARGV[1] .. ':settled'
if redis.call('HEXISTS', KEYS[1], marker) == 1 then return 0 end
local total = tonumber(redis.call('HGET', KEYS[1], 'total') or '0')
redis.call('HSET', KEYS[1], 'total', total - tonumber(prior) + tonumber(ARGV[2]), marker, 1)
return 1`;
export function budgetKey(org: string, day: string) {
  return `dts:budget:${createHash("sha256").update(org).digest("hex")}:${day}`;
}
export function budgetClient(env: NodeJS.ProcessEnv = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL,
    token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || new URL(url).protocol !== "https:")
    throw new UsageLedgerError("Redis budget configuration is required.");
  return new Redis({ url, token, retry: { retries: 0 } });
}
export async function reserveRedisBudget(
  redis: Pick<Redis, "eval">,
  org: string,
  day: string,
  id: string,
  amount: number,
  cap: number,
) {
  const result = Number(await redis.eval(RESERVE_BUDGET, [budgetKey(org, day)], [id, amount, cap]));
  if (result === -1) throw new TenantSpendCapError();
  if (result !== 1) throw new UsageLedgerError("Budget reservation requires reconciliation.");
}
export async function settleRedisBudget(
  redis: Pick<Redis, "eval">,
  org: string,
  day: string,
  id: string,
  amount: number,
) {
  await redis.eval(SETTLE_BUDGET, [budgetKey(org, day)], [id, amount]);
}
