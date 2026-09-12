/**
 * PLACEHOLDERS — find and replace these tokens site-wide:
 *   [PHONE]  [DOMAIN]
 * Email is live. Phone stays unpublished.
 */
import {
  automationAnswer,
  claimsAnswer,
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
export const CITY = "Mentor";
export const REGION = "Ohio";
export const REGION_ABBR = "OH";
export const COUNTRY = "United States";
export const CITY_LINE = "Mentor, Lake County, Ohio";
export const AREA_LINE = "United States — nationwide, remote";
export const DOMAIN = "[DOMAIN]";

export const SITE_NAME = "Demore Technology Solutions";
export const SITE_URL = `https://${DOMAIN}`;
export const THEME_COLOR = "#050505";

export const primaryNav = [
  { to: "/", label: "Home" },
  { to: "/websites", label: "Websites" },
  { to: "/growth", label: "Growth" },
  { to: "/automation", label: "Automation" },
  { to: "/claims", label: "Claims" },
] as const;

export const laterNav = [
  { to: "/work", label: "Work" },
  { to: "/industries", label: "Industries" },
  { to: "/process", label: "Process" },
] as const;

export const offerCards = [
  {
    to: "/websites" as const,
    kicker: "Sites",
    title: "Websites and stores",
    body: "Custom modern mobile sites and online stores. Architecture follows how you get paid — not a leftover theme.",
    accent: "hot" as const,
  },
  {
    to: "/growth" as const,
    kicker: "Growth",
    title: "SEO / GEO / AEO / CRO",
    body: "Found in search. Built to convert. Rankings, citations, and lifts are not guaranteed.",
    accent: "volt" as const,
  },
  {
    to: "/automation" as const,
    kicker: "Bots",
    title: "Bots and social",
    body: "Auto-posting to the networks you already use. You approve. The calendar does not wait on a designer.",
    accent: "flare" as const,
  },
  {
    to: "/automation" as const,
    kicker: "Content",
    title: "Audio and video",
    body: "Short-form made for TikTok, Reels, Shorts, and Stories. Built to point at a page that converts.",
    accent: "hot" as const,
  },
  {
    to: "/claims" as const,
    kicker: "Claims",
    title: "Insurance claim supplements",
    body: "Document missed scope. Ask for a more complete payout. A supplement is a correction, not a fight.",
    accent: "volt" as const,
  },
  {
    to: "/contact" as const,
    kicker: "Intake",
    title: "Project brief",
    body: "A multi-step brief that collects facts a closer — or a claim file — actually needs.",
    accent: "flare" as const,
  },
] as const;

export const proofPoints = [
  {
    kicker: "01",
    title: "Both offers, in the open",
    body: "Digital systems and insurance claim supplements are first-class. Neither is buried in a blog.",
  },
  {
    kicker: "02",
    title: "Intake that survives a real call",
    body: "Forms collect the facts that keep a closer from starting at zero. The brief on this site is the working sample.",
  },
  {
    kicker: "03",
    title: "No fake proof",
    body: "No invented revenue. No borrowed logos. No fake recovery amounts. Rankings and payouts are not guaranteed.",
  },
] as const;

export const audiences = [
  {
    title: "Contractors",
    body: "Roofers, siders, remodelers. Storm pages, galleries, intake, and a documented claim path when insurance touches the job.",
  },
  {
    title: "Service companies",
    body: "Service pages, booking or estimating, and a form a dispatcher can read. Presence that sends work, not vanity posts.",
  },
  {
    title: "Online stores",
    body: "Catalog, cart, and checkout have to work on a phone. Content and traffic have to point at that cart.",
  },
  {
    title: "Homeowners after a storm",
    body: "Respect the mess. A supplement documents missed scope. It does not invent damage. Payment is not guaranteed.",
  },
] as const;

export const engagementSteps = [
  {
    n: "01",
    title: "File a brief",
    body: "Who you are, what you want built, brand, growth, and whether insurance touches the work.",
    to: "/contact",
  },
  {
    n: "02",
    title: "Pressure-test the offer",
    body: "We read how you get paid, or how a first estimate missed scope. If a request will not convert, we say so.",
  },
  {
    n: "03",
    title: "Build",
    body: "Sites, stores, automation, content, and claim documentation ship as a system. You see the work.",
  },
  {
    n: "04",
    title: "Launch",
    body: "The site goes live with crawlable structure and a path to intake. Posts point at pages that can take the job.",
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
    q: "What is an insurance claim supplement?",
    a: claimsAnswer,
    links: [{ to: "/claims" as const, label: "Claims" }],
  },
] as const;

export const websiteFaqs = [
  {
    q: "What does a custom tailored website include?",
    a: websiteCustomAnswer,
  },
  {
    q: "Do you build stores?",
    a: "Yes. An online store is a payment path: catalog, variant, cart, checkout, pickup or ship, financing if you use it. Demore Technology Solutions does not decorate a theme and call it commerce. If a product cannot be bought on a phone with a thumb, the store is not done. Mark “online store” on the project brief.",
  },
  {
    q: "Do you build contractor sites?",
    a: "Yes. A contractor still needs a site. Roofing, siding, remodel, and other home service trades live on storm calls and estimate follow-up. The site has to survive a one-handed tap from a driveway. Service pages, city-ready language for later market pages, galleries that load, and an intake a closer can read.",
  },
] as const;

export const growthFaqs = [
  {
    q: "What is the difference between SEO, GEO, and AEO?",
    a: seoGeoAeoAnswer,
  },
  {
    q: "Is GEO the same as AEO?",
    a: "No. AEO is whether a search, voice, or an AI Overview can lift a clean answer from the page. GEO is whether ChatGPT, Perplexity, Gemini, Copilot, or an AI Overview cites Demore Technology Solutions in a synthesized answer. On contractor pages GEO also covers geography: service-area language ready for city pages later. They stack. They are not the same job. CRO is whether the visitor acts.",
  },
  {
    q: "Do you only optimize sites you build?",
    a: "No. The growth stack is how this site is built and what Demore Technology Solutions sells. If you already have a site, the brief collects the URL, what you rank for, and the action you want a visitor to take. We still do not guarantee rankings, AI citations, or conversion lifts.",
  },
] as const;

export const automationFaqs = [
  {
    q: "What is a social posting system for a local business?",
    a: automationAnswer,
  },
  {
    q: "Which platforms?",
    a: "The networks you already use: Facebook, Instagram, TikTok, YouTube, LinkedIn, X, Google Business Profile, Nextdoor. Mark the ones you will actually post to on the brief. A calendar for a network you will not log into is waste.",
  },
  {
    q: "Do posts need approval?",
    a: "Yes, unless you explicitly waive it. The default is you approve. Frequency, platforms, and who signs off are collected in the project brief.",
  },
] as const;

export const claimsFaqs = [
  {
    q: "What is an insurance claim supplement?",
    a: claimsAnswer,
  },
  {
    q: "Are you a public adjuster?",
    a: "Demore Technology Solutions is not an insurer and is not a public adjuster unless licensed in that state. Do not treat this site as public-adjuster status. A supplement is a documented correction to missed scope. Policy limits, deductibles, and exclusions still apply. Payment increases are not guaranteed.",
  },
  {
    q: "Do you guarantee a higher payout?",
    a: "No. Claim support does not guarantee a carrier will increase payment. We do not invent recovery dollar amounts or approval rates. We do not teach anyone how to fabricate damage or inflate a claim. First estimates often omit code items, access and height, flashings, waste, and hidden damage. Those are the usual misses. The file still has to be true.",
  },
] as const;

export const contactFaqs = [
  {
    q: "What goes in the project brief?",
    a: intakeStartAnswer,
  },
  {
    q: "Is this a contract?",
    a: "No. The intake is a project brief, not a contract. Claim support does not guarantee a carrier will increase payment. Growth work does not guarantee rankings, AI citations, or conversion lifts. Submitting it does not hire Demore Technology Solutions.",
  },
] as const;

export const workFaqs = [
  {
    q: "Where are the case studies?",
    a: workAnswer,
  },
  {
    q: "Will you invent results to fill this page?",
    a: "No. Demore Technology Solutions does not publish fake revenue, fake quotes, fake recovery numbers, or borrowed logos. File a project brief if you want real work on this page later.",
  },
] as const;

export const processFaqs = [
  {
    q: "How does an engagement start?",
    a: processAnswer,
  },
] as const;
