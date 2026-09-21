import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  issueSigninCode,
  consumeSigninCode,
  challengeFor,
  validSigninParameters,
  digestCode,
} from "./website-signin.ts";
import type { Sql } from "./db";
test("sign-in codes require the browser proof, expire, and can be used only once", async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile("migrations/0012_website_signin_codes.sql", "utf8"));
    const sql = { query: async (q: string, p: unknown[]) => (await db.query(q, p)).rows } as Pick<
      Sql,
      "query"
    >;
    const verifier = "a".repeat(64);
    const code = await issueSigninCode(sql, "Employee@Example.com", challengeFor(verifier));
    assert.equal(await consumeSigninCode(sql, code, "b".repeat(64)), null);
    const results = await Promise.all([
      consumeSigninCode(sql, code, verifier),
      consumeSigninCode(sql, code, verifier),
    ]);
    assert.deepEqual(results.sort(), ["employee@example.com", null].sort());
    assert.equal(await consumeSigninCode(sql, code, verifier), null);
    const expired = await issueSigninCode(sql, "employee@example.com", challengeFor(verifier));
    await db.query(
      "UPDATE dts_signin_codes SET expires_at=now()-interval '1 second' WHERE code_hash=$1",
      [digestCode(expired)],
    );
    assert.equal(await consumeSigninCode(sql, expired, verifier), null);
    assert.equal(validSigninParameters("a".repeat(64), challengeFor(verifier)), true);
    assert.equal(validSigninParameters("https://evil.example", challengeFor(verifier)), false);
  } finally {
    await db.close();
  }
});
