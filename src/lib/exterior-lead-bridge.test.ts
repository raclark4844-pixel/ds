import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "./db";
import { requireExteriorBridge, captureExteriorLead } from "./exterior-lead-bridge.ts";
import { listLeads, leadHistory } from "./control-leads.ts";

test("bridge rejects absent, invalid and malformed credentials", () => {
  const secret = "a".repeat(64); // Synthetic test credential only.
  const request = (value?: string, type = "application/json") => new Request("https://example.invalid", {
    method: "POST", headers: { "content-type": type, ...(value ? { authorization: value } : {}) },
  });
  const status = (n: number) => (e: unknown) => (e as { status: number }).status === n;
  assert.throws(() => requireExteriorBridge(request(), undefined), status(503));
  assert.throws(() => requireExteriorBridge(request(), secret), status(401));
  assert.throws(() => requireExteriorBridge(request(`Bearer ${"b".repeat(64)}`), secret), status(401));
  assert.throws(() => requireExteriorBridge(request(`Bearer ${"é".repeat(64)}`), secret), status(401));
  assert.throws(() => requireExteriorBridge(request(`Bearer ${secret}`, "text/plain"), secret), status(415));
  requireExteriorBridge(request(`Bearer ${secret}`), secret);
});

test("bridge binds site/source, deduplicates retries and records a single capture", async () => {
  const db = new PGlite();
  await db.exec(readFileSync(new URL("../../migrations/0006_control_leads.sql", import.meta.url), "utf8"));
  const sql: Pick<Sql, "query"> = { query: async <T>(text: string, params: unknown[]) => (await db.query<T>(text, params)).rows };
  const lead = { sourceRecordId: "base44-fixture-01", name: "Bridge fixture", email: "bridge@example.invalid", phone: "", interest: "Test only" };
  try {
    const receipt = await captureExteriorLead(sql, lead);
    const retry = await captureExteriorLead(sql, lead);
    assert.equal(receipt.id, retry.id);
    assert.equal(retry.duplicate, true);
    assert.deepEqual(Object.keys(receipt).sort(), ["duplicate", "id"]);
    assert.equal((await listLeads(sql, "demore")).items.length, 1);
    assert.equal((await listLeads(sql, "demore-technology")).items.length, 0);
    assert.equal((await leadHistory(sql, "demore", receipt.id)).length, 1);
    await assert.rejects(captureExteriorLead(sql, { ...lead, siteId: "demore-technology" }));
    await assert.rejects(captureExteriorLead(sql, { ...lead, source: "manual" }));
    await assert.rejects(captureExteriorLead(sql, { ...lead, email: "", phone: "" }));
    await assert.rejects(captureExteriorLead(sql, { ...lead, interest: "changed" }), /different details/);
  } finally { await db.close(); }
});
