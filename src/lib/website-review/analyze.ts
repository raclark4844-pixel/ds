import { additionalOfferings, resolveIndustry } from "./industry.ts";
import type { ReviewCheck, ReviewPage, ReviewStatus, WebsiteReviewReport } from "./types.ts";

type CheckSpec = Omit<ReviewCheck, "status" | "evidence">;

export const CHECKS: CheckSpec[] = [
  { id: "title", category: "Search foundations", label: "Page title", offer: "SEO and page architecture", action: "Write a descriptive title that connects the main service, audience, and location where relevant.", effort: "Quick win" },
  { id: "description", category: "Search foundations", label: "Search description", offer: "SEO and content strategy", action: "Add a clear search description with the service, customer benefit, and next step.", effort: "Quick win" },
  { id: "h1", category: "Search foundations", label: "Main page heading", offer: "Custom website and content", action: "Use one clear main heading that explains the offer in the customer's language.", effort: "Quick win" },
  { id: "viewport", category: "Mobile foundations", label: "Mobile viewport", offer: "Performance and user experience", action: "Configure the mobile viewport, then test navigation and forms on real phones.", effort: "Quick win" },
  { id: "https", category: "Mobile foundations", label: "HTTPS delivery", offer: "Technical site health", action: "Serve every page securely over HTTPS and redirect HTTP traffic.", effort: "Quick win" },
  { id: "alt", category: "Mobile foundations", label: "Image text alternatives", offer: "Accessibility and user experience", action: "Review image purpose and add useful alternative text; use empty alternatives only for decorative images.", effort: "Quick win" },
  { id: "contact", category: "Lead capture", label: "Contact route", offer: "Conversion optimization", action: "Give visitors a clear route to contact, book, buy, or request an estimate.", effort: "Quick win" },
  { id: "form", category: "Lead capture", label: "On-page inquiry form", offer: "Smart intake and qualification", action: "Review whether a short inquiry, booking, or estimate form would reduce friction; verify submission and routing.", effort: "Build next" },
  { id: "cta", category: "Lead capture", label: "Action-oriented link or button", offer: "Conversion optimization", action: "Make the primary next step visible and specific, with a clear expectation for what happens next.", effort: "Quick win" },
  { id: "schema", category: "Answers and trust", label: "Structured business information", offer: "Schema, GEO and AEO", action: "Publish accurate structured data that matches visible business and service content.", effort: "Build next" },
  { id: "faq", category: "Answers and trust", label: "Frequently asked questions", offer: "Answer-focused content", action: "Answer buying questions about process, timing, service fit, and next steps on relevant pages.", effort: "Build next" },
  { id: "services", category: "Answers and trust", label: "Service or product navigation", offer: "Custom website architecture", action: "Connect each important service or product to a useful destination with a relevant conversion path.", effort: "Build next" },
];

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/"/gi, '"')
    .replace(/&#39;|'/gi, "'")
    .replace(/</gi, "<")
    .replace(/>/gi, ">")
    .replace(/&/gi, "&");
}

function tagAttr(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  return match ? decodeHtml(match[2]).trim() : "";
}

function innerText(html: string) {
  return decodeHtml(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " "),
  ).trim();
}

function collectTags(html: string, tag: string) {
  return [...html.matchAll(new RegExp(`<${tag}\\b([^>]*)>`, "gi"))].map((match) => match[0]);
}

function hasAttr(tag: string, name: string) {
  return new RegExp(`\\b${name}\\s*=`, "i").test(tag);
}

function flagStatus(value: boolean | null): ReviewStatus {
  if (value === null) return "Not applicable";
  return value ? "Detected" : "Not detected";
}

export function analyzePage(page: { html: string; url: string }): ReviewPage {
  const html = page.html;
  const title = decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim().slice(0, 160);
  const description = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .some((tag) => (tagAttr(tag, "name") || tagAttr(tag, "property")).toLowerCase() === "description" && tagAttr(tag, "content"));
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => innerText(match[1]));
  const viewport = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .some((tag) => tagAttr(tag, "name").toLowerCase() === "viewport" && /width\s*=\s*device-width/i.test(tagAttr(tag, "content")));
  const images = collectTags(html, "img");
  const altCount = images.filter((tag) => hasAttr(tag, "alt")).length;
  const linkBlocks = [...html.matchAll(/<a\b[^>]*href\s*=\s*(["'])([^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({
    href: decodeHtml(match[2]),
    text: innerText(match[3]),
  }));
  const bodyText = innerText(html);
  const formHasFields = /<form\b[\s\S]*?<\/form>/i.test(html) && /<(input|textarea|select)\b/i.test(html);
  const ctaText = /request|book|contact|get.*quote|shop|buy|start|schedule|estimate/i;
  const cta = linkBlocks.some((link) => ctaText.test(link.text))
    || [...html.matchAll(/<(button|input)\b[^>]*>/gi)].some((match) => {
      const tag = match[0];
      return ctaText.test(`${innerText(tag)} ${tagAttr(tag, "value")}`);
    });
  const schema = [...html.matchAll(/<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)].some((match) => {
    try {
      const data = JSON.parse(match[2]);
      return data && typeof data === "object" && /"@type"/.test(JSON.stringify(data));
    } catch {
      return false;
    }
  });
  const contact = linkBlocks.some((link) => /^(tel:|mailto:)/i.test(link.href) || /contact|booking|estimate/i.test(link.href));
  const services = linkBlocks.some((link) => /service|product|shop|solutions/i.test(`${link.href} ${link.text}`));
  const flags: Record<string, boolean | null> = {
    title: Boolean(title),
    description,
    h1: h1s.length === 1 && Boolean(h1s[0]),
    viewport,
    https: page.url.startsWith("https:"),
    alt: images.length ? altCount === images.length : null,
    contact,
    form: formHasFields,
    cta,
    schema,
    faq: /frequently asked|\bFAQs?\b|common questions/i.test(bodyText),
    services,
  };

  const checks = CHECKS.map((spec) => {
    const raw = flags[spec.id];
    const status = flagStatus(raw === undefined ? false : raw);
    let evidence = flags[spec.id] ? "Signal present in returned page HTML" : "No matching signal in returned page HTML";
    if (spec.id === "title" && title) evidence = title;
    if (spec.id === "h1") evidence = `${h1s.length} main headings in returned HTML`;
    if (spec.id === "alt") evidence = `${altCount} of ${images.length} images have an alt attribute`;
    if (flags[spec.id] === null) evidence = "No relevant images to check";
    return { ...spec, status, evidence };
  });

  return {
    url: page.url,
    title: title || new URL(page.url).hostname,
    checks,
  };
}

export function categoryScores(checks: ReviewCheck[]) {
  const names = [...new Set(CHECKS.map((item) => item.category))];
  return names.map((name) => {
    const rows = checks.filter((item) => item.category === name && item.status !== "Not applicable" && item.status !== "Unavailable");
    return { name, detected: rows.filter((item) => item.status === "Detected").length, total: rows.length };
  });
}

export function makeReport(
  current: ReviewPage,
  benchmark: ReviewPage,
  recordId: string,
  industry = resolveIndustry("", []),
): WebsiteReviewReport {
  const recommendations = current.checks
    .filter((item) => item.status === "Not detected")
    .map((item) => ({
      ...item,
      action: ["contact", "form", "cta", "services"].includes(item.id)
        ? `${item.action} For this business, focus on ${industry.journey}.`
        : item.action,
    }));
  return {
    version: 2,
    recordId,
    createdAt: new Date().toISOString(),
    current,
    benchmark,
    industry,
    categories: categoryScores(current.checks),
    offerings: additionalOfferings(),
    methodology:
      "Quick review of the returned HTML at each listed URL. Detected means a matching signal was found, not that it works or is high quality. Not detected does not prove absence; JavaScript-rendered features and other pages may be missed. No form submissions, speed tests, ranking checks, analytics access, or accessibility certification were performed. Rankings, AI citations, and conversion lifts are not guaranteed.",
    recommendations,
  };
}

export function unavailableBenchmark(url: string): ReviewPage {
  return {
    url,
    title: "Demore Exterior Solutions",
    checks: CHECKS.map((spec) => ({ ...spec, status: "Unavailable", evidence: "Reference page could not be fetched." })),
    unavailable: true,
  };
}
