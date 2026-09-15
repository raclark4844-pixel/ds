import { auth, authConfigured } from "@/lib/auth/server";

export class AdminAuthError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function allowedEmails() {
  const configured = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  return new Set(configured?.length ? configured : ["ryan@demoretechnologysolutions.com"]);
}

export async function requireAdmin(req: Request) {
  const production = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
  if (!authConfigured) {
    if (!production && !process.env.DATABASE_URL?.trim()) return { id: "dev-user", email: "dev@example.com" };
    throw new AdminAuthError("Administrator sign-in is not configured.", 503);
  }
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) throw new AdminAuthError("Sign in is required.", 401);
  const email = session.user.email?.toLowerCase();
  if (!email || !allowedEmails().has(email)) throw new AdminAuthError("This account is not an administrator.", 403);
  return { id: session.user.id, email };
}

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) return Response.json({ error: error.message }, { status: error.status });
  console.error("[admin] request failed", error);
  return Response.json({ error: "The admin request could not be completed." }, { status: 500 });
}
