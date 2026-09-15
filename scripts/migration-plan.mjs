import path from "node:path";

/**
 * Return unapplied migrations in stable filename order.
 * @param {string[]} paths
 * @param {string[]} completed
 */
export function pendingMigrations(paths, completed) {
  const done = new Set(completed);
  return paths
    .map((migrationPath) => ({
      name: path.posix.basename(migrationPath),
      path: migrationPath,
    }))
    .filter(({ name }) => !done.has(name))
    .sort((a, b) => a.name.localeCompare(b.name));
}
