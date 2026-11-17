export type AppPath =
  | "/"
  | "/control-center"
  | "/platform"
  | "/websites"
  | "/lead-generation"
  | "/growth"
  | "/automation"
  | "/industries"
  | "/contact"
  | "/work"
  | "/process"
  | "/compare";

export type NavItem = {
  to: AppPath;
  label: string;
  short?: string;
};

export const featuredPills: readonly NavItem[] = [
  { to: "/platform", label: "Connected system", short: "Platform" },
  { to: "/websites", label: "Websites & ecommerce", short: "Sites" },
  { to: "/growth", label: "Growth", short: "Growth" },
  { to: "/lead-generation", label: "Lead Engine", short: "Leads" },
  { to: "/automation", label: "AI & automation", short: "AI" },
];

export const featuredPillsWide = featuredPills;

export const dockTabs: readonly NavItem[] = [
  { to: "/", label: "Home", short: "Home" },
  { to: "/platform", label: "Connected system", short: "Platform" },
  { to: "/websites", label: "Websites", short: "Sites" },
  { to: "/growth", label: "Growth", short: "Growth" },
  { to: "/lead-generation", label: "Lead Engine", short: "Leads" },
  { to: "/automation", label: "Automation", short: "AI" },
  { to: "/compare", label: "Compare options", short: "Compare" },
  { to: "/industries", label: "Industries", short: "Industries" },
  { to: "/contact", label: "Start a Project", short: "Brief" },
];

export const allMainPages: readonly NavItem[] = [
  { to: "/control-center", label: "AI Control Center" },
  { to: "/", label: "Home" },
  { to: "/platform", label: "Connected system" },
  { to: "/websites", label: "Websites & Ecommerce" },
  { to: "/growth", label: "Growth" },
  { to: "/lead-generation", label: "Lead Engine" },
  { to: "/automation", label: "AI & Automation" },
  { to: "/industries", label: "Industries" },
  { to: "/work", label: "Work" },
  { to: "/process", label: "Process" },
  { to: "/contact", label: "Start a Project" },
  { to: "/compare", label: "Compare options" },
];

export const laterPages: readonly NavItem[] = [
  { to: "/work", label: "Work" },
  { to: "/process", label: "Process" },
];

export function pathMatches(to: AppPath, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function featuredActive(to: AppPath, pathname: string): boolean {
  return pathMatches(to, pathname);
}
