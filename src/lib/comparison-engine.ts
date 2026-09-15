import { potentialScore, recommendation, scoreFromHtml, SCORING_VERSION } from "@/lib/comparison";
import { createReportId } from "@/lib/comparison-store";
import type { AccessComparison, CapabilityRow, CategoryScores, ComparisonReport, PathChoice } from "@/lib/report-pdf/report-types";

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
  contactName: string; contactEmail: string; contactPhone: string; timeframe: string; competitors: string[]; confirmedTools: string; access: string;
  domainRegistrar: string; websiteHost: string; siteBuilder: string; codeAccess: string;
};

function clamp(value: number) {
  return Math.max(20, Math.min(90, Math.round(value)));
}

function displayAccess(value: string, labels: Record<string, string>) {
  return value ? labels[value] || value : "Not provided";
}

function buildAccessComparison(input: AnalyzeInput, currentTotal: number, detectedPlatform: string): AccessComparison {
  const accountLabels: Record<string, string> = {
    "owner-controls": "Owner controls domain and website accounts",
    "shared-controls": "Access is shared with a provider",
    "provider-controls": "A provider controls the website",
    "needs-recovery": "Access is unclear or needs recovery",
  };
  const codeLabels: Record<string, string> = {
    "full-source": "Full source/repository access",
    "cms-admin": "CMS or site-builder access only",
    "vendor-managed": "Vendor-managed; source access unknown",
    "no-source": "No source-code access",
    unknown: "Not sure",
  };
  const accessBoost = input.access === "owner-controls" ? 15 : input.access === "shared-controls" ? 7 : input.access === "provider-controls" ? -10 : input.access === "needs-recovery" ? -18 : 0;
  const sourceBoost = input.codeAccess === "full-source" ? 15 : input.codeAccess === "cms-admin" ? 7 : input.codeAccess === "vendor-managed" ? -8 : input.codeAccess === "no-source" ? -20 : 0;
  const enhanceFit = clamp(42 + (currentTotal - 50) * 0.45 + accessBoost + sourceBoost);
  const rebuildFit = clamp(52 + (55 - currentTotal) * 0.45 - accessBoost * 0.35 - sourceBoost * 0.55);
  const difference = rebuildFit - enhanceFit;
  const recommendedPath: PathChoice = difference >= 12 ? "Rebuild" : difference <= -12 ? "Optimize" : "Hybrid";
  const supplied = [input.domainRegistrar, input.websiteHost, input.siteBuilder, input.codeAccess, input.access].filter(Boolean).length;
  const confidence = supplied >= 4 ? "High" : supplied >= 2 ? "Medium" : "Limited";
  const explanation = supplied
    ? `${recommendedPath} is the current fit based on the public-site score and ${supplied} optional ownership/access details. Confirm account ownership before implementation.`
    : `${recommendedPath} is a preliminary fit based on public pages only. Ownership and access details were not provided, so both paths remain subject to verification.`;
  const accessSummary = displayAccess(input.access, accountLabels);
  const codeSummary = displayAccess(input.codeAccess, codeLabels);
  return {
    registrar: input.domainRegistrar || "Not provided",
    hostingProvider: input.websiteHost || detectedPlatform,
    siteCreator: input.siteBuilder || "Not provided",
    codeAccess: codeSummary,
    enhanceFit,
    rebuildFit,
    recommendedPath,
    confidence,
    explanation,
    rows: [
      { factor: "Ownership & access", enhanceCurrent: accessSummary, rebuild: "New owner-controlled accounts and documented handoff", advantage: "Reduces lock-in and makes future changes easier" },
      { factor: "Existing code & content", enhanceCurrent: codeSummary === "Full source/repository access" ? "Reuse and improve verified source" : "Reuse depends on provider access", rebuild: "Migrate useful content into a documented codebase", advantage: "Preserves useful assets without preserving every limitation" },
      { factor: "Speed to first improvement", enhanceCurrent: "Usually faster when admin/source access is available", rebuild: "More setup before launch", advantage: "Choose quick wins when the current foundation is dependable" },
      { factor: "Bots & integrations", enhanceCurrent: "Add through supported APIs, embeds or server-side hooks", rebuild: "Design lead, support and reporting bots into the architecture", advantage: "Creates cleaner handoffs, measurement and automation" },
      { factor: "Long-term flexibility", enhanceCurrent: "Limited by the existing host, builder and code quality", rebuild: "Modern stack selected around ownership and integrations", advantage: "Lowers the cost of future capabilities" },
      { factor: "SEO continuity", enhanceCurrent: "Existing URLs can remain in place", rebuild: "Requires URL mapping, redirects and launch monitoring", advantage: "Protects existing visibility during either path" },
    ],
    botOpportunities: [
      { name: "Comparison assistant", currentSite: "Embed when the host supports scripts or APIs", rebuild: "Share the report and lead ID across the complete flow", businessValue: "Explains scores and captures better-qualified follow-up questions" },
      { name: "Lead qualification bot", currentSite: "Connect to the existing form or CRM where access allows", rebuild: "Built into routing, consent and analytics", businessValue: "Collects service, urgency and location before staff follow-up" },
      { name: "Customer support bot", currentSite: "Answer from approved site content", rebuild: "Use a maintained knowledge source with escalation", businessValue: "Provides faster answers while handing sensitive requests to people" },
      { name: "Site improvement bot", currentSite: "Audit pages and propose changes for approval", rebuild: "Monitor performance and maintain an approved backlog", businessValue: "Turns one-time launch work into an ongoing improvement process" },
    ],
  };
}

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
  const { getScoringSettings } = await import("@/lib/comparison-store");
  const { discoverCompetitors } = await import("@/lib/dataforseo.server");
  const { estimateOrganicTraffic, measurePerformance } = await import("@/lib/performance-signals.server");
  const [primary, scoring, discovery, performance] = await Promise.all([
    fetchHtml(website),
    getScoringSettings(),
    discoverCompetitors({ industry: input.industry, market: input.market, website }),
    measurePerformance(website),
  ]);
  const scored = primary.html ? scoreFromHtml(primary.html, kpis, scoring.weights) : { categories: emptyCats(), total: 28 };
  const currentTotal = primary.ok ? scored.total : Math.max(22, scored.total);
  const preliminaryPath = recommendation(currentTotal, input.access) as PathChoice;
  const potential = potentialScore(currentTotal);
  const competitorRows = [];
  const candidates = discovery.live
    ? discovery.competitors
    : input.competitors.slice(0, 3).map((raw) => ({ website: raw, name: "", source: "Customer supplied" as const }));
  const traffic = await estimateOrganicTraffic([website, ...candidates.map((candidate) => normalizeUrl(candidate.website))], input.market);
  const trafficFor = (url: string) => {
    try { return traffic.get(new URL(url).hostname.replace(/^www\./, "")); } catch { return undefined; }
  };
  for (const candidate of candidates) {
    const raw = candidate.website;
    const url = normalizeUrl(raw);
    if (!url) continue;
    const fetched = await fetchHtml(url);
    const result = fetched.html ? scoreFromHtml(fetched.html, kpis, scoring.weights) : { categories: emptyCats(), total: 55 };
    competitorRows.push({
      name: candidate.name || new URL(url).hostname.replace(/^www\./, ""),
      website: url,
      total: fetched.ok ? result.total : 50,
      categories: result.categories,
      evidence: fetched.ok
        ? discovery.live ? ("Third-party sourced" as const) : ("Customer provided" as const)
        : ("Estimated" as const),
      note: fetched.ok ? `Website scored from public HTML. ${discovery.note}` : `Website fetch failed; score is estimated. ${discovery.note}`,
      source: candidate.source,
      mapsRank: "mapsRank" in candidate ? candidate.mapsRank : undefined,
      organicRank: "organicRank" in candidate ? candidate.organicRank : undefined,
      rating: "rating" in candidate ? candidate.rating : undefined,
      reviewCount: "reviewCount" in candidate ? candidate.reviewCount : undefined,
      placeId: "placeId" in candidate ? candidate.placeId : undefined,
      discoveredAt: "discoveredAt" in candidate ? candidate.discoveredAt : undefined,
      query: "query" in candidate ? candidate.query : undefined,
      estimatedMonthlyOrganicTraffic: trafficFor(url),
    });
  }
  if (!competitorRows.length) {
    competitorRows.push(
      { name: "Leading-industry capability benchmark", website: "benchmark", total: Math.min(88, currentTotal + 14), categories: emptyCats(), evidence: "Estimated" as const, source: "Industry benchmark" as const, note: `${discovery.note} This is not presented as a real business.` },
      { name: "Typical-industry capability benchmark", website: "benchmark", total: Math.min(80, currentTotal + 8), categories: emptyCats(), evidence: "Estimated" as const, source: "Industry benchmark" as const, note: `${discovery.note} This is not presented as a real business.` },
    );
  }
  const competitorAverage = Math.round(competitorRows.reduce((s, r) => s + r.total, 0) / competitorRows.length);
  const marketLeader = Math.max(...competitorRows.map((r) => r.total), currentTotal + 6);
  const confidence = primary.ok ? 62 : 42;
  const today = new Date().toISOString().slice(0, 10);
  const platform = detectPlatform(primary.html, primary.headers);
  const currentTraffic = trafficFor(website);
  performance.trafficEstimate = currentTraffic === undefined
    ? { status: "unavailable", source: "DataForSEO Labs", market: input.market, note: "No licensed traffic estimate was returned. No value was inferred." }
    : { status: "available", source: "DataForSEO Labs bulk traffic estimation", monthlyOrganic: currentTraffic, market: input.market, note: "Estimated monthly organic traffic, not first-party analytics." };
  const accessComparison = buildAccessComparison(input, currentTotal, platform);
  const path = accessComparison.recommendedPath || preliminaryPath;
  return {
    reportNumber: createReportId(), reportDate: today, measurementDate: today, scoringVersion: `${SCORING_VERSION}-weights-${scoring.version}`,
    companyName: input.companyName, website, industry: input.industry, market: input.market,
    contactName: input.contactName, contactEmail: input.contactEmail, contactPhone: input.contactPhone, timeframe: input.timeframe,
    currentTotal, competitorAverage, marketLeader, potential, confidence, path,
    summary: {
      current: primary.ok ? `The public site at ${website} is reachable. This is a public-page score, not a ranking.` : `The public site at ${website} could not be fully fetched. Confidence is lower.`,
      competitors: discovery.live
        ? "Competitors were found in live Google Maps and organic results, then their public websites were compared."
        : competitorRows[0]?.source === "Industry benchmark"
          ? "Live competitors were unavailable, so the comparison uses clearly labeled, non-business benchmarks."
          : "Live discovery was unavailable; customer-supplied sites were compared.",
      strongest: "Strongest public signals are listed in the category bars.",
      opportunities: "Largest gaps are usually answers, intake, and follow-up.",
      holdingBack: path === "Rebuild" ? "The current stack looks hard to extend." : "The site publishes, but follow-up still looks disconnected.",
      demoreCan: "Connect pages, qualification, routing, approved automation, and measurement.",
      nextStep: `Recommended path: ${path}. Start a project and keep this report number.`,
    },
    categories: scored.categories,
    scoringWeights: scoring.weights,
    competitors: competitorRows,
    competitorSelection: discovery.live
      ? `Competitors were selected from live Google Maps and organic results for ${input.market}. Rankings are a point-in-time observation.`
      : competitorRows[0]?.source === "Industry benchmark"
        ? "No verified competitor websites were available. Generic benchmarks are labeled estimated and are not real businesses."
        : "Live discovery was unavailable, so customer-supplied competitor URLs were used.",
    capabilities: capabilities(primary.html),
    tech: {
      platform,
      hosting: input.websiteHost || (primary.headers.server ? `${primary.headers.server} — publicly detected` : "Unknown — not publicly verifiable"),
      domainDns: input.domainRegistrar ? `${input.domainRegistrar} — customer provided registrar` : "Public hostname only; registrar not provided.",
      analytics: /gtag|gtm\.js|analytics/i.test(primary.html) ? "Analytics snippet publicly detected" : "Unknown — not publicly verifiable",
      crm: input.confirmedTools || "Unknown — not publicly verifiable",
      scheduling: /calendly|book|reserv|checkout/i.test(primary.html) ? "Booking or commerce language detected" : "Unknown — not publicly verifiable",
      marketing: "Public pixels only.",
      confirmed: input.confirmedTools ? input.confirmedTools.split(",").map((x) => x.trim()).filter(Boolean) : [],
      unknown: ["Private CRM", "Email/SMS vendors", "Call tracking"],
      accessStatus: accessComparison.rows[0]?.enhanceCurrent || "Not specified",
      transferability: input.codeAccess === "full-source" ? "Source is reported available; ownership and license still require confirmation." : "Transferability depends on account control, licenses and source availability.",
      restrictions: input.codeAccess === "no-source" ? "Existing code cannot be assumed reusable without source access." : "Platform lock-in and code quality require access verification.",
      accessNeeded: "Domain DNS, CMS or hosting admin, analytics. No passwords stored.",
    },
    accessComparison,
    performance,
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
      measured: ["Public HTML fetch", "Titles", "Forms", "Viewport", "FAQ/schema signatures", performance.pageSpeed.status === "available" ? "Google PageSpeed Insights mobile lab" : "PageSpeed requested but unavailable", performance.coreWebVitals.status === "available" ? "Chrome UX Report field data" : "CrUX field data unavailable"],
      detected: [platform],
      supplied: [input.companyName, input.industry, input.market],
      sources: discovery.live ? ["DataForSEO live Google Maps SERP", "DataForSEO live Google organic SERP", "DataForSEO Labs traffic estimates when returned", "Google PageSpeed Insights / CrUX when returned", "Public HTTP responses"] : ["Customer URLs", "Google PageSpeed Insights / CrUX when returned", "Public HTTP responses"],
      benchmarks: [`dts-compare-v1 weights version ${scoring.version}`],
      assumptions: ["Homepage represents the current site"],
      unknowns: ["Private CRM", "Ad spend", "Actual conversion rate", "Search Console metrics until the verified owner connects OAuth"],
      confidenceNote: `Assessment confidence is ${confidence}%.`,
    },
  };
}
