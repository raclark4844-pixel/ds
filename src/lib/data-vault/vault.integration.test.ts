import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { importRecords, identityKeys, recordsCsv } from "./records";
import { vaultAccess, listRecords, setGrant } from "./access";
import { authenticateBatch } from "./bridge";
import { createHmac } from "node:crypto";
test("private result persistence, grants, isolation, replay and merge history", async (t) => {
  const url = process.env.DTS_ISOLATED_TEST_DATABASE_URL;
  if (url && !["localhost", "127.0.0.1"].includes(new URL(url).hostname))
    throw Error("Disposable localhost database required.");
  const schema = "vault_" + randomUUID().replaceAll("-", "");
  const admin = url ? new Pool({ connectionString: url, max: 1 }) : null;
  if (admin) await admin.query('create schema "' + schema + '"');
  const pool = url
    ? new Pool({ connectionString: url, max: 10, options: "-c search_path=" + schema + ",public" })
    : null;
  const embedded = pool ? null : new PGlite();
  const db = {
    exec: async (text: string) => (pool ? pool.query(text) : embedded!.exec(text)),
    query: async <T>(text: string, params: unknown[] = []) =>
      pool
        ? { rows: (await pool.query(text, params)).rows as T[] }
        : embedded!.query<T>(text, params),
  };
  t.after(async () => {
    if (pool) await pool.end();
    if (admin) {
      await admin.query('drop schema "' + schema + '" cascade');
      await admin.end();
    }
    if (embedded) await embedded.close();
  });
  for (const f of (await readdir("migrations")).filter((f) => f.endsWith(".sql")).sort())
    await db.exec(await readFile(`migrations/${f}`, "utf8"));
  const sql = {
    query: async <T>(text: string, params: unknown[] = []) =>
      (await db.query<T>(text, params)).rows,
  };
  await db.exec(`insert into "organization"(id,name,slug) values('a','A','a'),('b','B','b');
 insert into "user"(id,name,email,"emailVerified","createdAt","updatedAt") values ('owner','Owner','owner@example.test',true,now(),now()),('viewer','Viewer','viewer@example.test',true,now(),now()),('outsider','Outsider','outsider@example.test',true,now(),now());
 insert into "member"(id,"organizationId","userId",role) values('ma','a','owner','owner'),('mb','b','owner','owner'),('mv','a','viewer','owner'),('mo','b','outsider','owner');
 insert into dts_data_vaults values('a','owner',now()),('b','owner',now());`);
  const row = {
    providerId: "123",
    address: "10 Main St",
    unit: "1",
    city: "Troy",
    state: "NY",
    postalCode: "12180",
    ownerName: "Old",
    email: "old@example.test",
    doNotCall: true,
  };
  const batch = {
    version: 1,
    requestId: "request-001",
    campaignId: "campaign-a",
    observedAt: "2026-01-01T00:00:00Z",
    records: [row],
  };
  await assert.rejects(vaultAccess(sql, "a", "viewer"), /access/);
  assert.equal((await importRecords(sql, "a", batch)).duplicate, false);
  assert.equal((await importRecords(sql, "a", batch)).duplicate, true);
  await assert.rejects(
    importRecords(sql, "a", { ...batch, records: [{ ...row, ownerName: "Changed" }] }),
    /conflicts/,
  );
  await importRecords(sql, "a", {
    ...batch,
    requestId: "request-002",
    observedAt: "2026-01-02T00:00:00Z",
    records: [{ ...row, ownerName: "New", email: undefined }],
  });
  let rows = await listRecords(sql, "a", "owner");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].data.ownerName, "New");
  assert.equal(rows[0].data.email, "old@example.test");
  assert.equal(rows[0].version, 2);
  await importRecords(sql, "a", {
    ...batch,
    requestId: "request-003",
    observedAt: "2025-12-01T00:00:00Z",
  });
  rows = await listRecords(sql, "a", "owner");
  assert.equal(rows[0].data.ownerName, "New");
  await importRecords(sql, "b", batch);
  assert.equal((await listRecords(sql, "b", "owner")).length, 1);
  await assert.rejects(listRecords(sql, "a", "outsider"), /access/);
  await setGrant(sql, "a", "owner", "viewer@example.test", false);
  assert.equal((await listRecords(sql, "a", "viewer")).length, 1);
  await assert.rejects(
    setGrant(sql, "a", "viewer", "outsider@example.test", false),
    /Only the data owner/,
  );
  await assert.rejects(
    setGrant(sql, "a", "owner", "outsider@example.test", false),
    /verified workspace/,
  );
  await assert.rejects(listRecords(sql, "b", "viewer"), /access/);
  await setGrant(sql, "a", "owner", "viewer@example.test", true);
  await assert.rejects(listRecords(sql, "a", "viewer"), /access/);
  // Membership revocation removes access even if the private grant remains.
  await setGrant(sql, "a", "owner", "viewer@example.test", false);
  await db.exec(`delete from "member" where id='mv'`);
  await assert.rejects(listRecords(sql, "a", "viewer"), /access/);
  await assert.rejects(
    importRecords(sql, "a", {
      ...batch,
      requestId: "request-conflict",
      records: [{ ...row, providerId: "456" }],
    }),
    /conflicts/,
  );
  assert.equal(
    (await sql.query("select * from dts_batchdata_imports where request_id='request-conflict'"))
      .length,
    0,
  );
  assert.equal(
    (await sql.query("select * from dts_batchdata_observations where organization_id='a'")).length,
    3,
  );
  assert.notDeepEqual(
    identityKeys({ ...row, providerId: undefined, unit: "1" }),
    identityKeys({ ...row, providerId: undefined, unit: "2" }),
  );
  // Same address with a newly supplied ID adds an alias, not a second row.
  const second = { ...row, providerId: undefined, address: "11 Main St" };
  await importRecords(sql, "a", { ...batch, requestId: "request-004", records: [second] });
  await importRecords(sql, "a", {
    ...batch,
    requestId: "request-005",
    observedAt: "2026-01-03T00:00:00Z",
    records: [{ ...second, providerId: "789" }],
  });
  assert.equal((await listRecords(sql, "a", "owner")).length, 2);
  await assert.rejects(
    importRecords(sql, "a", {
      ...batch,
      requestId: "address-conflict",
      observedAt: "2026-01-05T00:00:00Z",
      records: [{ ...row, address: "900 Wrong Street" }],
    }),
    /conflicts/,
  );
  await listRecords(sql, "a", "owner", "", 100, "", "export");
  assert.equal(
    (
      await sql.query(
        "select * from dts_data_vault_reads where action='export' and organization_id='a' and actor_id='owner'",
      )
    ).length,
    1,
  );
  await setGrant(sql, "a", "owner", "viewer@example.test", true);
  assert.equal(
    (await sql.query("select * from dts_data_vault_grants where user_id='viewer'")).length,
    0,
  );
  const race = {
    ...batch,
    requestId: "concurrent-batch",
    records: [{ ...row, providerId: "concurrent", address: "77 Race St" }],
  };
  const raced = await Promise.all([importRecords(sql, "a", race), importRecords(sql, "a", race)]);
  assert.equal(raced.filter((r) => r.duplicate).length, 1);
  const csv = recordsCsv([{ data: { ownerName: '=HYPERLINK("bad")', phone: "+15555555555" } }]);
  assert.match(csv, /'=HYPERLINK/);
  assert.match(csv, /'\+15555555555/);
});
test("signed importer binds company on server and rejects tampering and stale signatures", () => {
  const raw = '{"version":1}',
    ts = String(Math.floor(Date.now() / 1000)),
    secret = "a".repeat(40);
  const env = {
    BATCHDATA_VAULT_IMPORT_ENABLED: "true",
    BATCHDATA_VAULT_INTEGRATIONS_JSON: JSON.stringify({ engine: { orgId: "a", secret } }),
  };
  const req = new Request("https://example.test", {
    headers: {
      "x-dts-integration": "engine",
      "x-dts-timestamp": ts,
      "x-dts-signature": createHmac("sha256", secret).update(`${ts}.${raw}`).digest("hex"),
    },
  });
  assert.equal(authenticateBatch(req, raw, env), "a");
  assert.throws(() => authenticateBatch(req, raw + " ", env));
  assert.throws(() => authenticateBatch(req, raw, env, Date.now() + 600000));
  assert.throws(() =>
    authenticateBatch(req, raw, { ...env, BATCHDATA_VAULT_IMPORT_ENABLED: "false" }),
  );
});
