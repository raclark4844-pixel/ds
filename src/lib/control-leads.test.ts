import { captureProjectBrief, projectBriefLead } from "./project-brief-lead.ts";
import type { Sql } from "./db";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import {
  addLead,
  listLeads,
  routeLead,
  leadHistory,
  leadSchema,
  requireLeadOrigin,
  readLeadBody,
} from "./control-leads.ts";
const fixture = {
  siteId: "demore",
  source: "website-test",
  sourceRecordId: "fixture-001",
  name: "Test Lead",
  email: "TEST@example.invalid",
  phone: "+1 (440) 555-0100",
  interest: "Fixture only",
};
test("lead pipelines preserve idempotency, isolation, version checks and audit history", async () => {
  const db = new PGlite();
  await db.exec(
    readFileSync(new URL("../../migrations/0006_control_leads.sql", import.meta.url), "utf8"),
  );
  const sql: Pick<Sql, "query"> = {
    query: async <T>(text: string, params: unknown[]) => (await db.query<T>(text, params)).rows,
  };
  try {
    const results = await Promise.all([
      addLead(sql, fixture, "test-owner"),
      addLead(sql, fixture, "test-owner"),
    ]);
    assert.equal(results[0].id, results[1].id);
    assert.equal(results.filter((x) => !x.duplicate).length, 1);
    assert.equal((await leadHistory(sql, "demore", results[0].id)).length, 1);
    await assert.rejects(
      addLead(sql, { ...fixture, name: "Changed" }, "test-owner"),
      /different details/,
    );
    const other = await addLead(sql, { ...fixture, siteId: "demore-technology" }, "test-owner");
    assert.notEqual(other.id, results[0].id);
    assert.equal(other.possibleDuplicates.length, 0);
    const second = await addLead(
      sql,
      { ...fixture, sourceRecordId: "fixture-002", phone: "4405550100" },
      "test-owner",
    );
    assert.deepEqual(second.possibleDuplicates, [results[0].id]);
    assert.equal((await listLeads(sql, "demore")).items.length, 2);
    assert.equal((await listLeads(sql, "demore-technology")).items.length, 1);
    const route = {
      siteId: "demore",
      id: results[0].id,
      version: 1,
      stage: "qualified",
      owner: "ryan",
    };
    await assert.rejects(
      routeLead(sql, { ...route, siteId: "demore-technology" }, "test-owner"),
      /not found/,
    );
    const updated = await routeLead(sql, route, "test-owner");
    assert.equal(updated.version, 2);
    assert.equal(updated.owner, "ryan");
    await assert.rejects(routeLead(sql, route, "test-owner"), /changed/);
    assert.equal((await leadHistory(sql, "demore", results[0].id)).length, 2);
    assert.equal((await leadHistory(sql, "demore-technology", results[0].id)).length, 0);
    const stored = (await listLeads(sql, "demore")).items.find((x) => x.id === results[0].id);
    assert.ok(stored);
    assert.equal(stored.email, "test@example.invalid");
    assert.equal("request_hash" in stored, false);
    await assert.rejects(addLead(sql, { ...fixture, siteId: "unknown" }, "test-owner"));
    const brief = {
      submissionId: "12345678-1234-4234-8234-123456789abc",
      name: "Brief fixture",
      email: "brief@example.invalid",
      industry: "Restaurant",
      wants: ["website"],
      businessName: "Fixture business",
      reportId: "DTS-TEST",
    };
    const captured = await captureProjectBrief(sql, brief);
    const retry = await captureProjectBrief(sql, brief);
    assert.equal(captured.id, retry.id);
    assert.equal(retry.duplicate, true);
    const briefRow = (await listLeads(sql, "demore-technology")).items.find(
      (x) => x.id === captured.id,
    );
    assert.equal(briefRow?.source, "website-brief");
    assert.match(String(briefRow?.interest), /DTS-TEST/);
    assert.equal(
      (await listLeads(sql, "demore")).items.some((x) => x.id === captured.id),
      false,
    );
    assert.throws(() => projectBriefLead({ ...brief, submissionId: "bad" }), /Invalid submission/);
  } finally {
    await db.close();
  }
});
test("validation, origin and request size fail closed", async () => {
  assert.equal(leadSchema.safeParse({ ...fixture, email: "", phone: "" }).success, false);
  assert.equal(leadSchema.safeParse({ ...fixture, email: "invalid" }).success, false);
  assert.throws(
    () =>
      requireLeadOrigin(
        new Request("https://www.demoretechnologysolutions.com/api/admin/control-leads", {
          method: "POST",
          headers: { origin: "https://attacker.example", "content-type": "application/json" },
        }),
      ),
    /Same-site/,
  );
  assert.throws(
    () =>
      requireLeadOrigin(
        new Request("https://www.demoretechnologysolutions.com/api/admin/control-leads", {
          method: "POST",
          headers: { "content-type": "application/json" },
        }),
      ),
    /Same-site/,
  );
  requireLeadOrigin(
    new Request("https://www.demoretechnologysolutions.com/api/admin/control-leads", {
      method: "POST",
      headers: {
        origin: "https://www.demoretechnologysolutions.com",
        "content-type": "application/json",
      },
    }),
  );
  await assert.rejects(
    readLeadBody(
      new Request("https://example.invalid", { method: "POST", body: "x".repeat(13000) }),
    ),
    /too large/,
  );
  await assert.rejects(
    readLeadBody(new Request("https://example.invalid", { method: "POST", body: "not json" })),
    /Invalid JSON/,
  );
});
