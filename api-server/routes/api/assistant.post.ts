import { assistantRateLimit, runAssistant } from "../../../src/lib/assistant.server";

export default async function assistant(event: { req: Request }) {
  const req = event.req;
  if (req.method.toUpperCase() !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!assistantRateLimit(ip)) {
    return Response.json(
      { error: "Too many assistant requests. Try again shortly." },
      { status: 429 },
    );
  }
  let raw: {
    industries?: string[];
    message?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    reportId?: string;
    token?: string;
    reviewBrief?: string;
  };
  try {
    raw = (await req.json()) as typeof raw;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const message = typeof raw.message === "string" ? raw.message.trim() : "";
  if (!message) return Response.json({ error: "Message is required." }, { status: 400 });
  const result = await runAssistant({
    message,
    industries: raw.industries,
    history: Array.isArray(raw.history) ? raw.history : [],
    reportId: typeof raw.reportId === "string" ? raw.reportId : "",
    token: typeof raw.token === "string" ? raw.token : "",
    reviewBrief: typeof raw.reviewBrief === "string" ? raw.reviewBrief : "",
  });
  return Response.json(result, { status: result.ok ? 200 : 503 });
}
