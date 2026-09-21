import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { finishAdminPasswordReset } from "./admin-password-reset.ts";
import { resetTokenHash, checkAdminPassword } from "./admin-password.ts";
import type { Sql } from "./db";
test("reset tokens expire, are consumed once, and rotate sessions", async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile("migrations/0005_admin_password_reset.sql", "utf8"));
    const sql = { query: async (q: string, p: unknown[]) => (await db.query(q, p)).rows } as Pick<
      Sql,
      "query"
    >;
    await db.query(
      "UPDATE dts_admin_credentials SET reset_hash=$1, reset_expires_at=now()-interval '1 minute', session_secret='old-session' WHERE id=1",
      [resetTokenHash("expired")],
    );
    assert.equal(await finishAdminPasswordReset(sql, "expired", "new-test-password-123"), false);
    await db.query(
      "UPDATE dts_admin_credentials SET reset_hash=$1, reset_expires_at=now()+interval '15 minutes' WHERE id=1",
      [resetTokenHash("valid")],
    );
    assert.equal(await finishAdminPasswordReset(sql, "incorrect", "new-test-password-123"), false);
    assert.equal(await finishAdminPasswordReset(sql, "valid", "new-test-password-123"), true);
    assert.equal(await finishAdminPasswordReset(sql, "valid", "other-password-123"), false);
    const row = (
      await db.query<{ password_hash: string; session_secret: string; reset_hash: string | null }>(
        "SELECT * FROM dts_admin_credentials",
      )
    ).rows[0];
    assert.equal(await checkAdminPassword("new-test-password-123", row.password_hash), true);
    assert.notEqual(row.session_secret, "old-session");
    assert.equal(row.reset_hash, null);
  } finally {
    await db.close();
  }
});
