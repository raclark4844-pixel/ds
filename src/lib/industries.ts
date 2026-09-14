export type IndustrySlug =
  | "contractors"
  | "landscaping"
  | "hospitality"
  | "professional-services"
  | "service-companies"
  | "stores-ecommerce";

export type IndustryProfile = {
  slug: IndustrySlug;
  label: string;
  title: string;
  description: string;
  intro: string;
  audience: string;
  seo: string;
  geo: string;
  aeo: string;
  cro: string;
  performance: string;
  automation: string;
  leadGen: string;
};

export const industries: readonly IndustryProfile[] = [
  {
    slug: "contractors",
    label: "Contractors & Home Services",
    title: "Digital growth systems for contractors and home-service companies",
    description: "Websites, local and service-area SEO, GEO, AEO, CRO, lead generation, analytics, and automation for contractors and home-service businesses.",
    intro: "Contractor marketing has to do more than look good. It needs to turn local search demand, storm or seasonal demand, referrals, paid traffic, and social attention into estimate requests and real sales conversations.",
    audience: "Roofing, siding, gutters, windows, remodeling, HVAC, plumbing, electrical, restoration, concrete, fencing, decking, painting, and other home-service businesses.",
    seo: "We structure service pages, supporting content, internal links, metadata, schema, location relevance, and crawl paths around the services and markets that actually produce revenue. The goal is stronger organic visibility without thin doorway pages.",
    geo: "We strengthen both geographic and generative relevance by making service areas, specialties, business entities, proof, FAQs, and quotable expertise explicit. That helps search systems understand where the contractor works and what the company is qualified to do.",
    aeo: "We build direct answers around homeowner questions such as repair versus replacement, timelines, estimates, financing, warranties, materials, and service areas so answer engines can extract useful responses quickly.",
    cro: "Estimate forms, click-to-call paths, galleries, reviews, financing, service-specific calls to action, trust signals, and mobile-first layouts are placed where they reduce friction and move qualified homeowners toward contact.",
    performance: "Fast mobile pages, stable layouts, compressed media, accessible controls, clear navigation, and simplified estimate flows matter because contractor traffic is often mobile and high-intent.",
    automation: "We can connect form leads, call notifications, CRM handoffs, review workflows, social publishing, Google Business Profile activity, follow-up alerts, and custom AI-assisted workflows so fewer opportunities get lost between marketing and sales.",
    leadGen: "Campaign landing pages, local targeting, paid and organic traffic paths, conversion tracking, and follow-up workflows are designed around estimate requests and measurable opportunities rather than vanity traffic alone."
  },
  {
    slug: "landscaping",
    label: "Landscaping & Outdoor Services",
    title: "Digital growth systems for landscaping and outdoor-service companies",
    description: "SEO, GEO, AEO, CRO, websites, lead generation, content, analytics, and automation for landscaping and outdoor-service businesses.",
    intro: "Landscaping demand is visual, seasonal, local, and service-specific. The digital system should make services easy to discover, prove workmanship quickly, and turn inspiration into quote requests.",
    audience: "Landscaping, lawn care, hardscaping, tree service, irrigation, outdoor lighting, patios, decks, fencing, snow removal, and related exterior-service businesses.",
    seo: "We organize service pages, seasonal content, galleries, location signals, internal links, and metadata around the work customers actually search for, from recurring maintenance to high-value design/build projects.",
    geo: "We make service areas, project types, capabilities, and local relevance clear to both search engines and generative systems while avoiding copy-paste city pages that add little value.",
    aeo: "Direct-answer sections can address timing, maintenance, project cost factors, materials, seasonal planning, service frequency, drainage, permits, and common homeowner questions.",
    cro: "Before-and-after proof, visual galleries, project-type calls to action, quote forms, service-area messaging, reviews, and simple mobile contact paths help turn browsing into project conversations.",
    performance: "Image-heavy sites are optimized so portfolio photography supports conversion without destroying load speed. Responsive images, stable layouts, accessibility, and mobile navigation are treated as core UX requirements.",
    automation: "Lead alerts, quote routing, content scheduling, social repurposing, seasonal campaigns, review requests, CRM updates, and AI-assisted content workflows can reduce repetitive marketing work.",
    leadGen: "We can build campaign pages around seasonal services, premium outdoor projects, recurring maintenance, and geographic demand, then measure which channels and offers actually produce qualified inquiries."
  },
  {
    slug: "hospitality",
    label: "Hospitality",
    title: "Digital growth systems for hospitality businesses",
    description: "Websites, local SEO, GEO, AEO, CRO, content, lead generation, analytics, and automation for hospitality businesses.",
    intro: "Hospitality websites have to answer questions fast, create confidence, show the experience clearly, and make the next action obvious—reserve, book, call, visit, inquire, or purchase.",
    audience: "Restaurants, venues, hotels, short-term lodging, event spaces, entertainment businesses, and hospitality brands that depend on local discovery and repeat traffic.",
    seo: "We structure menus, services, events, location details, amenities, booking information, and supporting content so search engines can understand the business and surface the right pages for high-intent queries.",
    geo: "Geographic relevance is reinforced through clear location, neighborhood, service-area, event, and amenity signals. Generative optimization focuses on factual, quotable details that AI-assisted search can understand and summarize accurately.",
    aeo: "Hours, parking, reservations, private events, accessibility, policies, amenities, dietary options, booking rules, and frequently asked questions are formatted as direct answers instead of buried in long copy.",
    cro: "Reservation buttons, booking links, event inquiry forms, maps, menus, offers, social proof, high-quality media, and mobile-first calls to action are arranged around the action that creates revenue.",
    performance: "We optimize media-heavy experiences so photography and video do not create slow, unstable pages. Mobile speed, tap targets, readable content, and accessible booking paths are prioritized.",
    automation: "Content calendars, event publishing, social workflows, review monitoring, website updates, inquiry routing, and AI-assisted campaign creation can reduce the manual work needed to stay visible.",
    leadGen: "We can create landing pages for events, private bookings, seasonal offers, group sales, catering, or special experiences and track the source and conversion path for each campaign."
  },
  {
    slug: "professional-services",
    label: "Professional Services",
    title: "Digital growth systems for professional-service firms",
    description: "Authority websites, SEO, GEO, AEO, CRO, lead generation, analytics, content, and automation for professional-service firms.",
    intro: "Professional-service marketing depends on trust, clarity, expertise, and a clean path from research to consultation. The site should make complex services understandable without sounding generic.",
    audience: "Consultants, accounting firms, financial professionals, legal-adjacent businesses, engineering firms, agencies, advisors, business services, and other expertise-driven companies.",
    seo: "We organize practice areas, services, industries served, expertise content, internal linking, metadata, and schema so search engines can connect the firm with the problems buyers are researching.",
    geo: "We clarify where services are available, which markets are served, and what expertise the firm owns. Generative optimization strengthens entity clarity, factual positioning, and quotable explanations for AI-assisted discovery.",
    aeo: "Direct-answer content explains processes, timelines, engagement models, common questions, terminology, and decision criteria in a format that is useful to both prospects and answer engines.",
    cro: "Consultation calls to action, qualification forms, credibility signals, clear service positioning, case-study structure, and focused landing pages reduce uncertainty and help the right prospects self-select.",
    performance: "Fast, accessible, stable pages and clean information architecture support credibility. Technical quality matters because a confusing or slow site undermines the professionalism the firm is trying to communicate.",
    automation: "Lead routing, intake, appointment workflows, CRM handoffs, nurture alerts, content repurposing, analytics reporting, and custom AI-assisted research or communication workflows can reduce repetitive administrative work.",
    leadGen: "We can build authority content, campaign pages, consultation funnels, downloadable resources, paid-search landing pages, and conversion tracking around the firm's highest-value services."
  },
  {
    slug: "service-companies",
    label: "Service Companies",
    title: "Digital growth systems for service companies",
    description: "Websites, SEO, GEO, AEO, CRO, lead generation, analytics, content, and automation for local, regional, and nationwide service companies.",
    intro: "Service companies need a digital system that explains the offer quickly, reaches the right markets, qualifies demand, and routes new opportunities into an actual sales process.",
    audience: "Local, regional, and nationwide B2C or B2B service businesses with appointment, quote, consultation, recurring-service, or project-based sales models.",
    seo: "We map services, problems solved, buyer intent, locations, industries served, and supporting content into a crawlable architecture designed around how prospects search.",
    geo: "Geographic relevance is built around real coverage areas and service availability. Generative optimization makes the company's capabilities, entities, expertise, and direct answers easier for AI systems to interpret.",
    aeo: "Pricing factors, service process, timelines, eligibility, scope, onboarding, FAQs, and buyer questions are answered directly so prospects can understand the offer before contacting the company.",
    cro: "Forms, booking, calls, qualification questions, proof, comparisons, testimonials, and strong calls to action are arranged around the company's sales process instead of using a one-size-fits-all contact page.",
    performance: "We improve page speed, mobile usability, accessibility, technical structure, and navigation so qualified prospects can reach the right service and action without friction.",
    automation: "Forms can trigger notifications, routing, CRM updates, email workflows, review requests, content workflows, reporting, and custom AI-assisted processes that reduce manual follow-up.",
    leadGen: "Lead-generation campaigns can be organized by service, market, buyer type, or offer, with dedicated landing pages and conversion tracking so the company can see which sources create real opportunities."
  },
  {
    slug: "stores-ecommerce",
    label: "Retail & Ecommerce",
    title: "Digital growth systems for retail and ecommerce businesses",
    description: "Ecommerce websites, SEO, GEO, AEO, CRO, product discovery, analytics, content, and automation for retail and online stores.",
    intro: "Ecommerce growth depends on discoverability, product clarity, trust, speed, merchandising, and a purchase path that works cleanly on mobile.",
    audience: "Online stores, local retailers with ecommerce, product brands, specialty shops, catalog businesses, and businesses selling physical or digital products online.",
    seo: "We improve category structure, product pages, internal linking, metadata, structured data, faceted navigation decisions, collection content, and crawl efficiency so search engines can understand the catalog.",
    geo: "For local retailers, geographic signals support store and pickup visibility. For broader ecommerce, generative optimization improves product, brand, category, and entity clarity so AI-assisted systems can understand what is sold and why it is relevant.",
    aeo: "Sizing, shipping, returns, materials, compatibility, product differences, care, pickup, availability, and buying questions can be turned into extractable direct answers and FAQs.",
    cro: "Product hierarchy, trust, reviews, shipping information, cart flow, checkout, mobile merchandising, offers, bundles, related products, and analytics are reviewed around purchase completion and average-order opportunities.",
    performance: "Fast product and collection pages, optimized media, stable layouts, accessible controls, and responsive checkout experiences protect both user experience and conversion potential.",
    automation: "Inventory-connected workflows, abandoned-cart or lead handoffs, review requests, product-content workflows, social publishing, analytics alerts, and AI-assisted merchandising support can reduce repetitive tasks.",
    leadGen: "Campaign landing pages, product launches, collection promotions, email or social acquisition paths, conversion tracking, and retargeting-ready events can be tied back to measurable purchases or qualified demand."
  }
] as const;

export function getIndustry(slug: IndustrySlug) {
  return industries.find((industry) => industry.slug === slug)!;
}
