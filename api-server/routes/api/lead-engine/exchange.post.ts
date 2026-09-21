import { consumeSigninCode } from "../../../../src/lib/website-signin";
export default async function exchange(event: { req: Request }) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const body = await event.req.text();
    if (body.length > 1024)
      return Response.json({ error: "Invalid sign-in." }, { status: 400, headers });
    const { code, verifier } = JSON.parse(body);
    if (typeof code !== "string" || typeof verifier !== "string")
      return Response.json({ error: "Invalid sign-in." }, { status: 400, headers });
    const { getSql } = await import("../../../../src/lib/db");
    const email = await consumeSigninCode(await getSql(), code, verifier);
    return email
      ? Response.json({ email }, { headers })
      : Response.json({ error: "Sign-in expired. Please try again." }, { status: 400, headers });
  } catch {
    return Response.json({ error: "Sign-in could not be completed." }, { status: 503, headers });
  }
}
