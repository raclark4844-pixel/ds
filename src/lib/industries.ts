import type { AppPath } from "@/lib/nav";

export type IndustrySlug =
  | "landscaping"
  | "hospitality"
  | "stores"
  | "service-companies"
  | "contractors"
  | "professionals";

export type IndustryAccent = "hot" | "volt" | "flare";

export type Industry = {
  slug: IndustrySlug;
  path: AppPath;
  navLabel: string;
  footerLabel: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  sub: string;
  icon: "leaf" | "glass" | "bag" | "wrench" | "roof" | "desk";
  iconAlt: string;
  tileLine: string;
  accent: IndustryAccent;
  answer: string;
  question: string;
  who: string;
  job: string;
  briefMark: string;
  businessType: string;
  mustDo: readonly { title: string; body: string }[];
  build: readonly { title: string; body: string }[];
  not: readonly string[];
  pages: readonly string[];
  briefHow: string;
  faqs: readonly { q: string; a: string }[];
};

export const industriesHubAnswer =
  "Demore Technology Solutions builds digital systems for six sectors: landscaping and outdoor trades; bars, restaurants, and pubs; online stores; service companies; contractors; and professionals. Based in Mentor, Ohio. Serves the entire United States. Work is remote nationwide. Each sector gets its own page because a landscaper site is not a leftover restaurant theme, and a store is not a brochure with a cart plugin. Custom means the information architecture follows how that business gets paid. Landscapers need service pages, seasonal work, galleries that load, and an estimate form a closer can read. Rooms need hours people can trust, a current menu, events, and a reservation or order path that works on a phone. Stores need catalog, variant, cart, and checkout on a thumb. Service companies and contractors need intake that survives a real call. Professionals need a public face and a brief that collects facts. Rankings, AI citations, and conversion lifts are not guaranteed.";

export const industriesHubFaqs = [
  {
    q: "Which industries does Demore Technology Solutions service?",
    a: industriesHubAnswer,
  },
  {
    q: "Do you only work in Ohio?",
    a: "No. Demore Technology Solutions is based in Mentor, Ohio and serves businesses throughout the United States. Website development, automation, content, SEO, AEO, GEO, and digital growth run remotely nationwide. Location and market pages are developed strategically for businesses targeting specific cities, regions, and service areas — not as mass-produced city pages.",
  },
  {
    q: "Can you add a sector that is not on this list?",
    a: "Yes, as a brief. Mark Other and say what you sell. Extra industries — HVAC, dental, law, real estate, and the rest — can sit inside Service companies, Contractors, or Professionals when they fit. They do not get a top-level page until the work is real. Digital only.",
  },
  {
    q: "Is this a franchise or a template pack per industry?",
    a: "No. Custom tailored is a constraint: every page has to earn a place in how the client gets paid. It is not a synonym for expensive, and it is not a cloned theme with a new logo. Rankings, AI citations, and conversion lifts are not guaranteed.",
  },
] as const;

export const industries: readonly Industry[] = [
  {
    slug: "landscaping",
    path: "/industries/landscaping",
    navLabel: "Landscaping & outdoor",
    footerLabel: "Landscaping",
    title: "Landscaping and outdoor trades",
    metaTitle: "Landscaping and Outdoor Trade Websites | Demore Technology Solutions",
    metaDescription:
      "Websites, estimate intake, and social systems for lawn, hardscape, irrigation, trees, snow, and outdoor living. Start a project brief.",
    h1: "Landscaping and outdoor trades",
    sub: "Service pages, seasonal work, galleries that load, and an estimate form a closer can read.",
    icon: "leaf",
    iconAlt: "Geometric leaf mark for landscaping and outdoor trades",
    tileLine: "Lawn, hardscape, irrigation, trees, snow, outdoor living.",
    accent: "hot",
    question: "Do you build landscaper websites?",
    answer:
      "Demore Technology Solutions builds websites, estimate intake, social auto-posting, short-form video, and the growth stack for landscaping and outdoor trades. That includes lawn, hardscape, irrigation, trees, snow, and outdoor living. Based in Mentor, Ohio. Serves the entire United States. Work is remote nationwide. A landscaper site is not a leftover theme with a new logo. Pages follow how the crew gets paid: services, seasonal offers, before-and-afters that point at an estimate form, and location pages when the crew has real markets. Auto-posting only ships if each yard photo points at a service page or the form. Posts without a landing path are a hobby. Rankings, AI citations, and conversion lifts are not guaranteed. File a project brief marked landscaping or outdoor service to start. We will not invent reviews, partner logos, or mass-produced city pages.",
    who: "Lawn, hardscape, irrigation, tree, snow, and outdoor living crews.",
    job: "Name the work, show seasonal proof, collect an estimate a closer can read.",
    briefMark: "Landscaping or outdoor service. New website or redesign. Booking or estimating. Seasonal pages.",
    businessType: "Landscaping or outdoor service",
    mustDo: [
      { title: "Service pages per trade", body: "Lawn, hardscape, irrigation, trees, snow, outdoor living — only the work you sell." },
      { title: "Seasonal work", body: "Spring lawn and winter snow can turn on without a redesign." },
      { title: "Galleries that load", body: "Before-and-afters on a phone. Not a 40MB dump." },
      { title: "Estimate form a closer can read", body: "From a driveway. Photos, address, service, timeline." },
      { title: "Location pages when the market is real", body: "Tied to services, customers, and search demand. Not mass-produced city pages." },
      { title: "Posts that land", body: "Yard photos point at a service page or the form. Not a photo dump." },
    ],
    build: [
      { title: "Site", body: "Service pages, seasonal, gallery, service area, estimate, about." },
      { title: "Bots and content", body: "Auto-posting and short-form only if each asset has a destination." },
      { title: "Growth", body: "SEO, GEO, AEO, CRO. Rankings and citations are not guaranteed." },
    ],
    not: [
      "Before-and-afters without a next step are a hobby.",
      "Stock handshake photography and a name-and-email form will not book the crew.",
    ],
    pages: ["Home", "Services", "One URL per trade", "Seasonal", "Gallery", "Service area", "Estimate", "About"],
    briefHow: "Mark Landscaping or outdoor service. Check new website or redesign, booking or estimating, seasonal pages, gallery. Name the trades you actually sell.",
    faqs: [
      {
        q: "Do you build landscaper websites?",
        a: "Yes. Demore Technology Solutions builds landscaper and outdoor trade sites: lawn, hardscape, irrigation, trees, snow, and outdoor living. Service pages, seasonal work, galleries, and an estimate form. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
      {
        q: "What trades are covered?",
        a: "Lawn care, hardscape, irrigation, tree work, snow, and outdoor living. Mark only the trades you sell. Extra trades sit on the brief, not as invented pages.",
      },
      {
        q: "Do you post the yard photos too?",
        a: "Yes, as auto-posting and short-form — if each photo points at a service page or the estimate form. Posts without a landing path are a hobby.",
      },
      {
        q: "Are local rankings guaranteed?",
        a: "No. Rankings, AI citations, and conversion lifts are not guaranteed. Location pages branch from the industry page when there are real markets, customers, and search demand. We do not generate hundreds of near-duplicate city pages.",
      },
    ],
  },
  {
    slug: "hospitality",
    path: "/industries/hospitality",
    navLabel: "Bars, restaurants & pubs",
    footerLabel: "Rooms",
    title: "Bars, restaurants, and pubs",
    metaTitle: "Bar, Restaurant, and Pub Websites | Demore Technology Solutions",
    metaDescription:
      "Hours, menu, events, and a reservation or order path for bars, restaurants, pubs, cafes, clubs, and food halls. Start a project brief.",
    h1: "Bars, restaurants, and pubs",
    sub: "Hours people can trust. A menu that is current. A path to a table or a pickup.",
    icon: "glass",
    iconAlt: "Geometric glass mark for bars, restaurants, and pubs",
    tileLine: "Hours, menu, events, reservation or order path.",
    accent: "volt",
    question: "Do you build restaurant and bar websites?",
    answer:
      "Demore Technology Solutions builds websites, reservation or order paths, social auto-posting, short-form video, and the growth stack for bars, restaurants, pubs, cafes, clubs, and food halls. Based in Mentor, Ohio. Serves the entire United States. Work is remote nationwide. A room site is not a brochure. Hours have to be right. The menu has to be current. Events have to be worth showing up for. A reservation or order path has to work on a phone. Specials posts without a menu or reservation link are a leak. Posts without a landing path are a hobby. Custom means the architecture follows how the room gets paid — covers, tables, pickup — not a leftover theme. Rankings, AI citations, and conversion lifts are not guaranteed. File a project brief marked bar, restaurant, pub, or similar. We will not invent reviews or reservation lifts.",
    who: "Bars, restaurants, pubs, cafes, clubs, and food halls.",
    job: "Hours, a current menu, events, and a path to a table or a pickup.",
    briefMark: "Bar, restaurant, pub, or similar. Menu. Reservations or events. Online ordering if you use it.",
    businessType: "Bar, restaurant, pub, or similar",
    mustDo: [
      { title: "Hours staff will keep updated", body: "Wrong hours lose the night. The page has to be easy to fix." },
      { title: "A current menu", body: "Not a PDF that dies on mobile." },
      { title: "Events worth showing up for", body: "A date, a room, a reason. Linked from posts." },
      { title: "Reservation or order on a phone", body: "One-handed. Thumb reach. No hover traps." },
      { title: "Same pattern for cafes, clubs, food halls", body: "The room changes. The job does not." },
      { title: "Short-form that points at the room", body: "Not a dead-end gallery of plates." },
    ],
    build: [
      { title: "Site", body: "Home, menu, hours, events, reservations or order, private events, about." },
      { title: "Bots and content", body: "Specials and video that hit the menu or the reservation path." },
      { title: "Growth", body: "Find the room. Answer the hours. Cite the offer. Convert to a table. None of that is guaranteed." },
    ],
    not: ["A pretty interior gallery with a buried phone number is not a hospitality site."],
    pages: ["Home", "Menu", "Hours", "Events", "Reservations or Order", "Private events", "About"],
    briefHow: "Mark Bar, restaurant, pub, or similar. Check menu, reservations or events, and online ordering if you take it. Name the room.",
    faqs: [
      {
        q: "Do you build restaurant and bar websites?",
        a: "Yes. Bars, restaurants, and pubs need hours people can trust, a current menu, events, and a reservation or order path that works on a phone. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
      {
        q: "Do cafes and food halls use the same pattern?",
        a: "Yes. Cafes, clubs, and food halls use the same architecture: hours, menu or offer, events, and a path to a table or a pickup.",
      },
      {
        q: "Can the menu stay current?",
        a: "That is the job. A menu that is a PDF or a photo dump will not stay current. We structure it so staff can update it. We do not staff your kitchen.",
      },
      {
        q: "Do you guarantee more reservations?",
        a: "No. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
    ],
  },
  {
    slug: "stores",
    path: "/industries/stores",
    navLabel: "Online stores",
    footerLabel: "Stores",
    title: "Online stores",
    metaTitle: "Online Store Websites | Demore Technology Solutions",
    metaDescription:
      "Catalog, variant, cart, and checkout that work on a phone. Custom stores, not a decorated theme. Start a project brief.",
    h1: "Online stores",
    sub: "Catalog, variant, cart, checkout. If it cannot be bought with a thumb, the store is not done.",
    icon: "bag",
    iconAlt: "Geometric bag mark for online stores",
    tileLine: "Catalog, variants, cart, checkout on a phone.",
    accent: "flare",
    question: "Do you build online stores?",
    answer:
      "Demore Technology Solutions builds custom online stores, product pages, checkout paths, social auto-posting, short-form video, and the growth stack. Based in Mentor, Ohio. Serves the entire United States. Work is remote nationwide. A store is a payment path. Catalog, variant, cart, checkout, pickup or ship, financing if the merchant uses it. We do not decorate a theme and call it commerce. Content and traffic have to point at a product that can be bought. If a product cannot be bought with a thumb, the store is not done. Posts without a landing path are a hobby. Custom means the information architecture follows how the merchant gets paid. Rankings, AI citations, and conversion lifts are not guaranteed. File a project brief marked store. We will not invent sales lifts, review widgets, or partner logos.",
    who: "Merchants who sell on a phone as much as on a desk.",
    job: "Catalog, variant, cart, checkout. Pickup or ship. Product pages that can be found.",
    briefMark: "Store. Online store. Payments. Catalog and product pages.",
    businessType: "Store",
    mustDo: [
      { title: "A catalog a phone can browse", body: "Thumb scroll. Filters that work. Images that load." },
      { title: "Variants that do not break the cart", body: "Size, color, add-on — still one checkout." },
      { title: "Checkout, pickup or ship", body: "If a product cannot be bought with a thumb, the store is not done." },
      { title: "Financing only if you use it", body: "We do not invent a lender." },
      { title: "Product content that can be found and cited", body: "Titles, answers, specs. Not keyword stuffing." },
      { title: "Posts that land on a product", body: "Not a homepage dump." },
    ],
    build: [
      { title: "Site", body: "Home, catalog, product, cart, checkout, shipping or pickup, the policy pages checkout needs." },
      { title: "Bots and content", body: "Product clips and posts that hit a buyable URL." },
      { title: "Growth", body: "Find the product. Answer the spec. Cite the brand. Convert. None guaranteed." },
    ],
    not: ["A theme skin with three products and a broken quantity selector is not a store."],
    pages: ["Home", "Catalog", "Product", "Cart", "Checkout", "Shipping / pickup", "Policy pages checkout needs"],
    briefHow: "Mark Store. Check online store and payments. Name catalog size, variants, pickup or ship, financing if you already use it.",
    faqs: [
      {
        q: "Do you build online stores?",
        a: "Yes. A store is a payment path: catalog, variant, cart, checkout, pickup or ship. If it cannot be bought with a thumb, it is not done. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
      {
        q: "Do you only reskin Shopify themes?",
        a: "No. We do not decorate a theme and call it commerce. Architecture follows how the merchant gets paid.",
      },
      {
        q: "What has to work on a phone?",
        a: "Browse, variant, cart, checkout. Large tap targets. No hover traps. Pickup or ship stated clearly.",
      },
      {
        q: "Are sales lifts guaranteed?",
        a: "No. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
    ],
  },
  {
    slug: "service-companies",
    path: "/industries/service-companies",
    navLabel: "Service companies",
    footerLabel: "Service",
    title: "Service companies",
    metaTitle: "Service Company Websites | Demore Technology Solutions",
    metaDescription:
      "Service pages, booking or estimating, and a form a dispatcher can read. Start a project brief.",
    h1: "Service companies",
    sub: "Service pages, booking or estimating, and a form a dispatcher can read.",
    icon: "wrench",
    iconAlt: "Geometric wrench mark for service companies",
    tileLine: "Service pages, booking or estimating, dispatcher-ready forms.",
    accent: "hot",
    question: "What counts as a service company here?",
    answer:
      "Demore Technology Solutions builds websites, booking or estimating intake, social auto-posting, short-form video, and the growth stack for service companies. Based in Mentor, Ohio. Serves the entire United States. Work is remote nationwide. A service company site has one job: name the work, prove the crew can do it, and hand a dispatcher facts they can use. Presence that sends work, not vanity posts. Pages follow how the company gets paid — by job type, by market, by urgency — not by an agency sitemap. Posts without a landing path are a hobby. Custom means every page earns a place in how the job gets booked. Rankings, AI citations, and conversion lifts are not guaranteed. File a project brief marked service company. We will not invent call-volume lifts, fake reviews, or mass-produced city pages.",
    who: "Owners who get paid by the job, not by the cart.",
    job: "Name the work, prove the crew, hand a dispatcher facts they can use.",
    briefMark: "Service company. Booking or estimating. Service pages. Location pages if the towns are real.",
    businessType: "Service company",
    mustDo: [
      { title: "One URL per service that makes money", body: "Not a blob called Services." },
      { title: "Booking or estimating, not a dead contact form", body: "Facts a dispatcher can use without a second call." },
      { title: "Facts a dispatcher can read", body: "Job type, photos, address, timing." },
      { title: "Service-area language that is true", body: "Towns you actually work." },
      { title: "Galleries that load", body: "Proof on a phone." },
      { title: "Posts that point at a service or the form", body: "Vanity posts are a hobby." },
    ],
    build: [
      { title: "Site", body: "Home, services, one URL per service, service area, gallery, booking or estimate, about." },
      { title: "Bots and content", body: "Job clips that hit a service page or the form." },
      { title: "Growth", body: "Find the service. Answer the question. Convert to a booked job. None guaranteed." },
    ],
    not: ["A stock handshake hero and a “request a quote” void is not a service site."],
    pages: ["Home", "Services", "One URL per service", "Service area", "Gallery", "Booking or Estimate", "About"],
    briefHow: "Mark Service company. Check booking or estimating and service pages. Name the jobs that actually pay.",
    faqs: [
      {
        q: "What counts as a service company here?",
        a: "A business paid by the job: dispatch, estimate, or booking. HVAC, cleaning, and similar trades can sit here when they fit. They do not get their own top-level page in this pass. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
      {
        q: "Do you handle booking calendars?",
        a: "The brief can mark booking or estimating. We wire the flow the dispatcher will actually use. We do not invent a calendar product you did not ask for.",
      },
      {
        q: "Can you add city pages later?",
        a: "Yes, when the company has legitimate geographic markets. The brief collects city and service area. We do not generate hundreds of near-duplicate city pages.",
      },
      {
        q: "Are call volume lifts guaranteed?",
        a: "No. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
    ],
  },
  {
    slug: "contractors",
    path: "/industries/contractors",
    navLabel: "Contractors",
    footerLabel: "Contractors",
    title: "Contractors",
    metaTitle: "Contractor Websites for Roofing, Siding, and Remodel | Demore Technology Solutions",
    metaDescription:
      "Contractor sites for roofing, siding, and remodel. Storm pages, galleries, and estimate intake. Start a project brief.",
    h1: "Contractors",
    sub: "A roofer still needs a site. Storm calls and estimate follow-up live on the phone.",
    icon: "roof",
    iconAlt: "Geometric roof mark for contractors",
    tileLine: "Roofing, siding, remodel. Storm pages and estimate follow-up.",
    accent: "volt",
    question: "Do you build contractor websites?",
    answer:
      "Demore Technology Solutions builds websites, storm and service pages, estimate intake, social auto-posting, short-form video, and the growth stack for contractors — including roofers, siders, and remodelers. Based in Mentor, Ohio. Serves the entire United States. Work is remote nationwide. A contractor site is not a leftover theme with a new logo. A roofer still needs a site. Storm pages, galleries that load, city-ready location language, and an intake a closer can read without a second call. Posts without a landing path are a hobby. Custom means the architecture follows how the crew gets paid, not an agency sitemap. Rankings, AI citations, and conversion lifts are not guaranteed. File a project brief marked contractor. We will not invent storm-lead rankings, fake reviews, partner badges, or mass-produced city pages. Digital only.",
    who: "Roofers, siders, remodelers, and related home-service trades.",
    job: "Storm and service pages, galleries, and an estimate a closer can use from a driveway.",
    briefMark: "Contractor. Booking or estimating. Service pages. Gallery. Location pages if the towns are real.",
    businessType: "Contractor",
    mustDo: [
      { title: "Service pages for trades that get paid", body: "Roofing, siding, remodel — only what you sell." },
      { title: "Storm / urgent paths on a phone", body: "One-handed. From a driveway. After a storm." },
      { title: "Galleries that load", body: "Proof, not a stall." },
      { title: "Estimate intake a closer can use", body: "Photos, address, trade, timeline." },
      { title: "Location pages when the market is real", body: "Tied to services, customers, and search demand. Not a list of towns." },
      { title: "Posts that land on storm or service pages", body: "A storm clip without a destination is a leak." },
    ],
    build: [
      { title: "Site", body: "Home, roofing, siding, remodel if you sell them, storm, gallery, service area, estimate, about." },
      { title: "Bots and content", body: "Storm and job clips that hit a service page or the form." },
      { title: "Growth", body: "Find the trade. Answer the storm question. Convert to an estimate. None guaranteed." },
    ],
    not: [
      "Stock handshake photography, a fake review widget, and a contact form that only asks for a name will not book the job.",
    ],
    pages: ["Home", "Roofing", "Siding", "Remodel (only trades you sell)", "Storm", "Gallery", "Service area", "Estimate", "About"],
    briefHow: "Mark Contractor. Check booking or estimating, service pages, gallery. Name roofing, siding, remodel, or related — only what you sell.",
    faqs: [
      {
        q: "Do you build contractor websites?",
        a: "Yes. A contractor still needs a site. Storm pages, galleries, city-ready language, and an intake a closer can read. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
      {
        q: "Which trades?",
        a: "Roofing, siding, remodel, and related home-service trades you actually sell. Extra trades sit on the brief. They do not get invented pages.",
      },
      {
        q: "Do you fake reviews or partner badges?",
        a: "No. No invented testimonials. No borrowed logos. No fake review widgets.",
      },
      {
        q: "Are storm-lead rankings guaranteed?",
        a: "No. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
    ],
  },
  {
    slug: "professionals",
    path: "/industries/professionals",
    navLabel: "Professionals",
    footerLabel: "Professionals",
    title: "Professionals",
    metaTitle: "Professional Practice Websites | Demore Technology Solutions",
    metaDescription:
      "A public face, pages that explain the work, and intake that survives a real call. Digital only. Start a project brief.",
    h1: "Professionals",
    sub: "A public face, pages that explain the work, and intake that survives a real call.",
    icon: "desk",
    iconAlt: "Geometric desk mark for professional practices",
    tileLine: "A public face, intake that survives a real call, digital only.",
    accent: "flare",
    question: "Who counts as a professional here?",
    answer:
      "Demore Technology Solutions builds websites, intake, social systems when they earn a place, and the growth stack for professionals who need a public face. Based in Mentor, Ohio. Serves the entire United States. Work is remote nationwide. Digital only. A professional site is not a resume theme. It has to state the offer, answer the questions a serious buyer asks before they call, and collect facts the practice can use. Posts without a landing path are a hobby. Custom means every page earns a place in how the practice gets paid. If a regulated practice files a brief, the site stays digital-only and the brief collects constraints. We do not invent HIPAA portals, case results, or clinical outcomes. Rankings, AI citations, and conversion lifts are not guaranteed. File a project brief marked professional.",
    who: "Practices that need a public face and a brief that collects facts.",
    job: "State the offer. Answer the buyer. Collect facts. Digital only.",
    briefMark: "Professional. New website or redesign. Intake. Service pages. No invented portals.",
    businessType: "Professional",
    mustDo: [
      { title: "Offer stated in plain English", body: "Not a vague mission sentence." },
      { title: "Pages mapped to how the practice gets paid", body: "Every page earns its place." },
      { title: "Intake that collects facts, not just a name", body: "The brief on this site is the working sample." },
      { title: "Speed and accessibility as table stakes", body: "Not a later sprint." },
      { title: "Optional posting only if posts have a destination", body: "A thought-leadership dump is a hobby." },
      { title: "No borrowed logos, no invented testimonials", body: "The work has to stand without that." },
    ],
    build: [
      { title: "Site", body: "Home, services or matters, about, intake, FAQ." },
      { title: "Bots and content", body: "Only if each post points at a page that can take the inquiry." },
      { title: "Growth", body: "Find the practice. Answer the question. Convert to a brief. None guaranteed." },
    ],
    not: ["A portrait, a vague mission sentence, and a contact form is not a practice site."],
    pages: ["Home", "Services or matters", "About", "Intake", "FAQ"],
    briefHow: "Mark Professional. Check new website or redesign and the pages you need. Put compliance constraints in brand notes. We do not promise HIPAA portals, case results, or clinical outcomes we have not scoped.",
    faqs: [
      {
        q: "Who counts as a professional here?",
        a: "A practice that needs a public face, pages that explain the work, and intake that survives a real call. Digital only. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
      {
        q: "Do you build medical or legal sites with compliance review?",
        a: "If a regulated practice files a brief, the site stays digital-only and the brief collects constraints. We do not invent HIPAA portals, case results, or clinical outcomes. Do not promise portals you have not scoped.",
      },
      {
        q: "Is this digital only?",
        a: "Yes. No print. No ads-as-a-service. No reputation widgets.",
      },
      {
        q: "Are inquiry lifts guaranteed?",
        a: "No. Rankings, AI citations, and conversion lifts are not guaranteed.",
      },
    ],
  },
];

export function industryBySlug(slug: string | undefined) {
  if (!slug) return undefined;
  return industries.find((item) => item.slug === slug);
}

export const industryPaths = industries.map((item) => item.path);

export const INDUSTRY_TO_TYPE: Record<string, string> = Object.fromEntries(
  industries.map((item) => [item.slug, item.businessType]),
);
INDUSTRY_TO_TYPE.other = "Other";
