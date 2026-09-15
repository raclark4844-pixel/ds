import { industries } from "@/lib/industries";

export const STORAGE_KEY = "demore-brief-v5";
export const MIN_BUDGET = 600;

export const industryOptions = [...industries.map((item) => item.label), "Other"] as const;

export const wantBuilt = [
  { id: "platform", label: "Custom AI-assisted digital marketing and lead-generation platform" },
  { id: "website", label: "New website" },
  { id: "redesign", label: "Redesign existing site" },
  { id: "store", label: "Online store / ecommerce" },
  { id: "landing", label: "Campaign / landing pages" },
  { id: "booking", label: "Booking or estimating flow" },
  { id: "growth", label: "SEO, GEO, AEO, CRO and technical optimization" },
  { id: "leadgen", label: "Lead-generation system" },
  { id: "automation", label: "AI / workflow automation" },
  { id: "content", label: "Social / content system" },
  { id: "analytics", label: "Analytics and conversion tracking" },
  { id: "other", label: "Other / custom project" },
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
  platform: ["platform"],
};

export type Brief = {
  reportId: string;
  handoffToken: string;
  industry: string;
  name: string;
  role: string;
  businessName: string;
  phone: string;
  email: string;
  city: string;
  serviceArea: string;
  website: string;
  wants: string[];
  budget: string;
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
  reportId: "",
  handoffToken: "",
  industry: "",
  name: "",
  role: "",
  businessName: "",
  phone: "",
  email: "",
  city: "",
  serviceArea: "",
  website: "",
  wants: [],
  budget: "",
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
  const wantLabels = brief.wants.map((id) => wantBuilt.find((item) => item.id === id)?.label ?? id);
  return [
    "DEMORE TECHNOLOGY SOLUTIONS — PROJECT BRIEF",
    brief.reportId ? `Demore Report ID: ${brief.reportId}` : "",
    brief.submittedAt ? `Submitted: ${brief.submittedAt}` : "",
    "",
    "STEP 1 — BUSINESS",
    `Industry: ${brief.industry}`,
    `Full name: ${brief.name}`,
    `Role: ${brief.role}`,
    `Business name: ${brief.businessName}`,
    `Phone: ${brief.phone}`,
    `Email: ${brief.email}`,
    `City / market: ${brief.city}`,
    `Service area: ${brief.serviceArea}`,
    `Current website: ${brief.website}`,
    "",
    "STEP 2 — PROJECT",
    `Looking for: ${wantLabels.join(", ") || "—"}`,
    `Budget: ${brief.budget ? `$${Number(brief.budget).toLocaleString()}` : "—"}`,
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
  ].filter(Boolean).join("\n");
}

export const STEPS = [
  { id: 1, label: "Business" },
  { id: 2, label: "Project & budget" },
  { id: 3, label: "Site & brand" },
  { id: 4, label: "Growth" },
  { id: 5, label: "Leads & automation" },
] as const;
