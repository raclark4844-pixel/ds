import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { randomUUID, createHmac } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { runWithUsageLedger } from "./usage-ledger";
import type { Sql } from "../db";
import type Stripe from "stripe";
import { deliverMeterBatch } from "./meter-worker";
import { salesSnapshot, changeSales } from "../client-sales";
import { checkout, reconcileStripeEvent } from "./stripe";
import { authenticateCallback, persistCallback } from "../base44/callback";
import { deliverEscalations } from "../base44/escalation-worker";

test("native migration and durable usage lifecycle", async (t) => {
  const url = process.env.DTS_ISOLATED_TEST_DATABASE_URL;
  // Never consume DATABASE_URL: test data belongs only in a disposable local DB.
  if (url && !["127.0.0.1", "localhost"].includes(new URL(url).hostname))
    throw Error("Test database must be local and disposable.");
  const embedded = url ? null : new PGlite();
  const schema = `test_${randomUUID().replaceAll("-", "")}`;
  const admin = url ? new Pool({ connectionString: url, max: 1 }) : null;
  if (admin) await admin.query(`create schema "${schema}"`);
  const pool = url
    ? new Pool({ connectionString: url, max: 10, options: `-c search_path=${schema},public` })
    : null;
  const query = async <T = Record<string, unknown>>(
    text: string,
    params: unknown[] = [],
  ): Promise<T[]> =>
    pool
      ? ((await pool.query(text, params)).rows as T[])
      : (await embedded!.query<T>(text, params)).rows;
  const exec = async (sql: string) => {
    if (pool) await pool.query(sql);
    else await embedded!.exec(sql);
  };
  t.after(async () => {
    if (pool) await pool.end();
    if (admin) {
      await admin.query(`drop schema "${schema}" cascade`);
      await admin.end();
    }
    if (embedded) await embedded.close();
  });
  const migrations = (await readdir("migrations")).filter((x) => x.endsWith(".sql")).sort();
  for (const migration of migrations.filter((x) => x < "0015"))
    await exec(await readFile(`migrations/${migration}`, "utf8"));
  await query(
    `insert into "organization"(id,name,slug) values ('a','Synthetic A','synthetic-a'),('b','Synthetic B','synthetic-b'),('legacy','Legacy','legacy')`,
  );
  await query(
    `insert into dts_tenant_billing(organization_id,current_day,current_day_spend_microdollars) values ('legacy','2026-01-01',12345)`,
  );
  await exec(await readFile("migrations/0015_durable_usage_ledger.sql", "utf8"));
  for (const migration of migrations.filter((x) => x >= "0016"))
    await exec(await readFile(`migrations/${migration}`, "utf8"));
  const total = async (org: string, day?: string) =>
    (
      await query<{ amount: string }>(
        `select committed_and_reserved_microdollars::text as amount from dts_usage_days where organization_id=$1 ${day ? "and day=$2" : "order by day desc limit 1"}`,
        [org, ...(day ? [day] : [])],
      )
    )[0]?.amount;
  assert.equal(await total("legacy", "2026-01-01"), "12345");
  await query(
    `insert into dts_tenant_billing(organization_id,daily_cap_microdollars) values ('a',32000),('b',32000)`,
  );
  const reserve = async (org: string, key: string, cost = 10000) =>
    (
      await query<{ operation_id: string; execute: boolean; reason: string }>(
        "select * from dts_reserve_usage($1,$2,$3,'test',null,$4)",
        [randomUUID(), org, key, cost],
      )
    )[0];
  const settle = async (org: string, id: string, outcome: string, raw: number | null = 10000) =>
    (
      await query<{ state: string }>(
        "select dts_settle_usage($1,$2,$3,$4,'synthetic','model',null,null,null,'ESTIMATE') as state",
        [org, id, outcome, raw],
      )
    )[0].state;
  const ops = await Promise.all([reserve("a", "one"), reserve("a", "two"), reserve("a", "three")]);
  assert.equal(ops.filter((x) => x.execute).length, 2);
  assert.equal(ops.filter((x) => x.reason === "CAP").length, 1);
  assert.equal(await total("a"), "32000");
  const first = ops.find((x) => x.execute)!;
  const key = (
    await query<{ operation_key: string }>(
      "select operation_key from dts_usage_operations where id=$1",
      [first.operation_id],
    )
  )[0].operation_key;
  assert.equal((await reserve("a", key)).reason, "REPLAY");
  await assert.rejects(reserve("a", key, 1), /OPERATION_CONFLICT/);
  await assert.rejects(settle("b", first.operation_id, "SUCCESS"), /OPERATION_NOT_FOUND/);
  assert.equal(await settle("a", first.operation_id, "UNKNOWN", null), "UNKNOWN");
  assert.equal(await total("a"), "32000");
  assert.equal(await settle("a", first.operation_id, "NO_CHARGE", null), "RELEASED");
  assert.equal(await settle("a", first.operation_id, "NO_CHARGE", null), "RELEASED");
  assert.equal(await total("a"), "16000");
  const second = ops.filter((x) => x.execute)[1];
  await settle("a", second.operation_id, "SUCCESS");
  await settle("a", second.operation_id, "SUCCESS");
  assert.equal(
    (
      await query<{ count: string }>("select count(*)::text from dts_api_usage_logs where id=$1", [
        second.operation_id,
      ])
    )[0].count,
    "1",
  );
  await assert.rejects(settle("a", second.operation_id, "NO_CHARGE", null), /SETTLEMENT_CONFLICT/);
  // Simulate the next-day cached total while an earlier operation is pending.
  const crossing = await reserve("b", "midnight");
  await query(
    "update dts_tenant_billing set current_day='2099-01-01',current_day_spend_microdollars=55 where organization_id='b'",
  );
  await settle("b", crossing.operation_id, "NO_CHARGE", null);
  assert.equal(
    (
      await query<{ value: string }>(
        "select current_day_spend_microdollars::text as value from dts_tenant_billing where organization_id='b'",
      )
    )[0].value,
    "55",
  );
  assert.equal(await total("b"), "0");
  // Log-insert failure must roll back settlement and retain the full reservation.
  const failure = await reserve("b", "log-failure");
  await query(
    "insert into dts_api_usage_logs(id,organization_id,feature,raw_cost_microdollars,billed_cost_microdollars,day) values($1,'b','collision',0,0,'2026-01-01')",
    [failure.operation_id],
  );
  await assert.rejects(settle("b", failure.operation_id, "SUCCESS"));
  assert.equal(await total("b"), "16000");
  assert.equal(
    (
      await query<{ state: string }>("select state from dts_usage_operations where id=$1", [
        failure.operation_id,
      ])
    )[0].state,
    "RESERVED",
  );
  await query("delete from dts_api_usage_logs where id=$1", [failure.operation_id]);
  assert.equal(await settle("b", failure.operation_id, "SUCCESS", 30000), "RECONCILE");
  assert.equal(await total("b"), "48000");
  assert.equal((await reserve("b", "blocked-after-overrun")).reason, "RECONCILIATION_REQUIRED");
  assert.equal((await reserve("legacy", "unreviewed")).reason, "PRICING_REVIEW_REQUIRED");
  // The TypeScript provider wrapper must not turn an ambiguous timeout into credit.
  await query(
    "update dts_tenant_billing set daily_cap_microdollars=1000000 where organization_id='a'",
  );
  const sql = { query } as Pick<Sql, "query">;
  await assert.rejects(
    runWithUsageLedger(sql, {
      organizationId: "a",
      feature: "timeout",
      operationKey: "provider-timeout",
      estimatedMicrodollars: 10000,
      run: async () => {
        throw Error("timeout");
      },
    }),
    /uncertain/,
  );
  assert.equal(
    (
      await query<{ state: string }>(
        "select state from dts_usage_operations where organization_id='a' and operation_key='provider-timeout'",
      )
    )[0].state,
    "UNKNOWN",
  );
  let called = false;
  await assert.rejects(
    runWithUsageLedger(sql, {
      organizationId: "a",
      feature: "timeout",
      operationKey: "provider-timeout",
      estimatedMicrodollars: 10000,
      run: async () => {
        called = true;
        return { result: true, rawCostMicrodollars: 1 };
      },
    }),
    /already exists/,
  );
  assert.equal(called, false);
  // Redis or billing admission failure must never call a provider.
  await assert.rejects(
    runWithUsageLedger(sql, {
      organizationId: "a",
      feature: "redis-down",
      estimatedMicrodollars: 10000,
      beforeProvider: async () => {
        throw Error("redis unavailable");
      },
      run: async () => {
        called = true;
        return { result: true, rawCostMicrodollars: 1 };
      },
    }),
    /admission/,
  );
  assert.equal(called, false);
  assert.equal(
    (
      await query<{ state: string }>(
        "select state from dts_usage_operations where feature='redis-down'",
      )
    )[0].state,
    "RELEASED",
  );
  await query(`insert into dts_stripe_accounts(organization_id,stripe_customer_id,enabled,subscription_id,subscription_status,meter_price_id,meter_event_name)
   values('a','cus_test_a',true,'sub_test_a','active','price_test','dts_usage')`);
  const verified = async (key: string, receipt: string) =>
    runWithUsageLedger(sql, {
      organizationId: "a",
      feature: "verified",
      operationKey: key,
      estimatedMicrodollars: 10000,
      requireVerifiedCost: true,
      beforeProvider: async (id) => {
        await query("select dts_bind_meter('a',$1,'price_test','dts_usage')", [id]);
      },
      run: async () => ({
        result: true,
        rawCostMicrodollars: 10000,
        provider: "synthetic",
        providerReceipt: receipt,
        costBasis: "VERIFIED" as const,
      }),
    });
  await verified("verified-one", "receipt-one");
  const outbox = await query<{ operation_id: string; value_microdollars: string }>(
    "select operation_id,value_microdollars::text from dts_stripe_meter_outbox",
  );
  assert.equal(outbox.length, 1);
  assert.equal(outbox[0].value_microdollars, "16000");
  await assert.rejects(
    query("update dts_stripe_meter_outbox set organization_id='b'"),
    /foreign key/i,
  );
  await assert.rejects(verified("duplicate-receipt", "receipt-one"), /persistence/);
  let deliveries = 0;
  const stripe = {
    prices: {
      retrieve: async () => ({
        active: true,
        currency: "usd",
        billing_scheme: "per_unit",
        unit_amount_decimal: "0.0001",
        recurring: { usage_type: "metered", meter: "meter_test" },
      }),
    },
    billing: {
      meters: {
        retrieve: async () => ({
          status: "active",
          event_name: "dts_usage",
          default_aggregation: { formula: "sum" },
          customer_mapping: { event_payload_key: "stripe_customer_id" },
          value_settings: { event_payload_key: "value" },
        }),
      },
      meterEvents: {
        create: async (
          data: { payload: { value: string } },
          options: { idempotencyKey: string },
        ) => {
          deliveries++;
          assert.equal(data.payload.value, "16000");
          assert.match(options.idempotencyKey, /^dts-usage-/);
          return {};
        },
      },
    },
  } as unknown as Stripe;
  const env = { STRIPE_METER_PRICE_ID: "price_test", STRIPE_METER_EVENT_NAME: "dts_usage" };
  assert.deepEqual(await deliverMeterBatch(sql, stripe, 10, env), {
    accepted: 1,
    retry: 0,
    reconcile: 0,
  });
  await deliverMeterBatch(sql, stripe, 10, env);
  assert.equal(deliveries, 1);
  await verified("verified-two", "receipt-two");
  await query(
    "update dts_stripe_meter_outbox set first_attempt_at=now()-interval '23 hours' where state='READY'",
  );
  assert.equal((await deliverMeterBatch(sql, stripe, 10, env)).reconcile, 1);
  assert.equal(deliveries, 1);
  await verified("verified-three", "receipt-three");
  const claims = await Promise.all([
    query("select * from dts_claim_meter('worker-a')"),
    query("select * from dts_claim_meter('worker-b')"),
  ]);
  assert.equal(claims.flat().length, 1, "only one worker leases a customer at a time");
  await query(
    "update dts_stripe_accounts set meter_lease_until=now()-interval '1 second',meter_price_id='unapproved' where organization_id='a'",
  );
  await query(
    "update dts_stripe_meter_outbox set lease_until=now()-interval '1 second' where state='SENDING'",
  );
  assert.equal((await deliverMeterBatch(sql, stripe, 10, env)).reconcile, 1);
  assert.equal(deliveries, 1, "changed company billing mapping must not emit usage");
  await query(`insert into dts_control_leads(id,organization_id,site_id,source,source_record_id,request_hash,name)
   values('lead-a','a','demore-technology','manual','a','a','Synthetic A'),('lead-b','b','demore-technology','manual','b','b','Synthetic B')`);
  await query(
    `insert into dts_client_campaigns(id,organization_id,name) values('campaign-a','a','A'),('campaign-b','b','B')`,
  );
  await query(
    `insert into dts_client_webhook_logs(id,organization_id,request_id,workflow,status) values('hook-a','a','request-a','chatSupport','accepted'),('hook-b','b','request-b','chatSupport','accepted')`,
  );
  const snapshot = await salesSnapshot(sql, "a");
  assert.deepEqual(
    snapshot.leads.map((l) => l.id),
    ["lead-a"],
  );
  assert.deepEqual(
    snapshot.campaigns.map((c) => c.id),
    ["campaign-a"],
  );
  assert.deepEqual(
    snapshot.webhooks.map((w) => w.id),
    ["hook-a"],
  );
  await assert.rejects(
    changeSales(sql, "a", "actor-a", {
      action: "stage",
      leadId: "lead-b",
      version: 1,
      stage: "won",
    }),
    /unavailable/,
  );
  await changeSales(sql, "a", "actor-a", {
    action: "stage",
    leadId: "lead-a",
    version: 1,
    stage: "qualified",
  });
  await assert.rejects(
    changeSales(sql, "a", "actor-a", {
      action: "stage",
      leadId: "lead-a",
      version: 1,
      stage: "won",
    }),
    /changed/,
  );
  const draft = {
    action: "draft",
    leadId: "lead-a",
    channel: "sms",
    body: "Synthetic unsent draft",
    requestId: randomUUID(),
  };
  await changeSales(sql, "a", "actor-a", draft);
  await changeSales(sql, "a", "actor-a", draft);
  await assert.rejects(
    changeSales(sql, "a", "actor-a", { ...draft, body: "Changed payload" }),
    /conflicts/,
  );
  assert.equal((await salesSnapshot(sql, "b")).activity.length, 0);
  assert.equal((await salesSnapshot(sql, "a")).activity.length, 2);
  const secret = "synthetic-webhook-secret-never-used-live",
    timestamp = String(Math.floor(Date.now() / 1000));
  const callback = {
    envelope: {
      version: "1",
      requestId: randomUUID(),
      orgId: "a",
      actorId: "ignored",
      workflow: "chatSupport",
      issuedAt: new Date().toISOString(),
    },
    leadId: "lead-a",
    input: {
      documents: [{ sourceId: "faq", page: 1, text: "Contact our team." }],
      approvedCatalog: [],
      messages: [{ role: "visitor", text: "Human please." }],
    },
    output: {
      answer: "I can request human help.",
      catalogIds: [],
      citations: [],
      escalation: {
        requested: true,
        reason: "human_requested",
        summary: "Visitor requests human help.",
      },
    },
  };
  const sign = (data: unknown) => {
    const raw = JSON.stringify(data);
    const headers = new Headers({
      "x-dts-integration": "fixture",
      "x-dts-timestamp": timestamp,
      "x-dts-signature": createHmac("sha256", secret)
        .update(timestamp + "." + raw)
        .digest("hex"),
    });
    return authenticateCallback(headers, raw, JSON.stringify({ fixture: { orgId: "a", secret } }));
  };
  await persistCallback(sql, sign(callback));
  await persistCallback(sql, sign(callback));
  assert.equal((await query("select id from dts_support_escalations")).length, 1);
  await assert.rejects(persistCallback(sql, sign({ ...callback, leadId: "lead-b" })), /conflicts/);
  let notifications = 0;
  const sender: typeof fetch = async (_url, options) => {
    notifications++;
    const payload = JSON.parse(String(options?.body));
    assert.equal(payload.orgId, "a");
    assert.ok(new Headers(options?.headers).get("idempotency-key"));
    return Response.json({ accepted: true, requestId: payload.requestId });
  };
  const routing = JSON.stringify({
    a: {
      endpoint: "https://app.base44.com/api/apps/synthetic/functions/notify-team",
      secret,
      idempotencyVerified: true,
    },
  });
  assert.equal((await deliverEscalations(sql, routing, sender)).acknowledged, 1);
  await deliverEscalations(sql, routing, sender);
  assert.equal(notifications, 1);
  await query(
    `insert into "organization"(id,name,slug) values('checkout-org','Synthetic Checkout','synthetic-checkout')`,
  );
  await query(
    `insert into dts_stripe_accounts(organization_id,stripe_customer_id,enabled,meter_price_id,meter_event_name) values('checkout-org','cus_checkout',true,'price_test','dts_usage')`,
  );
  const keys = new Set<string>();
  const checkoutStripe = {
    ...stripe,
    subscriptions: { list: async () => ({ data: [], has_more: false }) },
    checkout: {
      sessions: {
        create: async (
          params: Stripe.Checkout.SessionCreateParams,
          options: { idempotencyKey: string },
        ) => {
          assert.equal(params.customer, "cus_checkout");
          assert.equal(params.metadata?.orgId, "checkout-org");
          keys.add(options.idempotencyKey);
          return { id: "cs_synthetic", url: "https://checkout.stripe.com/c/pay/synthetic" };
        },
        retrieve: async () => ({
          status: "open",
          url: "https://checkout.stripe.com/c/pay/synthetic",
        }),
      },
    },
  } as unknown as Stripe;
  const checkEnv = { ...env, BETTER_AUTH_URL: "https://example.invalid" };
  const sessions = await Promise.all([
    checkout(sql, "checkout-org", checkoutStripe, checkEnv),
    checkout(sql, "checkout-org", checkoutStripe, checkEnv),
  ]);
  assert.equal(keys.size, 1);
  assert.equal(sessions[0].url, sessions[1].url);
  const paidEvent = {
    id: "evt_old_invoice",
    type: "invoice.paid",
    data: { object: { customer: "cus_checkout", metadata: { orgId: "b" } } },
  } as unknown as Stripe.Event;
  await reconcileStripeEvent(sql, paidEvent, checkoutStripe);
  await reconcileStripeEvent(sql, paidEvent, checkoutStripe);
  assert.equal(
    (
      await query<{ subscription_status: string }>(
        "select subscription_status from dts_stripe_accounts where organization_id='checkout-org'",
      )
    )[0].subscription_status,
    "canceled",
  );
  assert.equal(
    (
      await query<{ organization_id: string }>(
        "select organization_id from dts_stripe_receipts where id='evt_old_invoice'",
      )
    )[0].organization_id,
    "checkout-org",
  );
});
