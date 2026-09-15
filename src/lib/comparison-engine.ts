import { potentialScore, recommendation, scoreFromHtml, SCORING_VERSION } from "@/lib/comparison";
import { createReportId } from "@/lib/comparison-store";
import type { CapabilityRow, CategoryScores, ComparisonReport, PathChoice } from "@/lib/report-pdf/report-types";

const KPI: Record<string, string[]> = {
  contractors: ["estimate", "roof", "siding", "storm"],
  landscaping: ["lawn", "hardscape", "seasonal", "estimate"],
  hospitality: ["hours", "menu", "reserv", "order"],
  "service-companies": ["book", "service", "estimate"],
  "stores-ecommerce": ["cart", "checkout", "product"],
  "professional-services": ["consult", "intake", "appointment"],
  other: ["contact", "service", "about"],
};

export type AnalyzeInput = {
  companyName: string; website: string; industry: string; market: string;
  contactName: string; contactEmail: string; competitors: string[]; confirmedTools: string; access: string;
};

function normalizeUrl(raw: string) {
  const value = raw.trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
async function fetchHtml(url: string) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "user-agent": "DemoreComparisonBot/1.0" }, signal: AbortSignal.timeout(8000) });
    const html = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { if (["server", "x-powered-by"].includes(k)) headers[k] = v; });
    return { html: html.slice(0, 700000), ok: res.ok, headers };
  } catch {
    return { html: "", ok: false, headers: {} as Record<string, string> };
  }
}
function emptyCats(): CategoryScores {
  return { seo: 0, geo: 0, conversion: 0, technical: 0, aeo: 0, ux: 0, trust: 0, leadgen: 0 };
}
function detectPlatform(html: string, headers: Record<string, string>) {
  const blob = `${html} ${headers.server || ""}`.toLowerCase();
  if (blob.includes("wp-content")) return "WordPress — publicly detected";
  if (blob.includes("shopify")) return "Shopify — publicly detected";
  if (blob.includes("wix")) return "Wix — publicly detected";
  if (blob.includes("squarespace")) return "Squarespace — publicly detected";
  if (headers.server) return `Server ${headers.server} — publicly detected`;
  return "Unknown — not publicly verifiable";
}
function capabilities(html: string): CapabilityRow[] {
  const t = html.toLowerCase();
  const has = (re: RegExp) => re.test(t);
  const row = (name: string, present: boolean, current: string, platform: string, unknown = false): CapabilityRow => ({
    name, current: unknown ? "Unknown" : current, platform, status: unknown ? "Not publicly verifiable" : present ? "Present" : "Missing",
  });
  return [
    row("Website", true, "Public site exists", "Custom architecture"),
    row("Mobile performance", has(/viewport/), has(/viewport/) ? "Viewport present" : "No viewport seen", "Mobile-first UX"),
    row("SEO", has(/<title/) && has(/description/), "Metadata sampled", "Service pages and internals"),
    row("GEO", has(/address|service area|we serve/), "Location language sampled", "Honest market + citation readiness"),
    row("AEO", has(/faq|frequently asked/), has(/faq/) ? "FAQ found" : "No FAQ seen", "Question headings and answers"),
    row("CRO", has(/<form/), has(/<form/) ? "Form found" : "No form seen", "One primary action"),
    row("Accessibility", has(/aria-|alt=/), "Some labels detected", "Labeled controls"),
    row("AI chatbot", has(/intercom|drift|tidio|chatbot/), has(/chatbot|intercom|drift|tidio/) ? "Widget found" : "No widget seen", "Qualification assistant"),
    row("Lead qualification", false, "Unknown", "Rules and handoff", true),
    row("CRM", false, "Unknown", "Routing", true),
    row("Automated follow-up", false, "Unknown", "Approved first response", true),
    row("Email and text workflows", false, "Unknown", "Nurture with approval", true),
    row("Scheduling or ordering", has(/calendly|book|reserv|checkout|cart/), has(/calendly|book|reserv|checkout|cart/) ? "Booking/cart language" : "None seen", "Industry booking or checkout"),
    row("Analytics", has(/gtag|gtm.js|analytics/), has(/gtag|gtm.js|analytics/) ? "Snippet found" : "None seen", "Form and call attribution"),
    row("Reporting", false, "Unknown", "Dashboards", true),
    row("Reputation management", has(/review|testimonial/), has(/review/) ? "Review language" : "None seen", "Real proof only"),
    row("Industry integrations", false, "Unknown", "Reuse current tools", true),
  ];
}
export async function buildComparisonReport(input: AnalyzeInput): Promise<ComparisonReport> {
  const website = normalizeUrl(input.website);
  const kpis = KPI[input.industry] || KPI.other;
  const primary = await fetchHtml(website);
  const scored = primary.html ? scoreFromHtml(primary.html, kpis) : { categories: emptyCats(), total: 28 };
  const currentTotal = primary.ok ? scored.total : Math.max(22, scored.total);
  const path = recommendation(currentTotal, input.access) as PathChoice;
  const potential = potentialScore(currentTotal);
  const competitorRows = [];
  for (const raw of input.competitors.slice(0, 3)) {
    const url = normalizeUrl(raw);
    if (!url) continue;
    const fetched = await fetchHtml(url);
    const result = fetched.html ? scoreFromHtml(fetched.html, kpis) : { categories: emptyCats(), total: 55 };
    competitorRows.push({
      name: new URL(url).hostname.replace(/^www\./, ""),
      website: url,
      total: fetched.ok ? result.total : 50,
      categories: result.categories,
      evidence: fetched.ok ? ("Publicly detected" as const) : ("Estimated" as const),
      note: fetched.ok ? "Scored from public HTML." : "Fetch failed. Labeled estimated.",
    });
  }
  if (!competitorRows.length) {
    competitorRows.push(
      { name: "Industry benchmark A", website: "estimated", total: Math.min(88, currentTotal + 14), categories: emptyCats(), evidence: "Estimated", note: "No competitor URL supplied." },
      { name: "Industry benchmark B", website: "estimated", total: Math.min(80, currentTotal + 8), categories: emptyCats(), evidence: "Estimated", note: "No competitor URL supplied." },
    );
  }
  const competitorAverage = Math.round(competitorRows.reduce((s, r) => s + r.total, 0) / competitorRows.length);
  const marketLeader = Math.max(...competitorRows.map((r) => r.total), currentTotal + 6);
  const confidence = primary.ok ? 62 : 42;
  const today = new Date().toISOString().slice(0, 10);
  const platform = detectPlatform(primary.html, primary.headers);
  return {
    reportNumber: createReportId(), reportDate: today, measurementDate: today, scoringVersion: SCORING_VERSION,
    companyName: input.companyName, website, industry: input.industry, market: input.market,
    contactName: input.contactName, contactEmail: input.contactEmail,
    currentTotal, competitorAverage, marketLeader, potential, confidence, path,
    summary: {
      current: primary.ok ? `The public site at ${website} is reachable. This is a public-page score, not a ranking.` : `The public site at ${website} could not be fully fetched. Confidence is lower.`,
      competitors: competitorRows.some((r) => r.evidence === "Estimated") ? "At least one competitor score is an industry benchmark." : "Competitor scores come from fetched HTML.",
      strongest: "Strongest public signals are listed in the category bars.",
      opportunities: "Largest gaps are usually answers, intake, and follow-up.",
      holdingBack: path === "Rebuild" ? "The current stack looks hard to extend." : "The site publishes, but follow-up still looks disconnected.",
      demoreCan: "Connect pages, qualification, routing, approved automation, and measurement.",
      nextStep: `Recommended path: ${path}. Start a project and keep this report number.`,
    },
    categories: scored.categories,
    competitors: competitorRows,
    competitorSelection: competitorRows[0]?.website === "estimated" ? "Competitors were not supplied. Benchmarks are labeled estimated." : "Competitors are the supplied URLs.",
    capabilities: capabilities(primary.html),
    tech: {
      platform,
      hosting: primary.headers.server ? `${primary.headers.server} — publicly detected` : "Unknown — not publicly verifiable",
      domainDns: "Public hostname only.",
      analytics: /gtag|gtm\.js|analytics/i.test(primary.html) ? "Analytics snippet publicly detected" : "Unknown — not publicly verifiable",
      crm: input.confirmedTools || "Unknown — not publicly verifiable",
      scheduling: /calendly|book|reserv|checkout/i.test(primary.html) ? "Booking or commerce language detected" : "Unknown — not publicly verifiable",
      marketing: "Public pixels only.",
      confirmed: input.confirmedTools ? input.confirmedTools.split(",").map((x) => x.trim()).filter(Boolean) : [],
      unknown: ["Private CRM", "Email/SMS vendors", "Call tracking"],
      accessStatus: input.access || "Not specified",
      transferability: "Depends on domain and hosting ownership. Not verified.",
      restrictions: "Platform lock-in cannot be confirmed without owner access.",
      accessNeeded: "Domain DNS, CMS or hosting admin, analytics. No passwords stored.",
    },
    outlook: {
      current: "Public website plus whatever private tools the owner already runs.",
      websiteOnly: "A website-only pass tightens pages, answers, and the form.",
      platform: "A connected platform also qualifies, routes, and measures. Results are not guaranteed.",
      maturity: [{ label: "Now", value: currentTotal }, { label: "30d", value: Math.min(potential, currentTotal + 6) }, { label: "60d", value: Math.min(potential, currentTotal + 11) }, { label: "90d", value: potential }],
      roadmap: [{ window: "30 days", focus: "Conversion path, titles, answers, measurement." }, { window: "60 days", focus: "Routing and first approved follow-up." }, { window: "90 days", focus: "Destination content and approved cadence." }],
      priorities: [{ label: "Primary form", impact: 86, effort: 35 }, { label: "Answer blocks", impact: 74, effort: 40 }, { label: "Follow-up", impact: 88, effort: 55 }],
    },
    recommendations: [
      { stage: "Immediate", finding: "Public conversion path may be thin.", evidence: "HTML form/CTA scan", impact: "Arrived visitors may not leave usable facts.", action: "Put one primary action on every money page.", priority: "High", implementation: "Foundation" },
      { stage: "First 30 days", finding: "Answer blocks vary.", evidence: "FAQ/heading scan", impact: "Less clean text to lift.", action: "Add a 130–170 word answer under the H1.", priority: "High", implementation: "Foundation" },
      { stage: "Days 31–60", finding: "Follow-up is not visible.", evidence: "Not publicly verifiable", impact: "Leads can sit in an inbox.", action: "Route inquiries and send an approved first response.", priority: "High", implementation: "Lead system" },
      { stage: "Days 61–90", finding: "Content may not land on a converting URL.", evidence: "Public inventory incomplete", impact: "Posts leak attention.", action: "Point posts at service or product pages.", priority: "Medium", implementation: "Growth loop" },
      { stage: "Long-term", finding: "No public improvement cadence.", evidence: "No change log", impact: "The site ages after launch.", action: "Run approved site-improvement bots.", priority: "Later", implementation: "Growth loop" },
    ],
    methodology: {
      measured: ["Public HTML fetch", "Titles", "Forms", "Viewport", "FAQ/schema signatures"],
      detected: [platform],
      supplied: [input.companyName, input.industry, input.market],
      sources: ["Customer URLs", "Public HTTP response"],
      benchmarks: ["dts-compare-v1"],
      assumptions: ["Homepage represents the current site"],
      unknowns: ["Private CRM", "Ad spend", "Actual conversion rate"],
      confidenceNote: `Assessment confidence is ${confidence}%.`,
    },
  };
}
