import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth/server";
import { ensurePlatformSuperAdmin } from "@/lib/auth/ensure-platform-admin.server";
import { PLATFORM_ORG_ID, isPlatformOwnerEmail } from "@/lib/auth/platform-owners";
import {
  type ProductRole,
  roleMeets,
} from "@/lib/auth/tenant-roles";

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
  user?: { id?: string; email?: string | null };
  session?: { activeOrganizationId?: string | null };
};

async function sessionFromRequest(req: Request): Promise<SessionLike | null> {
  try {
    return (await auth.api.getSession({ headers: req.headers })) as SessionLike | null;
  } catch {
    return null;
  }
}

async function membership(userId: string, organizationId: string) {
  const sql = await getSql();
  const rows = await sql.query<{ role: string }>(
    `select role from "member" where "userId" = $1 and "organizationId" = $2 limit 1`,
    [userId, organizationId],
  );
  return rows[0] || null;
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
  if (!userId) return null;

  if (isPlatformOwnerEmail(session?.user?.email)) {
    await ensurePlatformSuperAdmin({
      id: userId,
      email: session?.user?.email,
    });
  }

  const rows = await memberships(userId);
  if (!rows.length) return null;

  const requested = session?.session?.activeOrganizationId || "";
  const active = rows.find((row) => row.organizationId === requested) || rows[0];
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
  if (user.id === "admin-access-key" || roleMeets(user.role, "super_admin")) {
    return { organizationId, role: user.role || "super_admin" };
  }
  const row = await membership(user.id, organizationId);
  const role = row?.role || user.role || "";
  if (roleMeets(role, "super_admin")) return { organizationId, role };
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
  try {
    return await resolveActiveOrganization(req);
  } catch {
    return null;
  }
}

export function platformOrganizationId() {
  return PLATFORM_ORG_ID;
}
