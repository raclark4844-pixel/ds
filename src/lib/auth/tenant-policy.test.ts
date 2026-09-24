import test from "node:test";
import assert from "node:assert/strict";
import { roleMeets, hasPlatformAuthority, selectMembership } from "./tenant-policy";
test("organization owners are never platform administrators", () => {
  for (const role of [
    "owner",
    "admin",
    "client_admin",
    "member",
    "client_viewer",
    "constructor",
    "__proto__",
    "super_admin,unknown",
    "",
  ])
    assert.equal(roleMeets(role, "super_admin"), false);
  assert.equal(roleMeets("owner", "client_admin"), true);
  assert.equal(
    hasPlatformAuthority([{ organizationId: "client", role: "super_admin" }], "platform"),
    false,
  );
  assert.equal(
    hasPlatformAuthority([{ organizationId: "platform", role: "super_admin" }], "platform"),
    true,
  );
});
test("missing, revoked and ambiguous active organizations fail closed", () => {
  const rows = [
    { organizationId: "a", role: "client_admin" },
    { organizationId: "b", role: "client_viewer" },
  ];
  assert.equal(selectMembership(rows, "other"), null);
  assert.equal(selectMembership(rows, null), null);
  assert.equal(selectMembership(rows, "b")?.organizationId, "b");
  assert.equal(selectMembership([rows[0]], null)?.organizationId, "a");
  assert.equal(selectMembership([{ organizationId: "a", role: "bad" }], "a"), null);
});
