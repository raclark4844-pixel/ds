import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

export const PRODUCT_ROLES = ["client_viewer", "client_admin", "super_admin"] as const;
export type ProductRole = (typeof PRODUCT_ROLES)[number];

export const ROLE_RANK: Record<string, number> = {
  member: 1,
  client_viewer: 1,
  admin: 2,
  client_admin: 2,
  owner: 3,
  super_admin: 3,
};

export const tenantStatements = {
  ...defaultStatements,
  tenant: ["read", "manage", "bill"],
} as const;

export const tenantAccessControl = createAccessControl(tenantStatements);

export const tenantRoles = {
  owner: tenantAccessControl.newRole({
    organization: ["update", "delete"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    team: ["create", "update", "delete"],
    ac: ["create", "read", "update", "delete"],
    tenant: ["read", "manage", "bill"],
  }),
  admin: tenantAccessControl.newRole({
    organization: ["update"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    team: ["create", "update"],
    ac: ["read"],
    tenant: ["read", "manage", "bill"],
  }),
  member: tenantAccessControl.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
    tenant: ["read"],
  }),
  client_viewer: tenantAccessControl.newRole({
    organization: [],
    member: [],
    invitation: [],
    team: [],
    ac: ["read"],
    tenant: ["read"],
  }),
  client_admin: tenantAccessControl.newRole({
    organization: ["update"],
    member: ["create", "update"],
    invitation: ["create", "cancel"],
    team: ["create", "update"],
    ac: ["read"],
    tenant: ["read", "manage", "bill"],
  }),
  super_admin: tenantAccessControl.newRole({
    organization: ["update", "delete"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    team: ["create", "update", "delete"],
    ac: ["create", "read", "update", "delete"],
    tenant: ["read", "manage", "bill"],
  }),
};

export function roleMeets(actual: string | null | undefined, minRole: ProductRole) {
  const have = Math.max(
    0,
    ...(actual || "")
      .split(",")
      .map((part) => ROLE_RANK[part.trim()] || 0),
  );
  return have >= (ROLE_RANK[minRole] || 0);
}

export const PLATFORM_ORG_ID = "org_demore_technology_solutions";
export const PLATFORM_ORG_SLUG = "demore-technology-solutions";
