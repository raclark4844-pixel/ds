import { finishAdminPasswordReset } from "../../../../src/lib/admin-password-reset";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { getSql } from "../../../../src/lib/db";
import { resetTokenHash } from "../../../../src/lib/admin-password";
const owner = "ryan@demoretechnologysolutions.com";
const requestSchema = z.object({
  action: z.literal("request"),
  email: z.string().email().max(254),
});
const completeSchema = z.object({
  action: z.literal("complete"),
  token: z.string().regex(/^[a-f0-9]{64}$/),
  password: z.string().min(12).max(128),
});
const generic = {
  ok: true,
  message:
    "If this is the administrator email, a reset link will arrive shortly. Check your spam folder too.",
};
export default async function reset(event: { req: Request }) {
  const raw = await event.req.json().catch(() => null);
  const input = z.union([requestSchema, completeSchema]).safeParse(raw);
  if (!input.success)
    return Response.json(
      { error: "Enter a valid email, or use your reset link and a password of 12–128 characters." },
      { status: 400 },
    );
  const { rateLimit } = await import("../../../../src/lib/comparison-store");
  const ip = event.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`admin-reset:${ip}`, 8, 15 * 60 * 1000))
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  const sql = await getSql();
  if (input.data.action === "request") {
    if (input.data.email.toLowerCase() !== owner) return Response.json(generic);
    const token = randomBytes(32).toString("hex");
    const hash = resetTokenHash(token);
    const rows =
      await sql`UPDATE dts_admin_credentials SET reset_hash = ${hash}, reset_expires_at = now() + interval '15 minutes', reset_requested_at = now() WHERE id = 1 AND (reset_requested_at IS NULL OR reset_requested_at < now() - interval '2 minutes') RETURNING id`;
    if (rows.length) {
      const { sendAdminPasswordReset } = await import("../../../../src/lib/report-mail");
      const sent = await sendAdminPasswordReset(
        `https://www.demoretechnologysolutions.com/login#reset=${token}`,
      );
      if (!sent.ok) {
        await sql`UPDATE dts_admin_credentials SET reset_hash = NULL, reset_requested_at = NULL, reset_expires_at = NULL WHERE id = 1 AND reset_hash = ${hash}`;
        return Response.json(
          { error: "Reset email could not be sent. Please try again shortly." },
          { status: 503 },
        );
      }
    }
    return Response.json(generic, { headers: { "Cache-Control": "no-store" } });
  }
  if (!(await finishAdminPasswordReset(sql, input.data.token, input.data.password)))
    return Response.json(
      { error: "This reset link has expired or was already used. Request a new one." },
      { status: 400 },
    );
  return Response.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store",
        "Set-Cookie": "__Host-dts-admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict",
      },
    },
  );
}
