import test from "node:test";
import assert from "node:assert/strict";
import { internalWorkspaceAllowed } from "./internal-release";
test("internal release requires exact server-configured workspace identifiers", () => {
  const env = { INTERNAL_WORKSPACE_IDS: "a, b" };
  assert.equal(internalWorkspaceAllowed("a", env), true);
  assert.equal(internalWorkspaceAllowed("b", env), true);
  for (const id of ["", "ab", "A", "super_admin", "Demore Exterior Solutions"])
    assert.equal(internalWorkspaceAllowed(id, env), false);
  assert.equal(internalWorkspaceAllowed("a", {}), false);
});
