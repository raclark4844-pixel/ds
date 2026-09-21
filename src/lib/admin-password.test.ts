import assert from "node:assert/strict";
import { test } from "node:test";
import { hashAdminPassword, checkAdminPassword, resetTokenHash } from "./admin-password.ts";
test("passwords use salted hashes and reject incorrect credentials", async () => {
  const one = await hashAdminPassword("test-only-password-123");
  const two = await hashAdminPassword("test-only-password-123");
  assert.notEqual(one, two);
  assert.equal(await checkAdminPassword("test-only-password-123", one), true);
  assert.equal(await checkAdminPassword("wrong", one), false);
  assert.equal(await checkAdminPassword("wrong", "broken"), false);
});
test("reset token digests are deterministic and distinct", () => {
  assert.equal(resetTokenHash("one"), resetTokenHash("one"));
  assert.notEqual(resetTokenHash("one"), resetTokenHash("two"));
});
