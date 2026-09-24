import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

export const PRODUCT_ROLES = ["client_viewer", "client_admin", "super_admin"] as const;
export type { ProductRole } from "./tenant-policy";
export { roleMeets } from "./tenant-policy";

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

export const PLATFORM_ORG_ID = "org_demore_technology_solutions";
export const PLATFORM_ORG_SLUG = "demore-technology-solutions";
