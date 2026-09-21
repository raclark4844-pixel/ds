import { z } from "zod";

const schema = z.object({ accessKey: z.string().min(12).max(500) });
const attempts = new Map<string, number[]>();

function allowed(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 8) return false;
  recent.push(now);
  attempts.set(ip, recent);
  return true;
}

export default async function adminSession(event: { req: Request }) {
  const { createAdminAccessCookie } = await import("../../../../src/lib/admin-auth.server");
  const { authenticateAdminPassword } =
    await import("../../../../src/lib/admin-credentials.server");
  const ip = event.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(ip))
    return Response.json({ error: "Too many sign-in attempts. Try again later." }, { status: 429 });
  let parsed;
  try {
    parsed = schema.parse(await event.req.json());
  } catch {
    return Response.json({ error: "Enter your administrator password." }, { status: 400 });
  }
  const key = await authenticateAdminPassword(parsed.accessKey);
  if (!key) return Response.json({ error: "The password is incorrect." }, { status: 401 });
  return Response.json(
    { ok: true },
    { headers: { "Set-Cookie": createAdminAccessCookie(key), "Cache-Control": "no-store" } },
  );
}
