/** Organization ownership is local to that organization, not platform authority. */
export type ProductRole = "client_viewer" | "client_admin" | "super_admin";
const rank = new Map<string, number>([
  ["member", 1],
  ["client_viewer", 1],
  ["admin", 2],
  ["client_admin", 2],
  ["owner", 2],
  ["super_admin", 3],
]);
export function roleMeets(actual: string | null | undefined, required: ProductRole) {
  const needed = rank.get(required);
  if (needed === undefined) return false;
  const roles = (actual || "").split(",").map((r) => r.trim());
  if (!roles.length || roles.some((r) => !rank.has(r))) return false;
  return Math.max(...roles.map((r) => rank.get(r)!)) >= needed;
}
export function hasPlatformAuthority(
  rows: { organizationId: string; role: string }[],
  platformId: string,
) {
  return rows.some(
    (row) => row.organizationId === platformId && roleMeets(row.role, "super_admin"),
  );
}
export function selectMembership(
  rows: { organizationId: string; role: string }[],
  activeId?: string | null,
) {
  // A removed/forged active organization never silently switches the user's scope.
  const row = activeId
    ? rows.find((r) => r.organizationId === activeId)
    : rows.length === 1
      ? rows[0]
      : undefined;
  return row && roleMeets(row.role, "client_viewer") ? row : null;
}
