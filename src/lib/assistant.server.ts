import { getAuthorizedComparison } from "@/lib/comparison-store";
import {
  ASSISTANT_MODEL,
  ASSISTANT_MODELS,
  XAI_CHAT_URL,
  XAI_RESPONSES_URL,
  chatBody,
  conversationInput,
  parseAssistantOutput,
  responsesBody,
  savedReviewFallback,
  shouldUseWebSearch,
  summarizeReport,
  systemPrompt,
} from "@/lib/assistant-format";
import { unifiedIds } from "@/lib/unified-ids";

export { ASSISTANT_MODEL, XAI_RESPONSES_URL, shouldUseWebSearch };

const hits = new Map<string, number[]>();
const searchLog: Array<{ at: string; reportId: string | null; searches: number; ok: boolean }> = [];

export function assistantRateLimit(ip: string, limit = 20, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((time) => now - time < windowMs);
  if (list.length >= limit) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}

export function recentSearchUsage() {
  return searchLog.slice(-50);
}

async function postXai(url: string, apiKey: string, body: unknown) {
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });
}

function isAbort(error: unknown) {
  return error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
}

export async function runAssistant(input: {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  reportId?: string;
  token?: string;
  reviewBrief?: string;
}) {
  const apiKey = process.env.XAI_API_KEY?.trim();
  const searchedAt = new Date().toISOString().slice(0, 10);
  const allowSearch = shouldUseWebSearch(input.message);
  const empty = {
    webSearchEnabled: allowSearch,
    webSearchUsed: false,
    citations: [] as Array<{ url: string; title?: string }>,
    searchedAt,
  };

  if (!apiKey) {
    return {
      ok: false as const,
      error: "The assistant is not configured on this environment (missing server XAI_API_KEY).",
      model: ASSISTANT_MODEL,
      ...empty,
      reportId: null,
      ids: null,
    };
  }

  let reportSummary = "";
  let reportId = input.reportId?.trim() || "";
  const reviewBrief = (input.reviewBrief || "").trim().slice(0, 8000);
  if (reportId && input.token) {
    try {
      const stored = await getAuthorizedComparison(reportId, input.token);
      if (stored) {
        reportId = stored.id;
        reportSummary = summarizeReport(stored.report as unknown as Record<string, unknown>);
      }
    } catch {
      reportSummary = "Saved report could not be loaded. Continue without private report details.";
    }
  }

  const messages = conversationInput(input.message, input.history || []);
  const instructions = systemPrompt(reportSummary, reportId || null, reviewBrief);
  const ids = reportId ? unifiedIds(reportId) : null;

  const done = (
    text: string,
    model: string,
    endpoint: string,
    parsed: { citations: Array<{ url: string; title?: string }>; searchCalls: number },
  ) => {
    searchLog.push({
      at: new Date().toISOString(),
      reportId: reportId || null,
      searches: parsed.searchCalls,
      ok: true,
    });
    return {
      ok: true as const,
      text,
      model,
      endpoint,
      webSearchEnabled: allowSearch,
      webSearchUsed: parsed.searchCalls > 0,
      webSearchCalls: parsed.searchCalls,
      citations: parsed.citations,
      searchedAt: parsed.citations.length || parsed.searchCalls ? searchedAt : null,
      reportId: reportId || null,
      ids,
    };
  };

  async function readOk(response: Response, model: string, endpoint: string) {
    if (response.status === 401 || response.status === 403) return "auth" as const;
    if (response.status === 404) return "missing-model" as const;
    if (!response.ok) return "fail" as const;
    try {
      const data = (await response.json()) as Parameters<typeof parseAssistantOutput>[0];
      const parsed = parseAssistantOutput(data);
      if (!parsed.text) return "fail" as const;
      return done(parsed.text, model, endpoint, parsed);
    } catch {
      return "fail" as const;
    }
  }

  let stop = false;
  for (const model of ASSISTANT_MODELS) {
    if (stop) break;
    const shapes: Array<{ url: string; body: unknown }> = [];
    if (allowSearch) {
      shapes.push({
        url: XAI_RESPONSES_URL,
        body: responsesBody({ model, instructions, messages, search: true }),
      });
    }
    shapes.push({
      url: XAI_RESPONSES_URL,
      body: responsesBody({ model, instructions, messages, search: false }),
    });
    shapes.push({
      url: XAI_CHAT_URL,
      body: chatBody({ model, instructions, messages }),
    });

    for (const shape of shapes) {
      let response: Response;
      try {
        response = await postXai(shape.url, apiKey, shape.body);
      } catch (error) {
        if (isAbort(error)) {
          stop = true;
          break;
        }
        continue;
      }
      const result = await readOk(response, model, shape.url);
      if (result === "auth") {
        stop = true;
        break;
      }
      if (result === "missing-model") break;
      if (result !== "fail") return result;
    }
  }

  searchLog.push({ at: new Date().toISOString(), reportId: reportId || null, searches: 0, ok: false });
  const fallback = savedReviewFallback(reviewBrief, reportSummary);
  if (fallback) {
    return {
      ok: true as const,
      text: fallback,
      model: "saved-review",
      endpoint: "local",
      webSearchEnabled: allowSearch,
      webSearchUsed: false,
      webSearchCalls: 0,
      citations: [],
      searchedAt: null,
      reportId: reportId || null,
      ids,
    };
  }

  return {
    ok: false as const,
    error: "Live web information is temporarily unavailable. Continue from the saved comparison report or labeled benchmarks.",
    model: ASSISTANT_MODEL,
    ...empty,
    reportId: reportId || null,
    ids,
  };
}
