/** Internal access never follows a company name/email suffix or a Stripe status. */
export function internalWorkspaceAllowed(org: string, env: NodeJS.ProcessEnv = process.env) {
  return (
    Boolean(org) &&
    new Set(
      (env.INTERNAL_WORKSPACE_IDS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ).has(org)
  );
}
