import { CHECKS, METHODOLOGY, OFFERINGS, type AuditCheck, type CheckId } from "./checks";

export type PageAnalysis = {
  url: string;
  title: string;
  checks: AuditCheck[];
  unavailable?: boolean;
};

export type CategoryScore = { name: string; detected: number; total: number };

export type AuditReport = {
  version: 1;
  recordId: string;
  createdAt: string;
  current: PageAnalysis;
  benchmark: PageAnalysis;
  offerings: [string, string][];
  categories: CategoryScore[];
  methodology: string;
  recommendations: AuditCheck[];
};

type FetchedPage = { html: string; url: string };

function decodeHtml(value: string) {
  return value
    .replace(/&/gi, "&")
    .replace(/"/gi, '"')
    .replace(/&#39;|'/gi, "'")
    .replace(/</gi, "<")
    .replace(/>/gi, ">");
}

function tagAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? decodeHtml(match[2].trim()) : "";
}

function innerText(html: string, tag: string) {
  const matches = [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi"))];
  return matches.map((match) => decodeHtml(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()));
}

function flagChecks(page: FetchedPage): AuditCheck[] {
  const html = page.html;
  const title = innerText(html, "title")[0]?.slice(0, 160) || "";
  const h1s = innerText(html, "h1").filter(Boolean);
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const links = [...html.matchAll(/<a\b[^>]*>/gi)].map((match) => ({
    href: tagAttribute(match[0], "href"),
    text: "",
  }));
  const visible = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  let description = "";
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const identity = tagAttribute(match[0], "name");
    if (identity.toLowerCase() === "description") description = tagAttribute(match[0], "content");
  }
  let viewport = "";
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (tagAttribute(match[0], "name").toLowerCase() === "viewport") viewport = tagAttribute(match[0], "content");
  }
  const formHasFields = /<form\b[\s\S]*?<\/form>/i.test(html) && /<(input|textarea|select)\b/i.test(html);
  const flags: Record<CheckId, boolean | null> = {
    title: !!title,
    description: !!description.trim(),
    h1: h1s.length === 1,
    viewport: /width\s*=\s*device-width/i.test(viewport),
    https: page.url.startsWith("https:"),
    alt: images.length ? images.every((tag) => /\balt\s*=/i.test(tag)) : null,
    contact: links.some((l) => /^(tel:|mailto:)|contact|booking|estimate/i.test(l.href)),
    form: formHasFields,
    cta:
      />([^<]*(request|book|contact|get[^<]*quote|shop|buy|start|schedule)[^<]*)</i.test(html) ||
      /<(button|input)[^>]*(submit|book|contact|start)/i.test(html),
    schema: [...html.matchAll(/<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)].some(
      (match) => {
        try {
          const data = JSON.parse(match[2]);
          return data && typeof data === "object" && /"@type"/.test(JSON.stringify(data));
        } catch {
          return false;
        }
      },
    ),
    faq: /frequently asked|\bFAQs?\b|common questions/i.test(visible),
    services: links.some((l) => /service|product|shop|solutions/i.test(l.href)),
  };

  return CHECKS.map((c) => {
    const value = flags[c.id];
    const status: AuditCheck["status"] =
      value === null ? "Not applicable" : value ? "Detected" : "Not detected";
    let evidence = value ? "Signal present in returned page HTML" : "No matching signal in returned page HTML";
    if (c.id === "title" && title) evidence = title;
    if (c.id === "h1") evidence = `${h1s.length} main headings in returned HTML`;
    if (c.id === "alt") {
      evidence = `${images.filter((tag) => /\balt\s*=/i.test(tag)).length} of ${images.length} images have an alt attribute`;
    }
    return { ...c, status, evidence };
  });
}

export function analyzePage(page: FetchedPage): PageAnalysis {
  const title = innerText(page.html, "title")[0]?.slice(0, 160) || new URL(page.url).hostname;
  return { url: page.url, title, checks: flagChecks(page) };
}

export function unavailableProfile(url: string, title: string): PageAnalysis {
  return {
    url,
    title,
    unavailable: true,
    checks: CHECKS.map((c) => ({
      ...c,
      status: "Not applicable" as const,
      evidence: "Reference website was unavailable. No score was invented.",
    })),
  };
}

export function categoryScores(checks: AuditCheck[]): CategoryScore[] {
  return [...new Set(CHECKS.map((c) => c.category))].map((name) => {
    const rows = checks.filter((c) => c.category === name && c.status !== "Not applicable");
    return { name, detected: rows.filter((c) => c.status === "Detected").length, total: rows.length };
  });
}

export function makeReport(current: PageAnalysis, benchmark: PageAnalysis, recordId: string): AuditReport {
  return {
    version: 1,
    recordId,
    createdAt: new Date().toISOString(),
    current,
    benchmark,
    offerings: OFFERINGS,
    categories: categoryScores(current.checks),
    methodology: METHODOLOGY,
    recommendations: current.checks.filter((c) => c.status === "Not detected"),
  };
}
