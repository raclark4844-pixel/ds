import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { ensurePlatformSuperAdmin } from "@/lib/auth/ensure-platform-admin.server";
import { hasPlatformAuthority, selectMembership } from "./tenant-policy";
import { PLATFORM_ORG_ID, isPlatformOwnerEmail } from "@/lib/auth/platform-owners";
import { type ProductRole, roleMeets } from "@/lib/auth/tenant-roles";

export class TenantAccessError extends Error {
  readonly status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "TenantAccessError";
    this.status = status;
  }
}

export type TenantContext = {
  userId: string;
  email: string | null;
  organizationId: string;
  role: string;
};

type SessionLike = {
  user?: { id?: string; email?: string | null; emailVerified?: boolean };
  session?: { activeOrganizationId?: string | null };
};

async function sessionFromRequest(req: Request): Promise<SessionLike | null> {
  try {
    return (await auth.api.getSession({
      headers: req.headers,
      query: { disableCookieCache: true },
    })) as SessionLike | null;
  } catch {
    throw new TenantAccessError("Session verification is temporarily unavailable.", 503);
  }
}

async function memberships(userId: string) {
  const sql = await getSql();
  return sql.query<{ organizationId: string; role: string }>(
    `select "organizationId", role from "member" where "userId" = $1 order by "createdAt" asc`,
    [userId],
  );
}

async function shopAdminCookieValid(req: Request) {
  try {
    const { accessCookieValid } = await import("@/lib/admin-auth.server");
    return await accessCookieValid(req);
  } catch {
    return false;
  }
}

export async function resolveActiveOrganization(req: Request): Promise<TenantContext | null> {
  if (await shopAdminCookieValid(req)) {
    return {
      userId: "admin-access-key",
      email: "admin access key",
      organizationId: PLATFORM_ORG_ID,
      role: "super_admin",
    };
  }

  const session = await sessionFromRequest(req);
  const userId = session?.user?.id;
  if (!userId) {
    if (
      req.headers.has("authorization") ||
      /(?:__Host-grok-auth\.session_token|better-auth\.session_token|__Host-dts-admin)=/.test(
        req.headers.get("cookie") || "",
      )
    )
      throw new TenantAccessError("Sign in again before using this workspace.", 401);
    return null;
  }
  if (session?.user?.emailVerified !== true)
    throw new TenantAccessError("Verify your sign-in email before using the workspace.", 403);

  if (isPlatformOwnerEmail(session?.user?.email)) {
    await ensurePlatformSuperAdmin({
      id: userId,
      email: session?.user?.email,
    });
  }

  const rows = await memberships(userId);
  if (!rows.length) throw new TenantAccessError("This account has no workspace membership.");

  const requested = session?.session?.activeOrganizationId || "";
  const active = selectMembership(rows, requested);
  if (!active) throw new TenantAccessError("Select an authorized workspace.");
  return {
    userId,
    email: session?.user?.email ?? null,
    organizationId: active.organizationId,
    role: active.role,
  };
}

export async function assertOrganizationAccess(
  organizationId: string,
  user: { id: string; role?: string | null },
  minRole: ProductRole = "client_viewer",
) {
  if (!organizationId) throw new TenantAccessError("Organization is required.", 400);
  // The caller's role is deliberately ignored; resolve fresh DB memberships.
  const rows = await memberships(user.id);
  if (hasPlatformAuthority(rows, PLATFORM_ORG_ID)) return { organizationId, role: "super_admin" };
  const row = rows.find((r) => r.organizationId === organizationId);
  if (!row) throw new TenantAccessError("This account cannot use that workspace.", 403);
  if (!roleMeets(row.role, minRole)) {
    throw new TenantAccessError("This account cannot perform that action.", 403);
  }
  return { organizationId, role: row.role };
}

export function organizationScopeSql(organizationId: string | null | undefined) {
  return organizationId ? { clause: "organization_id = $ORG", organizationId } : null;
}

export async function tryResolveTenant(req: Request): Promise<TenantContext | null> {
  return resolveActiveOrganization(req);
}

export function platformOrganizationId() {
  return PLATFORM_ORG_ID;
}
