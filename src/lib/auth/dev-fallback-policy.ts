/** Shared identities are permitted only in explicitly opted-in local development. */
export function allowLocalFallback(env: Record<string, string | undefined>): boolean {
  return (
    env.NODE_ENV === "development" &&
    env.LOCAL_DEV_AUTH_FALLBACK === "true" &&
    !env.DATABASE_URL?.trim() &&
    !env.VERCEL &&
    !env.VERCEL_ENV
  );
}

/** The authenticated branch never falls back to a shared identity. */
export async function resolveRequiredIdentity(options: {
  authenticationEnabled: boolean;
  allowFallback: boolean;
  getUser: () => Promise<{ id: string } | null>;
}): Promise<string | null> {
  if (options.authenticationEnabled) return (await options.getUser())?.id ?? null;
  return options.allowFallback ? "dev-user" : null;
}
