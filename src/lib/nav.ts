export type AppPath =
  | "/"
  | "/platform"
  | "/websites"
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
  { to: "/platform", label: "AI growth platform", short: "Platform" },
  { to: "/websites", label: "Websites & ecommerce", short: "Sites" },
  { to: "/growth", label: "Growth & leads", short: "Growth" },
  { to: "/automation", label: "AI & automation", short: "AI" },
];

export const featuredPillsWide = featuredPills;

export const dockTabs: readonly NavItem[] = [
  { to: "/", label: "Home", short: "Home" },
  { to: "/platform", label: "Platform", short: "Platform" },
  { to: "/growth", label: "Growth", short: "Growth" },
  { to: "/automation", label: "Automation", short: "AI" },
  { to: "/contact", label: "Brief", short: "Brief" },
];

export const allMainPages: readonly NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/platform", label: "AI Marketing Platform" },
  { to: "/websites", label: "Websites & Ecommerce" },
  { to: "/growth", label: "Growth & Lead Generation" },
  { to: "/automation", label: "AI & Automation" },
  { to: "/industries", label: "Industries" },
  { to: "/work", label: "Work" },
  { to: "/process", label: "Process" },
  { to: "/contact", label: "Start a Project" },
  { to: "/compare", label: "Free Comparison" },
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
