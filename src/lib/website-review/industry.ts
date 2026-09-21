export type IndustryProfile = {
  id: string;
  name: string;
  terms: string[];
  journey: string;
  conversion: string;
  measure: string;
};

const PROFILES: IndustryProfile[] = [
  {
    id: "contractors",
    name: "Construction and exterior services",
    terms: ["roofing", "siding", "contractor", "remodeling", "gutters"],
    journey: "service-specific estimate requests, project photos, service area and project timing",
    conversion: "request an estimate",
    measure: "qualified estimate requests and booked inspections",
  },
  {
    id: "landscaping",
    name: "Landscaping and outdoor services",
    terms: ["landscaping", "lawn care", "hardscaping", "irrigation", "tree service"],
    journey: "property type, service area, seasonal work and recurring maintenance inquiries",
    conversion: "request a property assessment",
    measure: "qualified property inquiries and recurring-service bookings",
  },
  {
    id: "hospitality",
    name: "Restaurants and hospitality",
    terms: ["restaurant", "restaurant menu", "catering", "hotel", "reservations", "brewery"],
    journey: "mobile menus, reservations, catering or event inquiries and current opening hours",
    conversion: "reserve a table or request an event booking",
    measure: "completed reservations, catering inquiries and ordering clicks",
  },
  {
    id: "stores",
    name: "Retail and ecommerce",
    terms: ["add to cart", "checkout", "product catalog", "online store", "ecommerce", "retail"],
    journey: "product discovery, variants, delivery information and a clear mobile checkout",
    conversion: "find a product and complete checkout",
    measure: "product-to-cart progression, checkout completion and attributed orders",
  },
  {
    id: "healthcare",
    name: "Healthcare and wellness",
    terms: ["dentist", "dental", "clinic", "patient", "therapy", "wellness"],
    journey: "service eligibility, provider information and appointment requests without collecting sensitive details in public chat",
    conversion: "request an appointment",
    measure: "appointment requests and confirmed appointments using appropriate privacy controls",
  },
  {
    id: "professionals",
    name: "Professional services",
    terms: ["attorney", "law firm", "accounting", "consulting", "consultant", "advisory"],
    journey: "practice-specific information, credentials and consultation intake without confidential case details",
    conversion: "request a consultation",
    measure: "qualified consultation requests and completed handoffs",
  },
  {
    id: "services",
    name: "Service companies",
    terms: ["plumbing", "plumber", "hvac", "electrician", "cleaning", "repair service"],
    journey: "service type, location, urgency and booking or dispatch handoff",
    conversion: "request service or book a visit",
    measure: "qualified service requests and scheduled visits",
  },
];

const GENERAL = {
  id: "general",
  name: "Industry not confirmed",
  journey: "the main customer need, the relevant offer and a clear next step",
  conversion: "complete the primary inquiry or purchase action",
  measure: "qualified inquiries or purchases and completed handoffs",
  terms: [] as string[],
};

export function normalizeIndustry(value: unknown) {
  if (value == null) return "";
  if (typeof value !== "string" || value.length > 120) throw new Error("Enter an industry using 120 characters or fewer.");
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
}

function stripNoise(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
}

export function industryEvidence(page: { html: string }) {
  const html = stripNoise(page.html);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
  const description = html.match(/<meta\b[^>]*name\s*=\s*["']description["'][^>]*>/i)?.[0] || "";
  const headings = [...html.matchAll(/<h[12]\b[^>]*>([\s\S]*?)<\/h[12]>/gi)].map((m) => m[1]).join(" ");
  const body = html.replace(/<[^>]+>/g, " ");
  return [title, description, headings, body].join(" ").replace(/\s+/g, " ").slice(0, 30000);
}

export function industryLinks(page: { html: string; url: string }) {
  const origin = new URL(page.url).origin;
  const found = new Set<string>();
  for (const match of page.html.matchAll(/<a\b[^>]*href\s*=\s*(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[2];
    const text = match[3].replace(/<[^>]+>/g, " ");
    if (!/about|services|what we do|products/i.test(`${text} ${href}`)) continue;
    try {
      const next = new URL(href, page.url);
      next.hash = "";
      next.search = "";
      if (next.origin === origin && next.href !== page.url) found.add(next.href);
    } catch {
      /* ignore bad hrefs */
    }
    if (found.size >= 2) break;
  }
  return [...found];
}

function rankedMatches(text: string) {
  return PROFILES
    .map((profile) => ({
      ...profile,
      hits: profile.terms.filter((term) => new RegExp(`\\b${term}\\b`, "i").test(text)),
    }))
    .sort((a, b) => b.hits.length - a.hits.length);
}

export function resolveIndustry(manual: string, pages: Array<{ html: string; url: string }>) {
  const supplied = normalizeIndustry(manual);
  const ranked = rankedMatches(supplied || pages.map(industryEvidence).join(" "));
  const best = ranked[0];
  const confident = Boolean(best && best.hits.length > 0 && best.hits.length > (ranked[1]?.hits.length || 0));
  const profile = confident && best ? best : GENERAL;
  return {
    id: profile.id,
    name: supplied || profile.name,
    journey: profile.journey,
    conversion: profile.conversion,
    measure: profile.measure,
    source: supplied ? "Provided by you" : confident ? "Suggested from website" : "Not confirmed",
    evidence: supplied
      ? "Your industry entry takes priority."
      : confident
        ? `Website terms: ${best.hits.join(", ")}. Please confirm this suggestion.`
        : "The available page content did not clearly identify one industry. Enter your industry to refine this report.",
    sources: supplied ? [] : pages.map((page) => page.url),
  };
}

export function additionalOfferings() {
  return [
    ["AI qualification", "Answer service questions and collect relevant project details before handoff."],
    ["Routing and follow-up", "Assign inquiries, define response ownership, and connect approved email or SMS follow-up."],
    ["Measurement", "Measure inquiry completion and sales handoff, beyond traffic alone."],
    ["Social destinations", "Connect relevant posts and campaign pages to a measurable next step."],
    ["Approval-based improvement", "Review site health, freshness, accessibility, and content improvements on an agreed cadence."],
  ] as Array<[string, string]>;
}
