import { getAuthorizedComparison } from "@/lib/comparison-store";
import { unifiedIds } from "@/lib/unified-ids";

export const ASSISTANT_MODEL = "grok-4.6";
export const XAI_RESPONSES_URL = "https://api.x.ai/v1/responses";

const SEARCH_HINT =
  /\b(competitor|competitors|ranking|rankings|maps|local pack|near me|in mentor|current (public )?website|who else|hosting|cms|wordpress|shopify|wix|squarespace|toast|platform|software|market fact|review count|rating|today|latest|recent)\b/i;

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

export function shouldUseWebSearch(message: string) {
  return SEARCH_HINT.test(message);
}

export function recentSearchUsage() {
  return searchLog.slice(-50);
}

function systemPrompt(reportSummary: string, reportId: string | null) {
  const ids = reportId ? unifiedIds(reportId) : null;
  return [
    "You are the Demore Technology Solutions website assistant.",
    "Prefer Demore website knowledge and any saved comparison report before searching.",
    "Never invent competitors, rankings, ratings, reviews, website technology, or business facts.",
    "DataForSEO (Google organic and Maps) is authoritative for rankings, local-pack positions, ratings, review counts, and initial competitor discovery.",
    "Web Search is supplemental for current public pages, industry context, software facts, and information not in the saved report.",
    "If live information is unavailable, say so and use a clearly labeled industry benchmark. Do not invent named businesses.",
    "Label facts as: Publicly detected, DataForSEO sourced, Customer provided, Estimated, or Unknown/not publicly verifiable.",
    "Show clickable source URLs and the date searched for Web Search facts.",
    "Use Web Search at most twice for one customer message unless accuracy requires one more check.",
    "Never request or store passwords, API keys, or the private report authorization token.",
    "Never guarantee rankings, traffic, leads, sales, or revenue.",
    ids
      ? `Demore Report ID (canonical, also customerId/leadId/comparisonId): ${ids.reportId}. Refer to it as the Demore Report ID. Keep using this exact ID.`
      : "No Demore Report ID is available. Ask if the visitor has one. If not, send them to https://www.demoretechnologysolutions.com/compare and capture the exact reportId after submission. Do not invent an ID.",
    reportSummary ? `Saved comparison report (do not expose the auth token):\n${reportSummary}` : "No saved comparison report is attached.",
  ].join("\n");
}

function summarizeReport(report: Record<string, unknown>) {
  const competitors = Array.isArray(report.competitors) ? report.competitors : [];
  const rows = competitors.slice(0, 6).map((row) => {
    const r = row as Record<string, unknown>;
    return `- ${r.name} | ${r.website} | source=${r.source || r.evidence} | maps=${r.mapsRank ?? "n/a"} | organic=${r.organicRank ?? "n/a"}`;
  });
  return [
    `Company: ${report.companyName}`,
    `Website: ${report.website}`,
    `Industry: ${report.industry}`,
    `Market: ${report.market}`,
    `Score: ${report.currentTotal} path=${report.path}`,
    `Competitor selection: ${report.competitorSelection || ""}`,
    rows.join("\n"),
  ].join("\n");
}

export async function runAssistant(input: {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  reportId?: string;
  token?: string;
}) {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false as const,
      error: "The assistant is not configured on this environment (missing server XAI_API_KEY).",
      model: ASSISTANT_MODEL,
      webSearchEnabled: false,
      webSearchUsed: false,
      citations: [] as Array<{ url: string; title?: string }>,
      searchedAt: null as string | null,
    };
  }

  let reportSummary = "";
  let reportId = input.reportId?.trim() || "";
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
  } else if (!reportId) {
    reportSummary = "";
  }

  const allowSearch = shouldUseWebSearch(input.message);
  const tools = allowSearch ? [{ type: "web_search" }] : [];
  const history = (input.history || []).slice(-8).map((item) => ({
    role: item.role,
    content: item.content.slice(0, 4000),
  }));

  const body = {
    model: ASSISTANT_MODEL,
    input: [
      { role: "system", content: systemPrompt(reportSummary, reportId || null) },
      ...history,
      { role: "user", content: input.message.slice(0, 4000) },
    ],
    tools,
    include: allowSearch ? ["web_search_call.action.sources"] : [],
  };

  const searchedAt = new Date().toISOString().slice(0, 10);
  let response: Response;
  try {
    response = await fetch(XAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return {
      ok: false as const,
      error: "Live web information is temporarily unavailable. Using the saved comparison report or labeled benchmarks only.",
      model: ASSISTANT_MODEL,
      webSearchEnabled: allowSearch,
      webSearchUsed: false,
      citations: [],
      searchedAt,
      reportId: reportId || null,
      ids: reportId ? unifiedIds(reportId) : null,
    };
  }

  if (!response.ok) {
    searchLog.push({ at: new Date().toISOString(), reportId: reportId || null, searches: 0, ok: false });
    return {
      ok: false as const,
      error: "Live web information is temporarily unavailable. Continue from the saved comparison report or labeled benchmarks.",
      model: ASSISTANT_MODEL,
      webSearchEnabled: allowSearch,
      webSearchUsed: false,
      citations: [],
      searchedAt,
      reportId: reportId || null,
      ids: reportId ? unifiedIds(reportId) : null,
    };
  }

  const data = (await response.json()) as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
      action?: { sources?: Array<{ url?: string; title?: string }> };
    }>;
  };

  const textFromOutput = (data.output || [])
    .flatMap((item) => item.content || [])
    .map((part) => part.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
  const text = (data.output_text || textFromOutput || "").trim();
  const citations = (data.output || [])
    .flatMap((item) => item.action?.sources || [])
    .filter((src) => src.url)
    .map((src) => ({ url: src.url as string, title: src.title }))
    .slice(0, 8);
  const searchCalls = (data.output || []).filter((item) => item.type === "web_search_call").length;
  searchLog.push({
    at: new Date().toISOString(),
    reportId: reportId || null,
    searches: searchCalls,
    ok: true,
  });

  return {
    ok: true as const,
    text: text || "I could not form an answer from the available sources.",
    model: ASSISTANT_MODEL,
    endpoint: XAI_RESPONSES_URL,
    webSearchEnabled: allowSearch,
    webSearchUsed: searchCalls > 0,
    webSearchCalls: searchCalls,
    citations,
    searchedAt: citations.length || searchCalls ? searchedAt : null,
    reportId: reportId || null,
    ids: reportId ? unifiedIds(reportId) : null,
  };
}
