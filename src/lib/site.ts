/**
 * PLACEHOLDERS — find and replace these tokens site-wide:
 *   [PHONE]
 * Email is live. Domain is live. Phone stays unpublished.
 */
import {
  automationAnswer,
  homeWhatWeDoAnswer,
  intakeStartAnswer,
  processAnswer,
  seoGeoAeoAnswer,
  websiteCustomAnswer,
  whoForAnswer,
  workAnswer,
} from "@/lib/answers";

export { seoGeoAeoAnswer, whoForAnswer } from "@/lib/answers";

export const PHONE = "[PHONE]";
export const EMAIL = "ryan@demoretechnologysolutions.com";
/** Hidden copy inbox. Never render as visible page copy. */
export const EMAIL_COPY = "ryan@demoreexteriorsolutions.com";
export const EMAIL_MAILTO = `mailto:${EMAIL}?cc=${EMAIL_COPY}`;
export const CITY = "Mentor";
export const REGION = "Ohio";
export const REGION_ABBR = "OH";
export const COUNTRY = "United States";
export const CITY_LINE = "Mentor, Lake County, Ohio";
export const AREA_LINE = "United States — nationwide, remote";
export const DOMAIN = "www.demoretechnologysolutions.com";

export const SITE_NAME = "Demore Technology Solutions";
export const SITE_URL = `https://${DOMAIN}`;
export const THEME_COLOR = "#050505";

export const primaryNav = [
  { to: "/", label: "Home" },
  { to: "/platform", label: "AI Growth Platform" },
  { to: "/websites", label: "Websites" },
  { to: "/growth", label: "Growth" },
  { to: "/automation", label: "Automation" },
  { to: "/compare", label: "Free Comparison" },
] as const;

export const laterNav = [
  { to: "/work", label: "Work" },
  { to: "/process", label: "Process" },
] as const;

export const offerCards = [
  {
    to: "/platform" as const,
    kicker: "Flagship platform",
    title: "Complete AI-assisted growth system",
    body: "A custom platform connecting the website, search visibility, content, campaigns, lead capture, analytics, follow-up, and automation.",
    accent: "volt" as const,
  },
  {
    to: "/websites" as const,
    kicker: "Sites",
    title: "Websites and ecommerce",
    body: "Custom mobile-first websites, landing pages, and online stores built around how the business gets found, converts visitors, and gets paid.",
    accent: "hot" as const,
  },
  {
    to: "/growth" as const,
    kicker: "Growth",
    title: "SEO / GEO / AEO / CRO",
    body: "Search visibility, AI-answer visibility, conversion strategy, technical performance, analytics, and lead-generation systems working together.",
    accent: "volt" as const,
  },
  {
    to: "/automation" as const,
    kicker: "AI + automation",
    title: "Marketing automation",
    body: "AI-assisted content, social publishing, lead routing, Google Business Profile workflows, review workflows, and custom business automation.",
    accent: "flare" as const,
  },
  {
    to: "/automation" as const,
    kicker: "Content",
    title: "Content systems",
    body: "Short-form video, social content, campaign assets, repurposing, approvals, and publishing workflows built to point traffic at a converting destination.",
    accent: "hot" as const,
  },
  {
    to: "/growth" as const,
    kicker: "Leads",
    title: "Lead generation",
    body: "Campaign landing pages, forms, conversion paths, audience targeting, tracking, and follow-up systems designed to create qualified opportunities.",
    accent: "volt" as const,
  },
  {
    to: "/contact" as const,
    kicker: "Intake",
    title: "Project brief",
    body: "A structured brief that collects the business, audience, goals, current stack, desired outcomes, and systems needed to build the right solution.",
    accent: "flare" as const,
  },
] as const;

export const proofPoints = [
  {
    kicker: "01",
    title: "One connected growth system",
    body: "Website, search visibility, AI-answer visibility, content, lead capture, analytics, and automation are designed to support one another instead of living in separate silos.",
  },
  {
    kicker: "02",
    title: "Intake built around the business",
    body: "The project brief collects the information needed to understand the offer, customer, conversion path, current tools, and growth priorities before the build starts.",
  },
  {
    kicker: "03",
    title: "No fake proof",
    body: "No invented revenue, fake testimonials, borrowed logos, fake traffic numbers, or guaranteed rankings, citations, leads, or conversion lifts.",
  },
] as const;

export const audiences = [
  {
    title: "Contractors and home-service companies",
    body: "Service pages, landing pages, galleries, estimate intake, local and service-area SEO structure, lead routing, social content, and automation that support real sales follow-up.",
  },
  {
    title: "Service businesses",
    body: "Websites, booking or estimating flows, conversion tracking, search visibility, content systems, and lead capture built around the way the company sells and delivers its service.",
  },
  {
    title: "Online stores",
    body: "Catalog, cart, checkout, product discovery, analytics, content, conversion optimization, and automation designed to move qualified traffic toward a purchase.",
  },
  {
    title: "Professional and growing businesses",
    body: "Lead-generation websites, campaign pages, authority content, AI-assisted marketing, analytics, and workflow automation for businesses that need a stronger digital operating system.",
  },
] as const;

export const engagementSteps = [
  {
    n: "01",
    title: "File a brief",
    body: "Tell us who you serve, what you sell, what you want built, what is working now, and the business outcome the system needs to support.",
    to: "/contact",
  },
  {
    n: "02",
    title: "Pressure-test the offer",
    body: "We review the offer, audience, conversion path, current website, search visibility, content, analytics, and automation opportunities before choosing the build priorities.",
  },
  {
    n: "03",
    title: "Build the system",
    body: "Sites, ecommerce, landing pages, growth optimization, analytics, content workflows, and automation are built as connected parts of the same customer journey.",
  },
  {
    n: "04",
    title: "Launch and improve",
    body: "The system launches with crawlable structure, measurement, clear conversion paths, and a foundation for ongoing testing, content, and automation.",
  },
] as const;

export const homeFaqs = [
  {
    q: "What does Demore Technology Solutions build?",
    a: homeWhatWeDoAnswer,
  },
  {
    q: "Who is Demore Technology Solutions for?",
    a: whoForAnswer,
  },
  {
    q: "What is an AI-assisted digital marketing and lead-generation platform?",
    a: "It is a connected system that combines the website, landing pages, search visibility, AI-answer visibility, content, social publishing, lead capture, analytics, conversion tracking, follow-up, and business automation. AI can assist with research, content workflows, campaign development, optimization, and repetitive tasks while people keep control of strategy, approvals, brand, and sales decisions. The objective is to make the marketing stack work as one system rather than a collection of disconnected tools.",
  },
] as const;

export const websiteFaqs = [
  {
    q: "What does a custom tailored website include?",
    a: websiteCustomAnswer,
  },
  {
    q: "Do you build online stores?",
    a: "Yes. Ecommerce work can include catalog structure, product and collection pages, variants, cart, checkout, pickup or shipping workflows, payments, analytics, conversion tracking, search structure, and marketing integrations. The store is designed around a usable mobile purchase path rather than simply applying a theme.",
  },
  {
    q: "Do you build lead-generation websites?",
    a: "Yes. Lead-generation sites can combine service pages, landing pages, calls to action, estimate or booking forms, analytics, conversion events, SEO, GEO, AEO, CRO, local or service-area structure, and integrations that route new inquiries into the business workflow.",
  },
] as const;

export const growthFaqs = [
  {
    q: "What is the difference between SEO, GEO, and AEO?",
    a: seoGeoAeoAnswer,
  },
  {
    q: "Is GEO the same as AEO?",
    a: "No. AEO focuses on making a page easy for search engines, voice systems, and AI-assisted results to extract as a direct answer. GEO focuses on making the brand, services, entities, expertise, and quotable information clear enough for generative systems to understand and potentially cite. Geographic optimization can also strengthen local and service-area relevance. CRO then focuses on what qualified visitors do after they arrive.",
  },
  {
    q: "Do you only optimize websites you build?",
    a: "No. Existing websites can be audited and improved for technical SEO, content structure, GEO, AEO, CRO, analytics, conversion tracking, internal linking, page speed, user experience, lead capture, and campaign performance. Rankings, AI citations, lead volume, and conversion lifts are not guaranteed.",
  },
] as const;

export const automationFaqs = [
  {
    q: "What is an AI-assisted marketing automation system?",
    a: automationAnswer,
  },
  {
    q: "Which platforms can the system support?",
    a: "Workflows can be designed around the platforms the business actually uses, including Facebook, Instagram, TikTok, YouTube, LinkedIn, X, Google Business Profile, and other supported services. The exact integrations depend on the platform APIs, account permissions, and the workflow being automated.",
  },
  {
    q: "Do automated posts and workflows need approval?",
    a: "Approval can be built into the workflow. For brand-sensitive content, reviews, customer communication, or other consequential actions, human review is often the better default. Automation should remove repetitive work without giving up appropriate control.",
  },
] as const;

export const contactFaqs = [
  {
    q: "What goes in the project brief?",
    a: intakeStartAnswer,
  },
  {
    q: "Is this a contract?",
    a: "No. The intake is a project brief, not a contract. Submitting it does not hire Demore Technology Solutions and does not guarantee rankings, AI citations, traffic, lead volume, engagement, or conversion lifts.",
  },
] as const;

export const workFaqs = [
  {
    q: "Where are the case studies?",
    a: workAnswer,
  },
  {
    q: "Will you invent results to fill this page?",
    a: "No. Demore Technology Solutions does not publish fake revenue, fake testimonials, fabricated traffic, made-up lead counts, or borrowed client logos. Results will be published only when there is real, permissioned work to document.",
  },
] as const;

export const processFaqs = [
  {
    q: "How does an engagement start?",
    a: processAnswer,
  },
] as const;
