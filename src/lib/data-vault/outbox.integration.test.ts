import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  saveVaultBatch,
  deliverVaultBatches,
} from "../../../integrations/lead-engine/vault-outbox";
import {
  capturePropertyPage,
  captureContactLookup,
} from "../../../integrations/lead-engine/capture";
import { authenticateBatch } from "./bridge";
test("durable campaign capture and signed delivery never repurchase provider data", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(await readFile("integrations/lead-engine/vault-outbox.sql", "utf8"));
  const sql = {
    query: async <T>(text: string, params: unknown[] = []) =>
      (await db.query<T>(text, params)).rows,
  };
  const context = {
    customerId: "customer-a",
    campaignId: "campaign-a",
    jobId: "job-a",
    pageKey: "page:0",
    observedAt: "2026-01-01T00:00:00Z",
  };
  const property = {
    externalRef: "123",
    address1: "10 Main St",
    address2: "A",
    city: "Troy",
    state: "NY",
    postalCode: "12180",
  };
  await capturePropertyPage(sql, context, [property]);
  await capturePropertyPage(sql, context, [property]);
  assert.equal((await sql.query('select id from "DtsVaultOutbox"')).length, 1);
  await assert.rejects(
    capturePropertyPage(sql, context, [{ ...property, address1: "11 Main St" }]),
    /conflicts/,
  );
  const secret = "s".repeat(40),
    env = {
      BATCHDATA_VAULT_SENDER_ENABLED: "true",
      BATCHDATA_VAULT_CUSTOMERS_JSON: JSON.stringify({
        "customer-a": { integrationId: "engine-a", secret },
      }),
    };
  let calls = 0;
  const receiver: typeof fetch = async (url, opts) => {
    assert.equal(
      String(url),
      "https://demoretechnologysolutions.com/api/webhooks/batchdata-results",
    );
    calls++;
    const body = String(opts!.body),
      req = new Request(url, opts);
    assert.equal(
      authenticateBatch(req, body, {
        BATCHDATA_VAULT_IMPORT_ENABLED: "true",
        BATCHDATA_VAULT_INTEGRATIONS_JSON: JSON.stringify({
          "engine-a": { orgId: "org-a", secret },
        }),
      }),
      "org-a",
    );
    const payload = JSON.parse(body);
    assert.equal(payload.records[0].unit, "A");
    return Response.json(
      { accepted: true, requestId: payload.requestId, duplicate: false },
      { status: 202 },
    );
  };
  assert.deepEqual(await deliverVaultBatches(sql, env, receiver), {
    accepted: 1,
    retry: 0,
    review: 0,
  });
  assert.equal((await deliverVaultBatches(sql, env, receiver)).accepted, 0);
  assert.equal(calls, 1);
  await captureContactLookup(sql, { ...context, jobId: "lookup-a" }, property, {
    matched: true,
    contacts: [
      { type: "EMAIL", value: "test@example.test", dnc: false, restricted: false },
      { type: "MOBILE", value: "+15555555555", dnc: true, restricted: false },
    ],
  });
  const pending = await sql.query<{
    payload: { records: { contacts: unknown[]; doNotCall: boolean }[] };
  }>("select payload from \"DtsVaultOutbox\" where status='ready'");
  assert.equal(pending[0].payload.records[0].contacts.length, 2);
  assert.equal(pending[0].payload.records[0].doNotCall, true);
  assert.equal(
    (await deliverVaultBatches(sql, env, async () => new Response("", { status: 503 }))).retry,
    1,
  );
  await db.exec(`update "DtsVaultOutbox" set next_attempt_at=now() where status='ready'`);
  assert.equal(
    (await deliverVaultBatches(sql, env, async () => new Response("", { status: 409 }))).review,
    1,
  );
  await assert.rejects(
    deliverVaultBatches(sql, { ...env, BATCHDATA_VAULT_SENDER_ENABLED: "false" }, receiver),
  );
  // Same transaction rollback prevents orphaned delivery for a failed campaign commit.
  await db.exec("begin");
  await saveVaultBatch(sql, "customer-a", {
    version: 1,
    requestId: "rollback-test",
    campaignId: "campaign-a",
    observedAt: context.observedAt,
    records: [{ address: "99 Main", city: "Troy", state: "NY", postalCode: "12180" }],
  });
  await db.exec("rollback");
  assert.equal(
    (
      await sql.query(
        "select id from \"DtsVaultOutbox\" where payload->>'requestId'='rollback-test'",
      )
    ).length,
    0,
  );
});
