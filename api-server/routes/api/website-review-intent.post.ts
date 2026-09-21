import { z } from "zod";
import { readReviewTicket } from "../../../src/lib/website-review/ticket";
import {
  parseRevisionIntent,
  revisionIntentPrompt,
} from "../../../src/lib/website-review/revision-intent";
import { assistantRateLimit, runAssistant } from "../../../src/lib/assistant.server";
const schema = z.object({
  recordId: z.string().max(20),
  token: z.string().max(400000),
  message: z.string().trim().min(1).max(3000),
});
export default async function intent(event: { req: Request }) {
  const input = schema.safeParse(await event.req.json().catch(() => null));
  if (!input.success) return Response.json({ action: "none" });
  const report = readReviewTicket(input.data.token);
  if (!report || report.recordId !== input.data.recordId) return Response.json({ action: "none" });
  const ip = event.req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!assistantRateLimit(`intent:${ip}`)) return Response.json({ action: "none" });
  try {
    const reply = await runAssistant({
      intentOnly: true,
      message: revisionIntentPrompt(input.data.message),
      reviewBrief: report.assistantBrief,
    });
    return Response.json(
      { action: reply.ok && reply.endpoint !== "local" ? parseRevisionIntent(reply.text) : "none" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ action: "none" });
  }
}
