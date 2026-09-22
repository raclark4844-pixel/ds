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
    website?: string;
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
  const { billTenantAiIfPresent, TenantSpendCapError } = await import(
    "../../../src/lib/billing/process-billed-ai-request.server"
  );
  try {
    const result = await billTenantAiIfPresent(
      req,
      "assistant",
      () =>
        runAssistant({
          message,
          industries: raw.industries,
          website: typeof raw.website === "string" ? raw.website.slice(0, 2048) : "",
          history: Array.isArray(raw.history) ? raw.history : [],
          reportId: typeof raw.reportId === "string" ? raw.reportId : "",
          token: typeof raw.token === "string" ? raw.token : "",
          reviewBrief: typeof raw.reviewBrief === "string" ? raw.reviewBrief : "",
        }),
      (outcome) => ({
        rawCostMicrodollars: Math.max(1, Math.ceil(((outcome.text || "").length || 1) / 4)),
        provider: "xai",
        model: outcome.model,
      }),
    );
    return Response.json(result, { status: result.ok ? 200 : 503 });
  } catch (error) {
    if (error instanceof TenantSpendCapError) {
      return Response.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
