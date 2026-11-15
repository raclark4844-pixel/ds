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

/** Display separately beside an unchecked, optional SMS checkbox. */
export const SMS_CONSENT_TEXT =
  "I agree to receive text messages from Demore Technology Solutions about my " +
  "project inquiry, including messages sent using automated technology. Consent " +
  "is not a condition of purchase. Message frequency varies. Message and data " +
  "rates may apply. Reply STOP to opt out or HELP for help.";

export const SMS_CONSENT_SOURCE = "demore-project-brief";

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
  smsOptIn: boolean;
  // Optional for compatibility with existing saved briefs; absent evidence is invalid.
  smsConsentText?: string;
  smsConsentTimestamp?: string;
  smsConsentSource?: string;
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
  smsOptIn: false,
  smsConsentText: "",
  smsConsentTimestamp: "",
  smsConsentSource: "",
  submittedAt: "",
});

export function applyNeed(brief: Brief, need?: string): Brief {
  if (!need) return brief;
  const extras = NEED_MAP[need] ?? [];
  if (extras.length === 0) return brief;
  return { ...brief, wants: Array.from(new Set([...brief.wants, ...extras])) };
}

/**
 * Call only from the dedicated SMS checkbox interaction, never from general
 * consent or when hydrating stored data. Client evidence is not server proof.
 */
export function captureSmsConsent(brief: Brief, checked: boolean): Brief {
  return {
    ...brief,
    smsOptIn: checked,
    smsConsentText: checked ? SMS_CONSENT_TEXT : "",
    smsConsentTimestamp: checked ? new Date().toISOString() : "",
    smsConsentSource: checked ? SMS_CONSENT_SOURCE : "",
  };
}

export function assertSmsConsentEvidence(brief: Brief): void {
  if (typeof brief.smsOptIn !== "boolean") {
    throw new Error("Invalid SMS consent selection.");
  }
  if (!brief.smsOptIn) return;

  const timestamp = brief.smsConsentTimestamp ?? "";
  const parsed = Date.parse(timestamp);

  if (
    brief.smsConsentText !== SMS_CONSENT_TEXT ||
    brief.smsConsentSource !== SMS_CONSENT_SOURCE ||
    !Number.isFinite(parsed) ||
    new Date(parsed).toISOString() !== timestamp ||
    parsed > Date.now()
  ) {
    throw new Error("Explicit SMS consent evidence is required.");
  }
}

export type SmsConsentEvent = Readonly<{
  project_id: string;
  reportId: string;
  action: "granted" | "revoked";
  disclosure: string;
  consentTimestamp: string;
  source: string;
  recordedAt: string;
}>;

/**
 * Server integration contract, not a database implementation:
 * - derive project/report authorization from the authenticated server context;
 * - insert events durably, without UPDATE/DELETE, in the brief-write transaction;
 * - scope every read/write by project_id AND reportId;
 * - record revocation as another event, never overwrite a grant;
 * - never log the brief or its handoffToken.
 *
 * Deployment remains blocked until the existing persistence route and isolated
 * regression tests verify these guarantees. This client module cannot enforce
 * database authorization, durability, or CI configuration.
 */
export function createSmsConsentEvent(
  brief: Brief,
  scope: Readonly<{ project_id: string; reportId: string }>,
  action: "granted" | "revoked",
): SmsConsentEvent {
  if (
    !scope.project_id.trim() ||
    !scope.reportId.trim() ||
    scope.reportId !== brief.reportId
  ) {
    throw new Error("Invalid consent scope.");
  }

  if (action !== "granted" && action !== "revoked") {
    throw new Error("Invalid consent action.");
  }

  if (action === "granted") {
    assertSmsConsentEvidence(brief);
    if (!brief.smsOptIn) throw new Error("SMS consent was not granted.");
  } else if (brief.smsOptIn !== false) {
    throw new Error("SMS consent must be explicitly revoked.");
  }

  const recordedAt = new Date().toISOString();

  return Object.freeze({
    project_id: scope.project_id,
    reportId: scope.reportId,
    action,
    disclosure: action === "granted" ? brief.smsConsentText! : "",
    consentTimestamp:
      action === "granted" ? brief.smsConsentTimestamp! : recordedAt,
    source: SMS_CONSENT_SOURCE,
    recordedAt,
  });
}

function fmtList(values: readonly string[]): string {
  return values.join(", ") || "—";
}

/** Defense in depth for free text; sensitive structured fields are omitted below. */
function sanitizeReportText(text: string, brief: Brief): string {
  let sanitized = text;

  const sensitiveValues = [
    brief.handoffToken,
    brief.reportId,
    brief.phone,
    brief.email,
  ]
    .filter((value) => typeof value === "string" && value.length > 0)
    .sort((a, b) => b.length - a.length);

  for (const value of sensitiveValues) {
    sanitized = sanitized.split(value).join("[redacted]");
  }

  return sanitized
    .replace(
      /\b[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      "[redacted email]",
    )
    .replace(
      /(^|[^\w])(\+?\d[\d(). -]{5,}\d)(?!\w)/g,
      (match: string, prefix: string, candidate: string) => {
        const digits = candidate.replace(/\D/g, "").length;
        return digits >= 7 && digits <= 15
          ? `${prefix}[redacted phone]`
          : match;
      },
    );
}

/**
 * Customer-facing text only. Never serialize the entire brief here.
 * SMS consent evidence belongs exclusively in the private audit trail.
 */
export function formatBrief(brief: Brief): string {
  const wantLabels = brief.wants.map(
    (id) => wantBuilt.find((item) => item.id === id)?.label ?? id,
  );

  const text = [
    "DEMORE TECHNOLOGY SOLUTIONS — PROJECT BRIEF",
    brief.submittedAt ? `Submitted: ${brief.submittedAt}` : "",
    "",
    "STEP 1 — BUSINESS",
    `Industries: ${brief.industry}`,
    `Full name: ${brief.name}`,
    `Role: ${brief.role}`,
    `Business name: ${brief.businessName}`,
    `City / market: ${brief.city}`,
    `Service area: ${brief.serviceArea}`,
    `Current website: ${brief.website}`,
    "",
    "STEP 2 — PROJECT",
    `Looking for: ${fmtList(wantLabels)}`,
    `Budget: ${brief.budget ? `$${Number(brief.budget).toLocaleString()}` : "—"}`,
    `Primary goal: ${brief.goal}`,
    `Timeline: ${brief.timeline}`,
    "",
    "STEP 3 — WEBSITE AND BRAND",
    `Features: ${fmtList(brief.features)}`,
    `Must-have pages: ${brief.mustHavePages}`,
    `Brand notes: ${brief.brand}`,
    `Inspiration sites: ${brief.likedSites}`,
    `Competitors: ${brief.competitors}`,
    `Buyer: ${brief.buyer}`,
    "",
    "STEP 4 — GROWTH AND CONTENT",
    `Platforms: ${fmtList(brief.platforms)}`,
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

  return sanitizeReportText(text, brief);
}

export const STEPS = [
  { id: 1, label: "Business" },
  { id: 2, label: "Project & budget" },
  { id: 3, label: "Site & brand" },
  { id: 4, label: "Growth" },
  { id: 5, label: "Leads & automation" },
] as const;