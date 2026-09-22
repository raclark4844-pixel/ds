export const PLATFORM_ORG_ID = "org_demore_technology_solutions";
export const PLATFORM_ORG_SLUG = "demore-technology-solutions";

const DEFAULT_OWNER_EMAILS = [
  "ryan@demoretechnologysolutions.com",
  "raclark4844@gmail.com",
];

function splitEmails(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function platformOwnerEmails() {
  return [
    ...new Set([
      ...DEFAULT_OWNER_EMAILS,
      ...splitEmails(process.env.PLATFORM_OWNER_EMAILS),
      ...splitEmails(process.env.ADMIN_EMAILS),
    ]),
  ];
}

export function isPlatformOwnerEmail(email: string | null | undefined) {
  const normalized = (email || "").trim().toLowerCase();
  return Boolean(normalized) && platformOwnerEmails().includes(normalized);
}
