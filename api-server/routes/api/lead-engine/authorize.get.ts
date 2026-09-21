import {
  CALLBACK,
  WEBSITE_ORIGIN,
  validSigninParameters,
  issueSigninCode,
} from "../../../../src/lib/website-signin";
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };
export default async function authorize(event: { req: Request }) {
  const url = new URL(event.req.url);
  const state = url.searchParams.get("state") || "";
  const challenge = url.searchParams.get("challenge") || "";
  if (!validSigninParameters(state, challenge))
    return Response.json(
      { error: "Start sign-in from the Lead Engine." },
      { status: 400, headers },
    );
  try {
    const { accessCookieValid } = await import("../../../../src/lib/admin-auth.server");
    let email: string | undefined;
    if (await accessCookieValid(event.req)) email = "ryan@demoretechnologysolutions.com";
    else {
      const { auth, authConfigured } = await import("../../../../src/lib/auth/server");
      const session = authConfigured
        ? await auth.api.getSession({
            headers: event.req.headers,
            query: { disableCookieCache: true },
          })
        : null;
      if (session?.user?.emailVerified) email = session.user.email.toLowerCase();
    }
    if (!email) {
      const login = new URL("/login", WEBSITE_ORIGIN);
      login.search = new URLSearchParams({ app: "lead-engine", state, challenge }).toString();
      return new Response(null, { status: 302, headers: { ...headers, Location: login.href } });
    }
    const { getSql } = await import("../../../../src/lib/db");
    const code = await issueSigninCode(await getSql(), email, challenge);
    const callback = new URL(CALLBACK);
    callback.search = new URLSearchParams({ code, state }).toString();
    return new Response(null, { status: 302, headers: { ...headers, Location: callback.href } });
  } catch {
    return Response.json(
      { error: "Sign-in is temporarily unavailable. Please try again." },
      { status: 503, headers },
    );
  }
}
