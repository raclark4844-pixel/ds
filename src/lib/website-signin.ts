import { createHash, randomBytes } from "node:crypto";
import type { Sql } from "./db";
export const WEBSITE_ORIGIN = "https://www.demoretechnologysolutions.com";
export const ENGINE_ORIGIN = "https://demore-lead-engine.vercel.app";
export const CALLBACK = `${ENGINE_ORIGIN}/api/website-signin/callback`;
export const digestCode = (value: string) => createHash("sha256").update(value).digest("hex");
export const challengeFor = (value: string) =>
  createHash("sha256").update(value).digest("base64url");
export function validSigninParameters(state: string, challenge: string) {
  return /^[a-f0-9]{64}$/.test(state) && /^[A-Za-z0-9_-]{43}$/.test(challenge);
}
export async function issueSigninCode(sql: Pick<Sql, "query">, email: string, challenge: string) {
  const code = randomBytes(32).toString("hex");
  await sql.query("DELETE FROM dts_signin_codes WHERE expires_at <= now()");
  await sql.query(
    "INSERT INTO dts_signin_codes(code_hash, challenge, email, expires_at) VALUES($1,$2,$3,now()+interval '60 seconds')",
    [digestCode(code), challenge, email.toLowerCase()],
  );
  return code;
}
export async function consumeSigninCode(sql: Pick<Sql, "query">, code: string, verifier: string) {
  if (!/^[a-f0-9]{64}$/.test(code) || !/^[a-f0-9]{64}$/.test(verifier)) return null;
  const rows = await sql.query<{ email: string }>(
    "DELETE FROM dts_signin_codes WHERE code_hash=$1 AND challenge=$2 AND expires_at>now() RETURNING email",
    [digestCode(code), challengeFor(verifier)],
  );
  return rows[0]?.email ?? null;
}
