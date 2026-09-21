import { randomBytes } from "node:crypto";
import { hashAdminPassword, resetTokenHash } from "./admin-password";
import type { Sql } from "./db";
export async function finishAdminPasswordReset(
  sql: Pick<Sql, "query">,
  token: string,
  password: string,
) {
  const hash = resetTokenHash(token);
  const found = await sql.query(
    "SELECT id FROM dts_admin_credentials WHERE id = 1 AND reset_hash = $1 AND reset_expires_at > now()",
    [hash],
  );
  if (!found.length) return false;
  const passwordHash = await hashAdminPassword(password);
  const secret = randomBytes(32).toString("hex");
  const updated = await sql.query(
    "UPDATE dts_admin_credentials SET password_hash = $1, session_secret = $2, reset_hash = NULL, reset_expires_at = NULL, updated_at = now() WHERE id = 1 AND reset_hash = $3 AND reset_expires_at > now() RETURNING id",
    [passwordHash, secret, hash],
  );
  return updated.length === 1;
}
