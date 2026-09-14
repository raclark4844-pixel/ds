export type AppPath =
  | "/"
  | "/websites"
  | "/growth"
  | "/automation"
  | "/contact"
  | "/work"
  | "/process";

export type NavItem = {
  to: AppPath;
  label: string;
  short?: string;
};

export const featuredPills: readonly NavItem[] = [
  { to: "/websites", label: "Websites & ecommerce", short: "Sites" },
  { to: "/growth", label: "Growth & leads", short: "Growth" },
  { to: "/automation", label: "AI & automation", short: "AI" },
];

export const featuredPillsWide = featuredPills;

export const dockTabs: readonly NavItem[] = [
  { to: "/", label: "Home", short: "Home" },
  { to: "/websites", label: "Websites", short: "Sites" },
  { to: "/growth", label: "Growth", short: "Growth" },
  { to: "/automation", label: "Automation", short: "AI" },
  { to: "/contact", label: "Brief", short: "Brief" },
];

export const allMainPages: readonly NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/websites", label: "Websites & Ecommerce" },
  { to: "/growth", label: "Growth & Lead Generation" },
  { to: "/automation", label: "AI & Automation" },
  { to: "/contact", label: "Start a Project" },
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
