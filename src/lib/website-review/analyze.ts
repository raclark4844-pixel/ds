import {tailoredAutomation} from "../console-offering.ts";
import { additionalOfferings, resolveIndustry } from "./industry.ts";
import type { PublicFiles, ReviewCheck, ReviewPage, ReviewStatus, WebsiteReviewReport } from "./types.ts";

type CheckSpec = Omit<ReviewCheck, "status" | "evidence">;

export const CHECKS: CheckSpec[] = [
  { id: "title", category: "Search foundations", label: "Page title", offer: "SEO and page architecture", action: "Write a descriptive title that connects the main service, audience, and location where relevant.", effort: "Quick win", verify: "View source or the browser tab title on the live page.", improve: "Include the primary service and audience in one unique title." },
  { id: "description", category: "Search foundations", label: "Search description", offer: "SEO and content strategy", action: "Add a clear search description with the service, customer benefit, and next step.", effort: "Quick win", verify: "Check the description meta tag in page source.", improve: "Write one sentence with the offer, benefit, and next step." },
  { id: "h1", category: "Search foundations", label: "Main page heading", offer: "Custom website and content", action: "Use one clear main heading that explains the offer in the customer's language.", effort: "Quick win", verify: "Confirm a single H1 is visible and matches the page purpose.", improve: "Keep one H1 that states the offer in customer language." },
  { id: "viewport", category: "Mobile foundations", label: "Mobile viewport", offer: "Performance and user experience", action: "Configure the mobile viewport, then test navigation and forms on real phones.", effort: "Quick win", verify: "Check for a device-width viewport meta tag and test the page on a phone.", improve: "Add the viewport tag and test forms on a real device." },
  { id: "https", category: "Mobile foundations", label: "HTTPS delivery", offer: "Technical site health", action: "Serve every page securely over HTTPS and redirect HTTP traffic.", effort: "Quick win", verify: "Load the page over https and confirm HTTP redirects.", improve: "Force HTTPS on every URL." },
  { id: "alt", category: "Mobile foundations", label: "Image text alternatives", offer: "Accessibility and user experience", action: "Review image purpose and add useful alternative text; use empty alternatives only for decorative images.", effort: "Quick win", verify: "Inspect image tags for alt attributes and read them aloud.", improve: "Add useful alt text, or empty alt on decorative images." },
  { id: "contact", category: "Lead capture", label: "Contact route", offer: "Conversion optimization", action: "Give visitors a clear route to contact, book, buy, or request an estimate.", effort: "Quick win", verify: "Tap the contact, booking, or estimate path on a phone.", improve: "Put one obvious contact route in the header and footer." },
  { id: "form", category: "Lead capture", label: "On-page inquiry form", offer: "Smart intake and qualification", action: "Review whether a short inquiry, booking, or estimate form would reduce friction; verify submission and routing.", effort: "Build next", verify: "Submit a test inquiry and confirm it arrives. Do not use live customer data.", improve: "Add a short form and confirm routing before promoting it." },
  { id: "cta", category: "Lead capture", label: "Action-oriented link or button", offer: "Conversion optimization", action: "Make the primary next step visible and specific, with a clear expectation for what happens next.", effort: "Quick win", verify: "Find the primary button and confirm it names the next step.", improve: "Use one specific action: request, book, buy, or schedule." },
  { id: "schema", category: "AI and search visibility", label: "Structured business information", offer: "Schema, GEO and AEO", action: "Publish accurate structured data that matches visible business and service content.", effort: "Build next", verify: "Search page source for JSON-LD and confirm @type matches the visible business.", improve: "Add or correct structured data so it matches the page, not a leftover template." },
  { id: "faq", category: "AI and search visibility", label: "Frequently asked questions", offer: "Answer-focused content", action: "Answer buying questions about process, timing, service fit, and next steps on relevant pages.", effort: "Build next", verify: "Search the page for buying questions a new customer would ask.", improve: "Publish short answers on the service pages, not only in a brochure." },
  { id: "services", category: "Answers and trust", label: "Service or product navigation", offer: "Custom website architecture", action: "Connect each important service or product to a useful destination with a relevant conversion path.", effort: "Build next", verify: "Follow each service or product link and confirm it lands on a useful page.", improve: "Give each paid service a destination and a next step." },
  { id: "ga", category: "Measurement", label: "Google Analytics or Google tag", offer: "Measurement", action: "Install a Google tag so traffic and events can be reviewed. This scan only looks for a public tag, not account data.", effort: "Quick win", verify: "View page source for gtag.js, G- measurement IDs, or a Google tag manager container. Then open Google Analytics and confirm realtime for a test visit.", improve: "Add a Google tag, map the main conversion events, and review them monthly. Rankings and conversion lifts are not guaranteed." },
  { id: "gsc", category: "Measurement", label: "Search Console verification", offer: "Measurement", action: "Verify the property in Google Search Console so coverage, queries, and indexing issues can be reviewed.", effort: "Quick win", verify: "Look for a google-site-verification meta tag or confirm the property in Search Console. A missing tag does not prove the property is unverified; DNS verification is not visible here.", improve: "Verify the site in Search Console, submit the sitemap, and review coverage. This public scan cannot read private Search Console data." },
  { id: "conversion", category: "Measurement", label: "Conversion tracking signal", offer: "Measurement", action: "Track completed inquiries, bookings, or purchases as conversions, not traffic alone.", effort: "Build next", verify: "Complete a test conversion and confirm an event, Ads conversion ID, or thank-you destination is present. Then confirm the event in Analytics.", improve: "Fire a conversion on form submit, booking, or purchase. Do not treat pageviews as leads." },
  { id: "robots", category: "AI and search visibility", label: "Robots instructions", offer: "Technical site health", action: "Publish a robots.txt file that allows important pages and points to the sitemap.", effort: "Quick win", verify: "Open /robots.txt and confirm User-agent rules. Make sure it does not block the pages you want indexed.", improve: "Add a robots.txt file with a Sitemap line and no accidental full-site block." },
  { id: "sitemap", category: "AI and search visibility", label: "XML sitemap", offer: "SEO and page architecture", action: "Publish an XML sitemap and submit it in Search Console.", effort: "Quick win", verify: "Open /sitemap.xml or the Sitemap line in robots.txt and confirm it lists live URLs.", improve: "Generate a sitemap of indexable pages and submit it in Search Console." },
  { id: "llms", category: "AI and search visibility", label: "Machine-readable site summary", offer: "Schema, GEO and AEO", action: "Publish a plain-text site summary so answer engines can read the business, services, and contact path.", effort: "Build next", verify: "Open /llms.txt. Confirm it names the business, services, and how to contact without passwords or private data.", improve: "Add a short llms.txt file that matches the public site. AI citations are not guaranteed." },
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

function looksLikeHtml(text: string) {
  return /<html[\s>]|<!doctype html/i.test(text.slice(0, 800));
}

export function looksLikeRobots(text: string) {
  return /^\s*(user-agent|sitemap|disallow|allow|crawl-delay):/im.test(text) && !looksLikeHtml(text);
}

export function looksLikeSitemap(text: string) {
  return /<(urlset|sitemapindex)\b/i.test(text);
}

export function looksLikeLlms(text: string) {
  return Boolean(text.trim()) && text.trim().length >= 40 && !looksLikeHtml(text);
}

export function analyzePage(page: { html: string; url: string; extras?: PublicFiles }): ReviewPage {
  const html = page.html;
  const extras = page.extras || {};
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
  const ga = /googletagmanager\.com\/gtag\/js|google-analytics\.com\/(?:analytics|ga)\.js|gtag\(\s*['"]config['"]|['"]G-[A-Z0-9]+['"]|UA-\d{4,}-\d+|GTM-[A-Z0-9]+/i.test(html);
  const gsc = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .some((tag) => tagAttr(tag, "name").toLowerCase() === "google-site-verification" && tagAttr(tag, "content"));
  const conversion = /gtag\(\s*['"]event['"]|google_conversion|send_to\s*:|AW-\d{6,}|generate_lead|purchase['"]|thank[- ]you/i.test(html);
  const robotsMeta = [...html.matchAll(/<meta\b[^>]*>/gi)]
    .map((match) => match[0])
    .some((tag) => tagAttr(tag, "name").toLowerCase() === "robots");
  const robotsFile = extras.robots ? looksLikeRobots(extras.robots) : false;
  const sitemapLink = /rel\s*=\s*(["'])sitemap\1|href\s*=\s*(["'])[^"']*sitemap\.xml/i.test(html) || (extras.robots ? /sitemap:/i.test(extras.robots) : false);
  const sitemapFile = extras.sitemap ? looksLikeSitemap(extras.sitemap) : false;
  const llmsLink = /llms\.txt/i.test(html);
  const llmsFile = extras.llms ? looksLikeLlms(extras.llms) : false;

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
    ga,
    gsc,
    conversion,
    robots: robotsFile || robotsMeta,
    sitemap: sitemapFile || sitemapLink,
    llms: llmsFile || llmsLink,
  };

  const checks = CHECKS.map((spec) => {
    const raw = flags[spec.id];
    const status = flagStatus(raw === undefined ? false : raw);
    let evidence = flags[spec.id] ? "Signal present in returned public files or page HTML" : "No matching signal in returned public files or page HTML";
    if (spec.id === "title" && title) evidence = title;
    if (spec.id === "h1") evidence = `${h1s.length} main headings in returned HTML`;
    if (spec.id === "alt") evidence = `${altCount} of ${images.length} images have an alt attribute`;
    if (spec.id === "ga") evidence = ga ? "Google tag, Analytics, or Tag Manager snippet found in page HTML" : "No Google Analytics or Google tag snippet found in page HTML";
    if (spec.id === "gsc") evidence = gsc ? "google-site-verification meta tag found. This does not prove Search Console data is available." : "No Search Console verification meta tag found. DNS verification would not appear here.";
    if (spec.id === "conversion") evidence = conversion ? "A conversion event, Ads conversion ID, or thank-you signal was found" : "No conversion event, Ads conversion ID, or thank-you signal found";
    if (spec.id === "robots") evidence = robotsFile ? "robots.txt returned crawl rules" : robotsMeta ? "robots meta tag found on the page" : "No robots.txt rules or robots meta tag found";
    if (spec.id === "sitemap") evidence = sitemapFile ? "XML sitemap returned" : sitemapLink ? "Sitemap reference found" : "No XML sitemap found";
    if (spec.id === "llms") evidence = llmsFile ? "llms.txt returned a text summary" : llmsLink ? "llms.txt linked from the page" : "No llms.txt summary found";
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

export function makeAssistantBrief(report: Omit<WebsiteReviewReport, "assistantBrief">) {
  const missing = report.current.checks.filter((item) => item.status === "Not detected");
  const detected = report.categories.reduce((sum, row) => sum + row.detected, 0);
  const total = report.categories.reduce((sum, row) => sum + row.total, 0);
  return [
    `Demore website review ${report.recordId}`,
    `URL: ${report.current.url}`,
    `Industry: ${report.industry.name} (${report.industry.source})`,
    `Detected HTML and public-file signals: ${total ? `${detected}/${total}` : "Unavailable"}`,
    missing.length ? `Not detected:\n${missing.map((item) => `- ${item.label}: ${item.improve}`).join("\n")}` : "No applicable signals were missing in this scan.",
    "Control center and automated lead-generation opportunities:",
    ...report.offerings.map(([name,detail])=>`- ${name}: ${detail}`),
    "Industry capabilities to evaluate:",
    ...report.industry.capabilities.slice(0, 6).map((item) => `- ${item.label}: ${item.improve}`),
    `Discuss: https://www.demoretechnologysolutions.com/contact?need=platform&source=website-review&rid=${report.recordId}`,
    "This is a public HTML and file scan. Private Analytics and Search Console accounts were not opened. Rankings, AI citations, and conversion lifts are not guaranteed.",
  ].join("\n");
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
      action: ["contact", "form", "cta", "services", "conversion"].includes(item.id)
        ? `${item.action} For this business, focus on ${industry.journey}.`
        : item.action,
    }));
  const draft = {
    version: 3 as const,
    recordId,
    createdAt: new Date().toISOString(),
    current,
    benchmark,
    industry,
    categories: categoryScores(current.checks),
    offerings: [...additionalOfferings(), ...tailoredAutomation(industry.name, industry.journey, recommendations.map(x=>x.label))],
    methodology:
      "Quick review of returned HTML plus public robots.txt, sitemap.xml, and llms.txt when available. Detected means a matching public signal was found, not that it works or is high quality. Google Analytics, Search Console, and conversion findings are public-tag checks only. Private account data was not read. Not detected does not prove absence; JavaScript-rendered features and other pages may be missed. No form submissions to the live business, speed tests, ranking checks, or accessibility certification were performed. Rankings, AI citations, and conversion lifts are not guaranteed.",
    recommendations,
  };
  return { ...draft, assistantBrief: makeAssistantBrief(draft) };
}

export function unavailableBenchmark(url: string): ReviewPage {
  return {
    url,
    title: "Internal capability reference",
    checks: CHECKS.map((spec) => ({ ...spec, status: "Unavailable", evidence: "Reference page could not be fetched." })),
    unavailable: true,
  };
}
