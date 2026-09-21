import { getSql } from "@/lib/db";
import { checkAdminPassword } from "./admin-password";
import { timingSafeEqual } from "node:crypto";
type Credential = { password_hash: string | null; session_secret: string | null };
export async function adminCredential() {
  const sql = await getSql();
  const rows =
    await sql<Credential>`SELECT password_hash, session_secret FROM dts_admin_credentials WHERE id = 1`;
  return rows[0];
}
export async function adminSessionSecret() {
  const stored = await adminCredential();
  return stored?.session_secret || process.env.ADMIN_ACCESS_KEY?.trim() || "";
}
export async function authenticateAdminPassword(candidate: string) {
  const stored = await adminCredential();
  if (stored?.password_hash)
    return (await checkAdminPassword(candidate, stored.password_hash))
      ? stored.session_secret
      : null;
  const key = process.env.ADMIN_ACCESS_KEY?.trim() || "";
  const actual = Buffer.from(candidate),
    expected = Buffer.from(key);
  return key && actual.length === expected.length && timingSafeEqual(actual, expected) ? key : null;
}
