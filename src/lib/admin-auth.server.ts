import { adminSessionSecret } from "./admin-credentials.server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { auth, authConfigured } from "@/lib/auth/server";

export class AdminAuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function allowedEmails() {
  const configured = process.env.ADMIN_EMAILS?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return new Set(configured?.length ? configured : ["ryan@demoretechnologysolutions.com"]);
}

const ADMIN_COOKIE = "__Host-dts-admin";
const sessionKey = adminSessionSecret;

function cookieValue(req: Request) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name === ADMIN_COOKIE) return value.join("=");
  }
  return "";
}

function signature(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

async function accessCookieValid(req: Request) {
  const key = await sessionKey();
  const token = cookieValue(req);
  const dot = token.lastIndexOf(".");
  if (!key || dot < 1) return false;
  const payload = token.slice(0, dot);
  const actual = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(signature(payload, key));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function createAdminAccessCookie(key: string) {
  if (!key) throw new AdminAuthError("Administrator access is not configured.", 503);
  const payload = Buffer.from(
    JSON.stringify({ v: 1, exp: Date.now() + 12 * 60 * 60 * 1000 }),
    "utf8",
  ).toString("base64url");
  return `${ADMIN_COOKIE}=${payload}.${signature(payload, key)}; Path=/; Max-Age=43200; HttpOnly; Secure; SameSite=Strict`;
}

export function clearAdminAccessCookie() {
  return `${ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export async function requireAdmin(req: Request) {
  if (await accessCookieValid(req)) return { id: "admin-access-key", email: "admin access key" };
  const production = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  if (!authConfigured) {
    if (!production && !process.env.DATABASE_URL?.trim())
      return { id: "dev-user", email: "dev@example.com" };
    throw new AdminAuthError("Administrator sign-in is not configured.", 503);
  }
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) throw new AdminAuthError("Sign in is required.", 401);
  const email = session.user.email?.toLowerCase();
  if (!email || !allowedEmails().has(email))
    throw new AdminAuthError("This account is not an administrator.", 403);
  return { id: session.user.id, email };
}

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error("[admin] request failed", error);
  return Response.json({ error: "The admin request could not be completed." }, { status: 500 });
}
