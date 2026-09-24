import { test } from "node:test";
import assert from "node:assert/strict";
import { allowLocalFallback, resolveRequiredIdentity } from "./dev-fallback-policy";

test("only explicitly opted-in, database-free local development can share an identity", () => {
  for (const NODE_ENV of [undefined, "test", "production", "development"]) {
    for (const DATABASE_URL of [undefined, "postgres://configured"]) {
      for (const VERCEL_ENV of [undefined, "preview", "production"]) {
        for (const LOCAL_DEV_AUTH_FALLBACK of [undefined, "false", "true"]) {
          const expected =
            NODE_ENV === "development" &&
            !DATABASE_URL &&
            !VERCEL_ENV &&
            LOCAL_DEV_AUTH_FALLBACK === "true";
          assert.equal(
            allowLocalFallback({ NODE_ENV, DATABASE_URL, VERCEL_ENV, LOCAL_DEV_AUTH_FALLBACK }),
            expected,
          );
        }
      }
    }
  }
  assert.equal(
    allowLocalFallback({ NODE_ENV: "development", LOCAL_DEV_AUTH_FALLBACK: "true", VERCEL: "1" }),
    false,
  );
});
test("valid authentication always returns the verified user", async () => {
  assert.equal(
    await resolveRequiredIdentity({
      authenticationEnabled: true,
      allowFallback: true,
      getUser: async () => ({ id: "verified-user" }),
    }),
    "verified-user",
  );
});
test("missing authenticated session cannot use development fallback", async () => {
  assert.equal(
    await resolveRequiredIdentity({
      authenticationEnabled: true,
      allowFallback: true,
      getUser: async () => null,
    }),
    null,
  );
});
test("disabled authentication rejects unless local fallback is explicitly allowed", async () => {
  const getUser = async () => {
    throw Error("must not resolve a disabled session");
  };
  assert.equal(
    await resolveRequiredIdentity({ authenticationEnabled: false, allowFallback: false, getUser }),
    null,
  );
  assert.equal(
    await resolveRequiredIdentity({ authenticationEnabled: false, allowFallback: true, getUser }),
    "dev-user",
  );
});
