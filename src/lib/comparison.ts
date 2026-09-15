/** Snapshot of the current comparison scoring helpers before PDF report implementation. */
export const SCORING_VERSION = "dts-compare-v1";

export const WEIGHTS = {
  seo: 20,
  geo: 15,
  conversion: 15,
  technical: 15,
  aeo: 10,
  ux: 10,
  trust: 10,
  leadgen: 5,
} as const;

export type CategoryKey = keyof typeof WEIGHTS;

export function ratingLabel(score: number) {
  if (score >= 90) return "Market Leading";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Competitive";
  if (score >= 60) return "Developing";
  if (score >= 40) return "Needs Improvement";
  return "Major Opportunity";
}

export function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export type EvidenceTag =
  | "Directly measured"
  | "Publicly detected"
  | "Customer provided"
  | "Third-party sourced"
  | "Estimated"
  | "Unknown"
  | "Not publicly verifiable";

export function scoreFromHtml(html: string, industryKpis: string[]) {
  const text = html.toLowerCase();
  const has = (re: RegExp) => re.test(text);
  const seo = clamp(8 + (has(/<title[^>]*>.{8,}/) ? 4 : 0) + (has(/name=["']description["']/) ? 3 : 0) + (has(/rel=["']canonical["']/) ? 2 : 0) + (has(/application\/ld\+json/) ? 3 : 0), 0, 20);
  const geo = clamp(6 + (has(/address|service area|we serve|locations?/) ? 4 : 0) + (has(/google\.com\/maps|place_id/) ? 3 : 0) + (has(/localbusiness/) ? 2 : 0), 0, 15);
  const conversion = clamp(5 + (has(/<form/) ? 4 : 0) + (has(/tel:|click.to.call|get (a )?quote|request (an )?estimate|book|reserve|order now/) ? 4 : 0) + (has(/type=["']submit["']/) ? 2 : 0), 0, 15);
  const technical = clamp(6 + (has(/viewport/) ? 3 : 0) + (has(/https:\/\//) ? 2 : 0) + (!has(/http:\/\//) ? 2 : 0) + (html.length < 800_000 ? 2 : 0), 0, 15);
  const aeo = clamp(3 + (has(/faq|frequently asked/) ? 3 : 0) + (has(/<h[1-3][^>]*>.{6,}/) ? 2 : 0) + (has(/schema\.org/) ? 2 : 0), 0, 10);
  const ux = clamp(4 + (has(/aria-|alt=/) ? 3 : 0) + (has(/nav/) ? 2 : 0), 0, 10);
  const trust = clamp(3 + (has(/review|testimonial|google rating/) ? 3 : 0) + (has(/licensed|insured|warranty|privacy/) ? 2 : 0) + (has(/about/) ? 2 : 0), 0, 10);
  const leadgen = clamp(1 + (has(/utm_|gtag|gtm\.js|analytics/) ? 2 : 0) + industryKpis.filter((k) => text.includes(k.toLowerCase())).length, 0, 5);
  const categories = { seo, geo, conversion, technical, aeo, ux, trust, leadgen };
  const total = clamp(Object.values(categories).reduce((a, b) => a + b, 0));
  return { categories, total };
}

export function potentialScore(current: number) {
  return clamp(Math.min(92, current + 18 + Math.max(0, 70 - current) * 0.25));
}

export function recommendation(current: number, access?: string) {
  if (current < 48 || access === "provider-controls" || access === "needs-recovery") return "Rebuild";
  if (current < 72) return "Hybrid";
  return "Optimize";
}
