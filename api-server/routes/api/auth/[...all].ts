export default async function authRoute(event: { req: Request }) {
  const [{ ensureDbReady }, { auth }] = await Promise.all([
    import("../../../../src/lib/db"),
    import("../../../../src/lib/auth/server"),
  ]);
  await ensureDbReady();
  return auth.handler(event.req);
}
