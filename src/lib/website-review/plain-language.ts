import type { ReviewCheck, WebsiteReviewReport } from "./types.ts";

type Explanation = { name: string; found: string; why: string; action: string };
// Describe only what the public scan actually checks, not a functional audit.
const COPY: Record<string, Explanation> = {
  title: {
    name: "Page title",
    found: "A page title is present",
    why: "A clear title helps people recognize your business in search results and browser tabs.",
    action: "Check that the title names your main service and location where relevant.",
  },
  description: {
    name: "Search description",
    found: "A short search description is present",
    why: "A useful summary helps people decide whether your website answers their needs.",
    action: "Write a short summary of what you offer and why someone should visit.",
  },
  h1: {
    name: "Main headline",
    found: "One main headline is present",
    why: "Visitors should quickly understand what you do.",
    action: "Use one clear main headline that explains your offer in everyday language.",
  },
  viewport: {
    name: "Phone-friendly display settings",
    found: "Basic phone display settings are present",
    why: "People using a phone need readable pages and easy-to-use buttons. Settings alone do not prove the page works well.",
    action: "Check the display settings, then try the menu, buttons and forms on a real phone.",
  },
  https: {
    name: "Secure website connection",
    found: "The reviewed page uses a secure connection",
    why: "A secure connection helps protect information sent between a visitor and your website.",
    action: "Check that visitors reach a secure version of every important page.",
  },
  alt: {
    name: "Photo descriptions",
    found: "Images include spaces for text descriptions",
    why: "People using screen readers need useful descriptions of meaningful photos. This check does not judge the wording.",
    action:
      "Review meaningful photos and add short descriptions. Leave purely decorative images with empty descriptions.",
  },
  contact: {
    name: "A way to get in touch",
    found: "A contact link or route is present",
    why: "Interested visitors need an easy way to reach you.",
    action: "Make contact details easy to find and check that the links lead to the right place.",
  },
  form: {
    name: "A simple inquiry form",
    found: "A form with fields is present",
    why: "A short form can help someone ask a question when they cannot call. A visible form still needs a delivery test.",
    action:
      "Check whether a form would help your customers. If needed, add one and confirm messages reach the right inbox.",
  },
  cta: {
    name: "A clear next step",
    found: "A link or button invites visitors to take action",
    why: "Visitors are more likely to act when they know what to do next.",
    action: "Make the main button specific, such as Request an estimate, Book a visit or Shop now.",
  },
  schema: {
    name: "Business details for search tools",
    found: "Information formatted for search tools is present",
    why: "Accurate business information helps search tools understand what your pages describe. Its accuracy still needs checking.",
    action:
      "Check that the business name, services and location information match what visitors can see.",
  },
  faq: {
    name: "Answers to common questions",
    found: "A common-questions section is mentioned",
    why: "Useful answers help visitors decide whether your business is right for them.",
    action:
      "Answer the questions customers ask most often about your services, timing and next steps.",
  },
  services: {
    name: "Links to products or services",
    found: "Product or service links are present",
    why: "Visitors need a clear route to the product or service they came for.",
    action: "Give each main offering a useful page and a clear way to inquire, book or buy.",
  },
  ga: {
    name: "Visitor tracking",
    found: "A Google tracking setup is visible; reporting needs confirmation",
    why: "Visitor reports can show which pages people use and how they find you. This public check cannot see your reports.",
    action:
      "Check your existing tracking account first. Set up or repair visitor reporting if needed and confirm it records a test visit.",
  },
  gsc: {
    name: "Google search reporting",
    found: "A Google verification marker is visible; account access needs confirmation",
    why: "Google Search Console helps an owner understand search visibility. A public marker does not prove the account is ready.",
    action:
      "Confirm access with the owner. A site may already be verified through another method that this check cannot see.",
  },
  conversion: {
    name: "Tracking useful customer actions",
    found: "Clues to action tracking are visible; results need confirmation",
    why: "Visits alone do not tell you whether people make inquiries, bookings or purchases.",
    action:
      "Agree on the actions that matter, then check that completed actions appear correctly in your reports.",
  },
  robots: {
    name: "Instructions for search tools",
    found: "Instructions for search tools are present",
    why: "These instructions help search tools know which pages they can visit. Their presence does not mean the instructions are correct.",
    action: "Check that the instructions allow the important public pages to be visited.",
  },
  sitemap: {
    name: "A page list for search tools",
    found: "A page list or a link to one is present",
    why: "A current page list helps search tools discover your content. It does not guarantee placement in search results.",
    action:
      "Check that the list contains the right live pages and share it through the owner's Google search account.",
  },
  llms: {
    name: "An optional summary for AI tools",
    found: "A website summary for AI tools, or a link to one, is present",
    why: "A short business summary may offer useful context to some tools, but its use is not assured and it is not a requirement.",
    action:
      "Consider this optional extra after the main customer journey works. Keep any summary accurate; it cannot guarantee AI mentions.",
  },
};

export function checkExplanation(check: ReviewCheck): Explanation {
  return (
    COPY[check.id] || {
      name: "Additional website check",
      found: "An additional item was found and needs review",
      why: "This item needs a closer look before deciding whether a change would help your customers.",
      action: "Ask Demore to confirm the finding and explain the next step before making changes.",
    }
  );
}

export function reviewOverview(report: WebsiteReviewReport) {
  const checks = report.current.unavailable ? [] : report.current.checks;
  const found = checks.filter((c) => c.status === "Detected");
  const missing = checks.filter((c) => c.status === "Not detected");
  const unavailable = report.current.unavailable
    ? report.current.checks.length
    : checks.filter((c) => c.status === "Unavailable").length;
  const skipped = checks.filter((c) => c.status === "Not applicable").length;
  // Derive actions from current findings, so stale saved recommendations cannot
  // turn an unavailable or inapplicable check into a confirmed problem.
  const order = [
    "https",
    "contact",
    "cta",
    "form",
    "viewport",
    "title",
    "description",
    "h1",
    "alt",
    "services",
    "faq",
    "ga",
    "gsc",
    "conversion",
    "schema",
    "robots",
    "sitemap",
    "llms",
  ];
  const actions = [...missing].sort((a, b) => {
    const rank = (id: string) => (order.includes(id) ? order.indexOf(id) : order.length);
    return rank(a.id) - rank(b.id);
  });
  return { found, missing, unavailable, skipped, total: found.length + missing.length, actions };
}

export function plainText(text: string) {
  return text
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*|__/g, "")
    .replace(/```[^\n]*\n?/g, "");
}

export function businessGuidance(report: WebsiteReviewReport) {
  const name = report.industry.name;
  // Keep the visitor's category instead of relabeling every food business a restaurant.
  if (/\bpubs?\b/i.test(name) && !/\|/.test(name))
    return [
      "Help visitors plan a visit",
      "Make current hours, food and drink menus, events and directions easy to find on a phone.",
      "If you host private events, give those inquiries their own clear next step.",
    ];
  if (/pizza/i.test(name) && !/\|/.test(name))
    return [
      "Make ordering easy",
      "Help customers find the menu, pickup or delivery information and the right ordering link.",
      "Keep location and opening hours clear. Confirm any ordering changes with the business before connecting them.",
    ];
  switch (report.industry.id) {
    case "hospitality":
      return [
        "Help guests plan their visit",
        "Keep hours, menus, directions and the main booking or ordering option easy to find.",
        "If catering or private events are offered, give them a clear inquiry path.",
      ];
    case "contractors":
      return [
        "Help homeowners request the right work",
        "Explain your services and service area, show relevant completed projects and make estimate requests easy.",
        "Ask for enough job and timing information to help your team respond.",
      ];
    case "landscaping":
      return [
        "Match the page to the outdoor job",
        "Keep seasonal services and service areas current, with examples of relevant work.",
        "Let customers distinguish a one-time project from ongoing maintenance when they inquire.",
      ];
    case "stores":
      return [
        "Help shoppers choose and buy",
        "Make products, options, delivery information and returns easy to understand before checkout.",
        "Check the full buying journey on a phone using a test order before changing the live shop.",
      ];
    case "healthcare":
      return [
        "Make appointment requests straightforward",
        "Keep service, provider and location information clear and current.",
        "Keep public requests brief. Handle sensitive details through an appropriate private channel.",
      ];
    case "professionals":
      return [
        "Help clients find the right service",
        "Explain each service in familiar language and make it clear how to request a consultation.",
        "Keep confidential documents and case details out of public forms and chat.",
      ];
    case "services":
      return [
        "Make service requests easy to answer",
        "Help visitors explain the service they need, their location and their preferred timing.",
        "Explain what happens after they request a visit and how to reach you for urgent needs.",
      ];
    default:
      return [
        "Build around your customer's next step",
        "Make it easy to understand what you offer, who it is for and how to get started.",
        "For different services or locations, consider distinct pages where useful. Confirm the business details before planning changes.",
      ];
  }
}

export const supportAreas = [
  [
    "Website Health & Fixes",
    "We can check for broken links, confusing pages and website issues, then test agreed changes before they go live.",
  ],
  [
    "Getting Found Online",
    "We can improve the clarity and accuracy of your pages for search and AI tools. Search placement and AI mentions cannot be promised.",
  ],
  [
    "Turning Visitors Into Customers",
    "We can improve inquiry forms and booking paths, help messages reach the right person, and assess whether an AI assistant would be useful.",
  ],
  [
    "Content, Reviews & Social",
    "We can help keep pages and common answers current, and plan review responses and social content with your approval.",
  ],
  [
    "Tracking & Reporting",
    "We can connect appropriate tracking and explain the results in plain language so you can decide what to improve next.",
  ],
  [
    "Oversight & Quality Control",
    "We can organize proposed changes for review, agree on what needs your approval and check the results before expanding the work.",
  ],
] as const;
