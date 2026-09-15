import { z } from "zod";

const schema = z.object({ accessKey: z.string().min(12).max(500) });
const attempts = new Map<string, number[]>();

function allowed(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < 15 * 60 * 1000);
  if (recent.length >= 8) return false;
  recent.push(now); attempts.set(ip, recent); return true;
}

export default async function adminSession(event: { req: Request }) {
  const { adminAccessConfigured, createAdminAccessCookie, verifyAdminAccessKey } = await import("../../../../src/lib/admin-auth.server");
  if (!adminAccessConfigured()) return Response.json({ error: "ADMIN_ACCESS_KEY is not configured." }, { status: 503 });
  const ip = event.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowed(ip)) return Response.json({ error: "Too many sign-in attempts. Try again later." }, { status: 429 });
  let parsed;
  try { parsed = schema.parse(await event.req.json()); } catch { return Response.json({ error: "Enter the administrator access key." }, { status: 400 }); }
  if (!verifyAdminAccessKey(parsed.accessKey)) return Response.json({ error: "The administrator access key is incorrect." }, { status: 401 });
  return Response.json({ ok: true }, { headers: { "Set-Cookie": createAdminAccessCookie(), "Cache-Control": "no-store" } });
}
