export const STORAGE_KEY = "demore-brief-v4";

export const businessTypes = [
  "Contractor / home services",
  "Service company",
  "Ecommerce / retail",
  "Professional practice",
  "B2B company",
  "Local business",
  "Other",
] as const;

export const wantBuilt = [
  { id: "website", label: "New website" },
  { id: "redesign", label: "Redesign existing site" },
  { id: "store", label: "Online store / ecommerce" },
  { id: "landing", label: "Campaign / landing pages" },
  { id: "booking", label: "Booking or estimating flow" },
  { id: "growth", label: "SEO, GEO, AEO, CRO" },
  { id: "leadgen", label: "Lead-generation system" },
  { id: "automation", label: "AI / workflow automation" },
  { id: "content", label: "Social / content system" },
  { id: "analytics", label: "Analytics and conversion tracking" },
] as const;

export const siteFeatures = [
  { id: "service-pages", label: "Service pages" },
  { id: "location-pages", label: "Location / service-area pages" },
  { id: "gallery", label: "Gallery / portfolio" },
  { id: "reviews", label: "Reviews / reputation proof" },
  { id: "resources", label: "Resource hub / articles" },
  { id: "portal", label: "Customer portal / gated content" },
  { id: "payments", label: "Payments / ecommerce" },
  { id: "crm", label: "CRM integration" },
  { id: "financing", label: "Financing integration" },
  { id: "multilingual", label: "Multilingual" },
  { id: "chat", label: "AI chat / assistant" },
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
  "Other",
] as const;

export const growthPriorities = [
  "Local search / maps",
  "Organic service or product rankings",
  "AI / answer visibility",
  "Lead generation",
  "Conversion rate",
  "Content and social reach",
  "Analytics and attribution",
  "All of it",
] as const;

export const NEED_MAP: Record<string, string[]> = {
  website: ["website"],
  store: ["store"],
  growth: ["growth", "leadgen"],
  automation: ["automation"],
  bots: ["automation", "content"],
  av: ["content"],
  leadgen: ["leadgen"],
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
  leadProcess: string;
  analyticsNow: string;
  automationNeeds: string;
  crmTools: string;
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
  leadProcess: "",
  analyticsNow: "",
  automationNeeds: "",
  crmTools: "",
  anythingElse: "",
  consent: false,
  submittedAt: "",
});

export function applyNeed(brief: Brief, need?: string): Brief {
  if (!need) return brief;
  const extras = NEED_MAP[need] ?? [];
  if (extras.length === 0) return brief;
  return { ...brief, wants: Array.from(new Set([...brief.wants, ...extras])) };
}

export function formatBrief(brief: Brief): string {
  return [
    "DEMORE TECHNOLOGY SOLUTIONS — PROJECT BRIEF",
    brief.submittedAt ? `Submitted: ${brief.submittedAt}` : "",
    "",
    "STEP 1 — BUSINESS",
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
    "STEP 2 — SCOPE AND OUTCOME",
    `Wants: ${brief.wants.join(", ") || "—"}`,
    `Primary goal: ${brief.goal}`,
    `Timeline: ${brief.timeline}`,
    "",
    "STEP 3 — WEBSITE AND BRAND",
    `Features: ${brief.features.join(", ") || "—"}`,
    `Must-have pages: ${brief.mustHavePages}`,
    `Brand notes: ${brief.brand}`,
    `Inspiration sites: ${brief.likedSites}`,
    `Competitors: ${brief.competitors}`,
    `Buyer: ${brief.buyer}`,
    "",
    "STEP 4 — GROWTH AND CONTENT",
    `Platforms: ${brief.platforms.join(", ") || "—"}`,
    `Posting frequency: ${brief.frequency}`,
    `Approver: ${brief.approver}`,
    `Assets on hand: ${brief.existingContent}`,
    `Current SEO / visibility: ${brief.seoNow}`,
    `Growth priority: ${brief.growthPriority}`,
    "",
    "STEP 5 — LEADS, ANALYTICS, AUTOMATION",
    `Current lead process: ${brief.leadProcess}`,
    `Current analytics: ${brief.analyticsNow}`,
    `Automation needs: ${brief.automationNeeds}`,
    `CRM / tools: ${brief.crmTools}`,
    `Anything else: ${brief.anythingElse}`,
    `Consent: ${brief.consent ? "Yes" : "No"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const STEPS = [
  { id: 1, label: "Business" },
  { id: 2, label: "Scope" },
  { id: 3, label: "Site & brand" },
  { id: 4, label: "Growth" },
  { id: 5, label: "Leads & automation" },
] as const;
