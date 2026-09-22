export const PLATFORM_ORG_ID = "org_demore_technology_solutions";
export const PLATFORM_ORG_SLUG = "demore-technology-solutions";

const DEFAULT_OWNER_EMAILS = [
  "ryan@demoretechnologysolutions.com",
  "raclark4844@gmail.com",
];

export function platformOwnerEmails() {
  const extra = (process.env.PLATFORM_OWNER_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...DEFAULT_OWNER_EMAILS, ...extra])];
}

export function isPlatformOwnerEmail(email: string | null | undefined) {
  const normalized = (email || "").trim().toLowerCase();
  return Boolean(normalized) && platformOwnerEmails().includes(normalized);
}
