export type CheckId =
  | "title"
  | "description"
  | "h1"
  | "viewport"
  | "https"
  | "alt"
  | "contact"
  | "form"
  | "cta"
  | "schema"
  | "faq"
  | "services";

export type CheckStatus = "Detected" | "Not detected" | "Not applicable";

export type AuditCheck = {
  id: CheckId;
  category: string;
  label: string;
  offer: string;
  action: string;
  effort: "Quick win" | "Build next";
  status: CheckStatus;
  evidence: string;
};

export const CHECKS: Omit<AuditCheck, "status" | "evidence">[] = [
  {
    id: "title",
    category: "Search foundations",
    label: "Page title",
    offer: "SEO and page architecture",
    action: "Write a descriptive title that connects the main service, audience, and location where relevant.",
    effort: "Quick win",
  },
  {
    id: "description",
    category: "Search foundations",
    label: "Search description",
    offer: "SEO and content strategy",
    action: "Add a clear search description with the service, customer benefit, and next step.",
    effort: "Quick win",
  },
  {
    id: "h1",
    category: "Search foundations",
    label: "Main page heading",
    offer: "Custom website and content",
    action: "Use one clear main heading that explains the offer in the customer's language.",
    effort: "Quick win",
  },
  {
    id: "viewport",
    category: "Mobile foundations",
    label: "Mobile viewport",
    offer: "Performance and user experience",
    action: "Configure the mobile viewport, then test navigation and forms on real phones.",
    effort: "Quick win",
  },
  {
    id: "https",
    category: "Mobile foundations",
    label: "HTTPS delivery",
    offer: "Technical site health",
    action: "Serve every page securely over HTTPS and redirect HTTP traffic.",
    effort: "Quick win",
  },
  {
    id: "alt",
    category: "Mobile foundations",
    label: "Image text alternatives",
    offer: "Accessibility and user experience",
    action: "Review image purpose and add useful alternative text; use empty alternatives only for decorative images.",
    effort: "Quick win",
  },
  {
    id: "contact",
    category: "Lead capture",
    label: "Contact route",
    offer: "Conversion optimization",
    action: "Give visitors a clear route to contact, book, buy, or request an estimate.",
    effort: "Quick win",
  },
  {
    id: "form",
    category: "Lead capture",
    label: "On-page inquiry form",
    offer: "Smart intake and qualification",
    action: "Review whether a short inquiry, booking, or estimate form would reduce friction; verify submission and routing.",
    effort: "Build next",
  },
  {
    id: "cta",
    category: "Lead capture",
    label: "Action-oriented link or button",
    offer: "Conversion optimization",
    action: "Make the primary next step visible and specific, with a clear expectation for what happens next.",
    effort: "Quick win",
  },
  {
    id: "schema",
    category: "Answers and trust",
    label: "Structured business information",
    offer: "Schema, GEO and AEO",
    action: "Publish accurate structured data that matches visible business and service content.",
    effort: "Build next",
  },
  {
    id: "faq",
    category: "Answers and trust",
    label: "Frequently asked questions",
    offer: "Answer-focused content",
    action: "Answer buying questions about process, timing, service fit, and next steps on relevant pages.",
    effort: "Build next",
  },
  {
    id: "services",
    category: "Answers and trust",
    label: "Service or product navigation",
    offer: "Custom website architecture",
    action: "Connect each important service or product to a useful destination with a relevant conversion path.",
    effort: "Build next",
  },
];

export const OFFERINGS: [string, string][] = [
  ["AI assistant and qualification", "Answer service questions and collect relevant project details before handoff."],
  ["CRM, routing and follow-up", "Assign inquiries, define response ownership, and connect approved email/SMS follow-up."],
  ["Analytics and attribution", "Measure inquiry completion and sales handoff, beyond traffic alone."],
  ["Social and campaign content", "Connect relevant posts and campaign pages to a measurable next step."],
  ["Approval-based improvement", "Review site health, freshness, accessibility, and content improvements on an agreed cadence."],
];

export const METHODOLOGY =
  "Quick review of the returned HTML at each listed URL. Detected means a matching signal was found, not that it works or is high quality. Not detected does not prove absence; JavaScript-rendered features and other pages may be missed. No form submissions, speed tests, ranking checks, analytics access, or accessibility certification were performed.";
