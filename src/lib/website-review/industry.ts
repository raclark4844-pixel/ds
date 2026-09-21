import type { IndustryCapability } from "./types.ts";

export type IndustryProfile = {
  id: string;
  name: string;
  terms: string[];
  journey: string;
  conversion: string;
  measure: string;
  capabilities: IndustryCapability[];
};

const SHARED: IndustryCapability[] = [
  {
    id: "qualify",
    label: "On-site inquiry qualification",
    why: "Collect the service, timing, and location details needed to route a useful lead before anyone replies.",
    verify: "Submit a test inquiry and confirm required fields, routing, and a human handoff. Do not use live customer data.",
    improve: "Add a short qualification path that matches how this business actually books work, then route complete inquiries to the owner.",
    effort: "Build next",
  },
  {
    id: "answers",
    label: "Answer-ready service content",
    why: "Search and answer engines need clear, visible answers about fit, process, timing, and next steps.",
    verify: "Search the site for the top buying questions. Confirm the answers are on the page, not only in a PDF or a staff script.",
    improve: "Publish short, accurate answers on the relevant service pages. Keep them consistent with the structured data.",
    effort: "Build next",
  },
  {
    id: "measure-path",
    label: "Inquiry and conversion measurement",
    why: "Traffic without a completed inquiry, booking, or purchase path cannot show whether the website is working.",
    verify: "Complete a test conversion and confirm the event appears in Analytics, Search Console is verified, and the destination page is tracked.",
    improve: "Track form submits, calls, and key clicks as conversions. Review them on an agreed cadence. Rankings and conversion lifts are not guaranteed.",
    effort: "Build next",
  },
];

const PROFILES: IndustryProfile[] = [
  {
    id: "contractors",
    name: "Construction and exterior services",
    terms: ["roofing", "siding", "contractor", "remodeling", "gutters"],
    journey: "service-specific estimate requests, project photos, service area and project timing",
    conversion: "request an estimate",
    measure: "qualified estimate requests and booked inspections",
    capabilities: [
      { id: "estimate", label: "Qualified estimate request", why: "Homeowners need to describe the job, location, and timing before a visit is scheduled.", verify: "Run a test estimate request and confirm it reaches the shop with the job details.", improve: "Use a short estimate form or booking path that captures service, address range, and photos when useful.", effort: "Quick win" },
      { id: "proof", label: "Project proof by service", why: "Photos and completed-job pages help visitors confirm the shop does their type of work.", verify: "Open roofing, siding, or similar service pages and check that photos match the labeled service.", improve: "Add service-specific galleries and a clear next step on each project page.", effort: "Build next" },
      { id: "area", label: "Service area and timing", why: "Out-of-area and emergency work need different routing.", verify: "Confirm the site states the service area and what happens after an inquiry.", improve: "Show the service area and expected response, then route urgent requests separately.", effort: "Quick win" },
      ...SHARED,
    ],
  },
  {
    id: "landscaping",
    name: "Landscaping and outdoor services",
    terms: ["landscaping", "lawn care", "hardscaping", "irrigation", "tree service"],
    journey: "property type, service area, seasonal work and recurring maintenance inquiries",
    conversion: "request a property assessment",
    measure: "qualified property inquiries and recurring-service bookings",
    capabilities: [
      { id: "season", label: "Seasonal service pages", why: "Lawn, snow, irrigation, and outdoor living sell on different calendars.", verify: "Check that each active seasonal service has its own page and a working request path.", improve: "Publish or refresh seasonal pages before the selling window and connect each one to an inquiry.", effort: "Quick win" },
      { id: "property", label: "Property assessment path", why: "Outdoor work usually needs property type, size, and photos before a quote.", verify: "Submit a test assessment request and confirm the details arrive intact.", improve: "Ask for property type, service, and photos, then route complete requests to the owner.", effort: "Build next" },
      { id: "recurring", label: "Recurring maintenance option", why: "Repeat lawn or snow work is a different conversion than one-off installs.", verify: "Look for a maintenance or recurring-service path and a way to measure those inquiries.", improve: "Add a recurring-service option and track those inquiries separately from one-time projects.", effort: "Build next" },
      ...SHARED,
    ],
  },
  {
    id: "hospitality",
    name: "Restaurants and hospitality",
    terms: ["restaurant", "restaurant menu", "catering", "hotel", "reservations", "brewery"],
    journey: "mobile menus, reservations, catering or event inquiries and current opening hours",
    conversion: "reserve a table or request an event booking",
    measure: "completed reservations, catering inquiries and ordering clicks",
    capabilities: [
      { id: "hours", label: "Current hours and menu path", why: "Visitors bounce when hours or menus are missing or stale on phones.", verify: "Open the site on a phone and confirm hours, menu, and the next action match the shop today.", improve: "Keep hours and menus on the site, then measure reservation, order, and event clicks.", effort: "Quick win" },
      { id: "reserve", label: "Reservation or order action", why: "A room site without a booking or order path cannot show whether demand converted.", verify: "Complete a test reservation or order click and confirm it is tracked as a conversion.", improve: "Make the primary booking or order action visible and measure completed attempts.", effort: "Quick win" },
      { id: "events", label: "Catering and events inquiry", why: "Private events are a different job than walk-in traffic.", verify: "Find the event or catering path and send a test inquiry.", improve: "Give events their own page and form, then route those inquiries separately.", effort: "Build next" },
      ...SHARED,
    ],
  },
  {
    id: "stores",
    name: "Retail and ecommerce",
    terms: ["add to cart", "checkout", "product catalog", "online store", "ecommerce", "retail"],
    journey: "product discovery, variants, delivery information and a clear mobile checkout",
    conversion: "find a product and complete checkout",
    measure: "product-to-cart progression, checkout completion and attributed orders",
    capabilities: [
      { id: "catalog", label: "Product discovery and variants", why: "Shoppers need to find the item, options, and delivery facts before checkout.", verify: "Search for a real product on mobile and confirm variants, price, and shipping facts.", improve: "Tighten product pages and internal search so the path to cart is obvious.", effort: "Build next" },
      { id: "checkout", label: "Mobile checkout completion", why: "Cart starts are not sales. The site has to finish the order.", verify: "Walk a test order to the payment step in a sandbox or test mode. Never use live cards in this review.", improve: "Measure add-to-cart, checkout start, and purchase separately, then repair drop-off.", effort: "Build next" },
      { id: "returns", label: "Delivery and returns facts", why: "Missing shipping or return rules creates abandoned carts and support load.", verify: "Confirm shipping, delivery window, and returns are visible before payment.", improve: "Put delivery and return facts on product and checkout pages.", effort: "Quick win" },
      ...SHARED,
    ],
  },
  {
    id: "healthcare",
    name: "Healthcare and wellness",
    terms: ["dentist", "dental", "clinic", "patient", "therapy", "wellness"],
    journey: "service eligibility, provider information and appointment requests without collecting sensitive details in public chat",
    conversion: "request an appointment",
    measure: "appointment requests and confirmed appointments using appropriate privacy controls",
    capabilities: [
      { id: "appoint", label: "Appointment request without sensitive details", why: "The public site should collect enough to book, not medical history in an open form or chat.", verify: "Review the appointment form fields. Confirm it does not ask for unnecessary health details.", improve: "Keep the public request short: service, preferred time, and contact. Handle clinical details after handoff.", effort: "Quick win" },
      { id: "providers", label: "Services and provider information", why: "Visitors choose by service, provider, and location.", verify: "Open service and provider pages and confirm they match the appointment path.", improve: "Connect each offered service to a request path and keep provider facts current.", effort: "Build next" },
      ...SHARED,
    ],
  },
  {
    id: "professionals",
    name: "Professional services",
    terms: ["attorney", "law firm", "accounting", "consulting", "consultant", "advisory"],
    journey: "practice-specific information, credentials and consultation intake without confidential case details",
    conversion: "request a consultation",
    measure: "qualified consultation requests and completed handoffs",
    capabilities: [
      { id: "practice", label: "Practice-area pages", why: "General homepages rarely convert as well as a page for the actual matter or service.", verify: "Open the practice pages a new client would need and confirm a consultation path on each.", improve: "Give each offered practice its own page, proof, and consultation request.", effort: "Build next" },
      { id: "consult", label: "Consultation intake", why: "The public form should qualify the matter without collecting confidential files.", verify: "Submit a test consultation request and confirm routing. Do not upload client files in this review.", improve: "Ask for matter type, timeline, and contact, then move confidential documents to a private follow-up.", effort: "Quick win" },
      ...SHARED,
    ],
  },
  {
    id: "services",
    name: "Service companies",
    terms: ["plumbing", "plumber", "hvac", "electrician", "cleaning", "repair service"],
    journey: "service type, location, urgency and booking or dispatch handoff",
    conversion: "request service or book a visit",
    measure: "qualified service requests and scheduled visits",
    capabilities: [
      { id: "dispatch", label: "Service type, location, and urgency", why: "Dispatch needs the job, place, and timing, not a blank contact form.", verify: "Send a test service request and confirm those three details arrive.", improve: "Capture service, location, and urgency, then route urgent jobs separately.", effort: "Quick win" },
      { id: "book", label: "Book or request a visit", why: "A phone number alone does not show whether the website created the job.", verify: "Complete a test booking or request and confirm a conversion event fires.", improve: "Add a book-or-request action and measure completed requests.", effort: "Quick win" },
      ...SHARED,
    ],
  },
];

const GENERAL = {
  id: "general",
  name: "Industry not confirmed",
  journey: "the main customer need, the relevant offer and a clear next step",
  conversion: "complete the primary inquiry or purchase action",
  measure: "qualified inquiries or purchases and completed handoffs",
  terms: [] as string[],
  capabilities: [
    { id: "offer", label: "Clear offer and next step", why: "Visitors should see what the business does and what happens after they act.", verify: "Read the homepage on a phone and confirm the offer and primary action.", improve: "Rewrite the first screen around the paid job and one next step.", effort: "Quick win" },
    ...SHARED,
  ] as IndustryCapability[],
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
    capabilities: profile.capabilities,
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
    ["AI qualification", "Answer service questions and collect relevant project details before handoff. The public path should not collect passwords or unnecessary private records."],
    ["Routing and follow-up", "Assign inquiries, define response ownership, and connect approved email or SMS follow-up."],
    ["Measurement", "Connect Google Analytics, Search Console, and conversion events so inquiry completion is visible. Private account data is not read in this public scan."],
    ["AI and search visibility", "Publish answer-ready pages, accurate structured data, robots and sitemap files, and a machine-readable site summary. AI citations are not guaranteed."],
    ["Social destinations", "Connect relevant posts and campaign pages to a measurable next step."],
    ["Approval-based improvement", "Review site health, freshness, accessibility, and content improvements on an agreed cadence."],
  ] as Array<[string, string]>;
}
