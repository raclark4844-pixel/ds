export type AppPath =
  | "/"
  | "/websites"
  | "/growth"
  | "/automation"
  | "/claims"
  | "/contact"
  | "/work"
  | "/industries"
  | "/industries/landscaping"
  | "/industries/hospitality"
  | "/industries/stores"
  | "/industries/service-companies"
  | "/industries/contractors"
  | "/industries/professionals"
  | "/process";

export type NavItem = {
  to: AppPath;
  label: string;
  short?: string;
};

export const featuredPills: readonly NavItem[] = [
  { to: "/websites", label: "Websites & stores", short: "Sites" },
  { to: "/claims", label: "Claim supplements", short: "Claims" },
  { to: "/growth", label: "Growth stack", short: "Growth" },
];

export const featuredPillsWide = featuredPills;

export const dockTabs: readonly NavItem[] = [
  { to: "/", label: "Home", short: "Home" },
  { to: "/websites", label: "Websites", short: "Sites" },
  { to: "/growth", label: "Growth", short: "Growth" },
  { to: "/automation", label: "Bots", short: "Bots" },
  { to: "/claims", label: "Claims", short: "Claims" },
  { to: "/contact", label: "Brief", short: "Brief" },
];

export const allMainPages: readonly NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/websites", label: "Websites" },
  { to: "/growth", label: "Growth" },
  { to: "/automation", label: "Automation" },
  { to: "/claims", label: "Claims" },
  { to: "/contact", label: "Start a Project" },
];

export const laterPages: readonly NavItem[] = [
  { to: "/work", label: "Work" },
  { to: "/industries", label: "Industries" },
  { to: "/process", label: "Process" },
];

export function pathMatches(to: AppPath, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function featuredActive(to: AppPath, pathname: string): boolean {
  return pathMatches(to, pathname);
}
