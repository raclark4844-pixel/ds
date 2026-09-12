export const STORAGE_KEY = "demore-brief-v3";

export const businessTypes = [
  "Roofing contractor",
  "Siding contractor",
  "Remodeler / GC",
  "Other home-service contractor",
  "Service company",
  "Ecommerce / retail",
  "Professional practice",
  "Homeowner claim only",
  "Other",
] as const;

export const wantBuilt = [
  { id: "website", label: "New website" },
  { id: "redesign", label: "Redesign existing site" },
  { id: "store", label: "Online store" },
  { id: "booking", label: "Booking or estimating flow" },
  { id: "bots", label: "Social auto-posting bots" },
  { id: "av", label: "Audio / video for social" },
  { id: "growth", label: "SEO, GEO, AEO, CRO" },
  { id: "claims", label: "Insurance claim supplements" },
] as const;

export const budgetBands = [
  "Under $2,500",
  "$2,500 to $7,500",
  "$7,500 to $15,000",
  "$15,000 to $40,000",
  "$40,000 plus",
  "Not sure — recommend",
] as const;

export const siteFeatures = [
  { id: "service-pages", label: "Service pages" },
  { id: "location-pages", label: "Location pages" },
  { id: "gallery", label: "Gallery" },
  { id: "reviews", label: "Reviews" },
  { id: "blog", label: "Blog or resource hub" },
  { id: "portal", label: "Customer portal" },
  { id: "payments", label: "Payments" },
  { id: "crm", label: "CRM integration" },
  { id: "financing", label: "Financing widget" },
  { id: "multilingual", label: "Multilingual" },
] as const;

export const platforms = [
  "Facebook",
  "Instagram",
  "TikTok",
  "YouTube / Shorts",
  "LinkedIn",
  "X",
  "Google Business Profile",
  "Nextdoor",
] as const;

export const growthPriorities = [
  "Local pack / maps",
  "Service-page rankings",
  "AI / answer citations",
  "Conversion rate",
  "All of it",
] as const;

export const estimatingSoftware = [
  "Xactimate",
  "Symbility / Cotality",
  "Other",
  "None",
  "Not applicable",
] as const;

export const NEED_MAP: Record<string, string[]> = {
  website: ["website"],
  store: ["store"],
  bots: ["bots"],
  av: ["av"],
  growth: ["growth"],
  automation: ["bots", "av"],
  claims: ["claims"],
};

export type Brief = {
  name: string;
  role: string;
  businessName: string;
  businessType: string;
  phone: string;
  email: string;
  city: string;
  serviceArea: string;
  website: string;
  wants: string[];
  goal: string;
  timeline: string;
  budget: string;
  features: string[];
  mustHavePages: string;
  brand: string;
  likedSites: string;
  competitors: string;
  buyer: string;
  platforms: string[];
  frequency: string;
  approver: string;
  existingContent: string;
  seoNow: string;
  growthPriority: string;
  insuranceTouches: string;
  claimVolume: string;
  carriers: string;
  estimating: string;
  missedItems: string;
  anythingElse: string;
  consent: boolean;
  submittedAt: string;
};

export const emptyBrief = (): Brief => ({
  name: "",
  role: "",
  businessName: "",
  businessType: "",
  phone: "",
  email: "",
  city: "",
  serviceArea: "",
  website: "",
  wants: [],
  goal: "",
  timeline: "",
  budget: "",
  features: [],
  mustHavePages: "",
  brand: "",
  likedSites: "",
  competitors: "",
  buyer: "",
  platforms: [],
  frequency: "",
  approver: "",
  existingContent: "",
  seoNow: "",
  growthPriority: "",
  insuranceTouches: "",
  claimVolume: "",
  carriers: "",
  estimating: "",
  missedItems: "",
  anythingElse: "",
  consent: false,
  submittedAt: "",
});

export function applyNeed(brief: Brief, need?: string): Brief {
  if (!need) return brief;
  const extras = NEED_MAP[need] ?? [];
  if (extras.length === 0) return brief;
  const wants = Array.from(new Set([...brief.wants, ...extras]));
  return { ...brief, wants };
}

export function formatBrief(brief: Brief): string {
  const lines = [
    "DEMORE TECHNOLOGY SOLUTIONS — PROJECT BRIEF",
    brief.submittedAt ? `Submitted: ${brief.submittedAt}` : "",
    "",
    "STEP 1 — WHO YOU ARE",
    `Full name: ${brief.name}`,
    `Role: ${brief.role}`,
    `Business name: ${brief.businessName}`,
    `Business type: ${brief.businessType}`,
    `Phone: ${brief.phone}`,
    `Email: ${brief.email}`,
    `City / market: ${brief.city}`,
    `Service area: ${brief.serviceArea}`,
    `Current website: ${brief.website}`,
    "",
    "STEP 2 — WHAT YOU WANT BUILT",
    `Wants: ${brief.wants.join(", ") || "—"}`,
    `Primary goal: ${brief.goal}`,
    `Timeline: ${brief.timeline}`,
    `Budget: ${brief.budget}`,
    "",
    "STEP 3 — WEBSITE AND BRAND",
    `Features: ${brief.features.join(", ") || "—"}`,
    `Must-have pages: ${brief.mustHavePages}`,
    `Brand notes: ${brief.brand}`,
    `Inspiration sites: ${brief.likedSites}`,
    `Competitors: ${brief.competitors}`,
    `Buyer: ${brief.buyer}`,
    "",
    "STEP 4 — AUTOMATION, CONTENT, GROWTH",
    `Platforms: ${brief.platforms.join(", ") || "—"}`,
    `Posting frequency: ${brief.frequency}`,
    `Who approves posts: ${brief.approver}`,
    `Assets on hand: ${brief.existingContent}`,
    `Current SEO: ${brief.seoNow}`,
    `Growth priority: ${brief.growthPriority}`,
    "",
    "STEP 5 — CLAIMS AND CLOSE",
    `Does insurance touch this business: ${brief.insuranceTouches}`,
    `Rough claim volume per year: ${brief.claimVolume}`,
    `Carriers seen most: ${brief.carriers}`,
    `Estimating software: ${brief.estimating}`,
    `What first estimates usually miss: ${brief.missedItems}`,
    `Anything else: ${brief.anythingElse}`,
    `Consent: ${brief.consent ? "Yes" : "No"}`,
  ];
  return lines.filter((line) => line !== undefined).join("\n");
}

export const STEPS = [
  { id: 1, label: "Who" },
  { id: 2, label: "Scope" },
  { id: 3, label: "Site and brand" },
  { id: 4, label: "Automation" },
  { id: 5, label: "Claims and close" },
] as const;
