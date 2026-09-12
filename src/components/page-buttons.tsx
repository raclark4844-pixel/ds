import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { allMainPages, pathMatches, type AppPath, type NavItem } from "@/lib/nav";
import { navIcons } from "@/lib/nav-icons";
import { cn } from "@/lib/utils";

export function PageButtons({
  items,
  current,
  size = "md",
  label,
}: {
  items: readonly NavItem[];
  current?: string;
  size?: "md" | "sm" | "strip";
  label?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label={label ?? "Pages"}
      className={cn(
        size === "strip"
          ? "flex flex-wrap gap-2"
          : cn(
              "grid gap-2",
              size === "md"
                ? "grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
                : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6",
            ),
      )}
    >
      {items.map((item) => {
        const active = pathMatches(item.to, current ?? pathname);
        const Icon = navIcons[item.to];
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border no-underline transition-colors duration-200",
              size === "strip" ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm",
              active
                ? "border-volt/50 bg-volt-dim text-volt"
                : "border-line bg-surface text-fg hover:border-fg/30",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
            <ArrowUpRight
              className="size-3.5 shrink-0 text-muted group-hover:text-fg"
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function CategoryStrip({ current }: { current?: AppPath }) {
  return (
    <PageButtons items={allMainPages} current={current} size="strip" label="All pages" />
  );
}
