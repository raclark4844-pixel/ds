import { leadFollowupSchema } from "../../../src/lib/lead-followup";
export default async function followup(event: { req: Request }) {
  const headers = { "Cache-Control": "no-store" };
  if (event.req.headers.get("origin") !== new URL(event.req.url).origin)
    return Response.json(
      { error: "Please submit from the Demore website." },
      { status: 403, headers },
    );
  const raw = await event.req.text();
  if (raw.length > 12000)
    return Response.json({ error: "Please shorten your request." }, { status: 413, headers });
  let input;
  try {
    input = leadFollowupSchema.safeParse(JSON.parse(raw));
  } catch {
    return Response.json(
      { error: "Check your contact details and goals." },
      { status: 400, headers },
    );
  }
  if (!input.success)
    return Response.json(
      {
        error:
          "Enter your name, company, valid email and phone, and at least 10 characters about your goals.",
      },
      { status: 400, headers },
    );
  const { rateLimit } = await import("../../../src/lib/comparison-store");
  const ip = event.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`lead-followup:${ip}`, 5, 15 * 60 * 1000))
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers },
    );
  const { sendLeadFollowup } = await import("../../../src/lib/report-mail");
  const sent = await sendLeadFollowup(input.data);
  if (!sent.ok)
    return Response.json(
      {
        error:
          "Your request could not be emailed. Please try again, or email ryan@demoretechnologysolutions.com.",
      },
      { status: 503, headers },
    );
  return Response.json({ ok: true }, { headers });
}
