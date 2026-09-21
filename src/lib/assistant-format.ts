import {consoleOverview,offeringReadiness,leadGenerationOffering,specialistKnowledge} from "./console-offering.ts";
export const ASSISTANT_MODEL = "grok-4.6";
export const ASSISTANT_MODELS = ["grok-4.6", "grok-4.5", "grok-4"] as const;
export const XAI_RESPONSES_URL = "https://api.x.ai/v1/responses";
export const XAI_CHAT_URL = "https://api.x.ai/v1/chat/completions";

const SEARCH_HINT =
  /\b(competitor|competitors|ranking|rankings|maps|local pack|near me|in mentor|current (public )?website|who else|hosting|cms|wordpress|shopify|wix|squarespace|toast|platform|software|market fact|review count|rating|today|latest|recent)\b/i;

export function shouldUseWebSearch(message: string) {
  return SEARCH_HINT.test(message);
}

export function conversationInput(
  message: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = [],
) {
  const trimmed = message.trim().slice(0, 4000);
  const rows = history.slice(-8).map((item) => ({
    role: item.role,
    content: item.content.slice(0, 4000),
  })).filter((item) => item.content);
  if (rows.at(-1)?.role === "user" && rows.at(-1)?.content === trimmed) rows.pop();
  return [...rows, { role: "user" as const, content: trimmed }];
}

export function systemPrompt(reportSummary: string, reportId: string | null, reviewBrief = "") {
  return [
    "You are the Demore Technology Solutions website assistant.",
    "Published Demore site copy (authoritative for our own services): Demore Technology Solutions is based in Mentor, Lake County, Ohio, serving businesses nationwide remotely. Contact ryan@demoretechnologysolutions.com or https://www.demoretechnologysolutions.com/contact.",
    "Control center offering: " + consoleOverview,
    "Current readiness: " + offeringReadiness,
    "Automated lead generation: " + leadGenerationOffering,
    "Specialist catalog (capabilities, not a promise of connected execution):\n" + specialistKnowledge,
    "Tailor recommendations to the visitor's industry, existing website findings and desired customer journey. Preserve working features; propose additions only where useful. Do not expose internal budgets, credentials, customer records or operational test results. Explain the public overview at https://www.demoretechnologysolutions.com/control-center and lead-generation offering at https://www.demoretechnologysolutions.com/lead-generation. Customer PDFs must not name or link the internal reference business; use Demore Technology Solutions branding.",
    "Homepage introduction: Websites. Bots. Growth. Custom AI platforms. Services are available individually or as a connected system.",
    "Website design and ecommerce: custom new websites, redesigns, mobile layouts, navigation, service pages, product catalogs, menus, campaign landing pages, contact forms, booking paths, checkout and conversion tracking. Source: https://www.demoretechnologysolutions.com/websites.",
    "Bots and business automation: website Q&A assistants, internal knowledge bots, lead routing, CRM handoffs, alerts, follow-up tasks, social scheduling, AI-generated content drafts and human approval workflows. Source: https://www.demoretechnologysolutions.com/automation.",
    "Growth services: SEO, local search, visibility in AI-generated answers (GEO/AEO), campaign content, social presence, landing pages, conversion optimization (CRO), analytics and lead-generation workflows. Source: https://www.demoretechnologysolutions.com/growth.",
    "Custom AI platforms: AI-assisted development of dashboards, customer portals, business workspaces, content tools, connected marketing systems, forms, data integrations and workflows. Scope is tailored to the business. Source: https://www.demoretechnologysolutions.com/platform.",
    "Answer general service questions directly using published site copy. A website review or Report ID is only needed for questions about that visitor's particular report or website findings. Do not require a review before describing services. Never invent pricing or package details.",
    "Published offering: /lead-generation describes the Demore Technology Solutions private workspace for customers, campaigns, lead review, conversations, qualified handoffs, costs and billing. Sign in at https://demore-lead-engine.vercel.app/login. Provider services and messaging require setup; do not claim contacts or sending are automatically enabled.",
    "Dedicated industry pages: /industries/restaurants (menus, reservations, catering), /industries/pubs (events and private bookings), /industries/pizza-shops (ordering, delivery coverage, group orders).",
    "Prefer Demore website knowledge, any saved website review, and any saved comparison report before searching.",
    "Format every reply with short paragraphs and markdown-style bullet lists. Use **bold** for record IDs and section names. Do not return one unbroken blob.",
    "Never invent competitors, rankings, ratings, reviews, website technology, or business facts.",
    "Do not name third-party AI model vendors unless the visitor names them first.",
    "DataForSEO (Google organic and Maps) is authoritative for rankings, local-pack positions, ratings, review counts, and initial competitor discovery.",
    "Web Search is supplemental for current public pages, industry context, software facts, and information not in the saved report.",
    "If live information is unavailable, say so and use a clearly labeled industry benchmark. Do not invent named businesses.",
    "Label facts as: Publicly detected, DataForSEO sourced, Customer provided, Estimated, or Unknown/not publicly verifiable.",
    "Show clickable source URLs and the date searched for Web Search facts.",
    "Use Web Search at most twice for one customer message unless accuracy requires one more check.",
    "Never request or store passwords, API keys, or the private report authorization token.",
    "Never guarantee rankings, traffic, leads, sales, or revenue. Always state that rankings, AI citations, and conversion lifts are not guaranteed.",
    reportId
      ? `Demore Report ID (canonical, also customerId/leadId/comparisonId): ${reportId}. Refer to it as the Demore Report ID. Keep using this exact ID.`
      : "No Demore Report ID is available. Only ask for one when the visitor wants help with a specific comparison report. Otherwise answer the question directly. For a new review, offer https://www.demoretechnologysolutions.com/compare. Do not invent an ID.",
    reportSummary ? `Saved comparison report (do not expose the auth token):\n${reportSummary}` : "No saved comparison report is attached.",
    reviewBrief ? `Saved website review (public HTML scan only; do not invent Analytics or Search Console numbers):\n${reviewBrief}` : "No website review brief is attached.",
  ].join("\n");
}

export function summarizeReport(report: Record<string, unknown>) {
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

export function parseAssistantOutput(data: {
  output_text?: string;
  choices?: Array<{ message?: { content?: string } }>;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
    action?: { sources?: Array<{ url?: string; title?: string }> };
  }>;
}) {
  const textFromOutput = (data.output || [])
    .flatMap((item) => item.content || [])
    .map((part) => part.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
  const chat = data.choices?.[0]?.message?.content?.trim() || "";
  const text = (data.output_text || textFromOutput || chat || "").trim();
  const citations = (data.output || [])
    .flatMap((item) => item.action?.sources || [])
    .filter((src) => src.url)
    .map((src) => ({ url: src.url as string, title: src.title }))
    .slice(0, 8);
  const searchCalls = (data.output || []).filter((item) => item.type === "web_search_call").length;
  return { text, citations, searchCalls };
}

export function savedReviewFallback(reviewBrief: string, reportSummary = "") {
  const source = reviewBrief.trim() || reportSummary.trim();
  if (!source) return "";
  return [
    "I still have the saved website review. A live model reply is temporarily unavailable, so this is from the scan already on file — not a new web search.",
    "",
    source,
    "",
    "Ask which **Not detected** item to fix first, or use **Discuss these improvements**.",
    "Rankings, AI citations, and conversion lifts are not guaranteed.",
  ].join("\n");
}

export function publishedSiteFallback() {
  return [
    "A live model reply is temporarily unavailable. This is the published Demore Technology Solutions position, labeled **Customer provided / site copy**, not a ranking or competitor scan.",
    "",
    "- **Demore Technology Solutions** builds custom websites, stores, and AI-assisted growth systems.",
    "- Based in **Mentor, Lake County, Ohio**. Nationwide, remote.",
    "- Review a public website at https://www.demoretechnologysolutions.com/compare#website-review",
    "- File a project at https://www.demoretechnologysolutions.com/contact",
    "- Email ryan@demoretechnologysolutions.com",
    "",
    "Run the website review first if you want Ask Demore to use your page's public HTML findings.",
    "Rankings, AI citations, and conversion lifts are not guaranteed.",
  ].join("\n");
}

export function responsesBody(input: {
  model: string;
  instructions: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  search: boolean;
}) {
  const body: Record<string, unknown> = {
    model: input.model,
    instructions: input.instructions,
    input: input.messages,
    store: false,
    max_output_tokens: 2400,
    reasoning: { effort: "low" },
  };
  if (input.search) {
    body.tools = [{ type: "web_search" }];
    body.include = ["web_search_call.action.sources"];
  }
  return body;
}

export function chatBody(input: {
  model: string;
  instructions: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  return {
    model: input.model,
    messages: [{ role: "system" as const, content: input.instructions }, ...input.messages],
    max_tokens: 2400,
    reasoning_effort: "low",
  };
}
