import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import {
  dockTabs,
  featuredActive,
  featuredPills,
  pathMatches,
  type AppPath,
} from "@/lib/nav";
import { navIcons } from "@/lib/nav-icons";
import { cn } from "@/lib/utils";

export function FeaturedPills({
  className,
  items = featuredPills,
}: {
  className?: string;
  items?: readonly { to: AppPath; label: string; short?: string }[];
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const three = items.length >= 3;

  return (
    <div className={cn("grid gap-2", three ? "grid-cols-3" : "grid-cols-2", className)}>
      {items.map((item) => {
        const active = featuredActive(item.to, pathname);
        const Icon = navIcons[item.to];
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
            className={cn(
              "group inline-flex min-h-12 items-center justify-center gap-1.5 rounded-pill border px-2 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.16em] no-underline transition-colors duration-200 min-[400px]:px-3 min-[400px]:text-[10px] sm:text-[11px] sm:tracking-[0.18em]",
              active ? "border-volt/50 bg-volt-dim text-volt" : "border-fg/25 bg-transparent text-fg hover:border-fg/45 hover:bg-elevated",
            )}
          >
            <Icon className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate sm:hidden" aria-hidden="true">{item.short ?? item.label}</span>
            <span className="hidden truncate sm:inline" aria-hidden="true">{item.label}</span>
            <ArrowUpRight className="size-3.5 shrink-0 text-muted group-hover:text-fg" aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}

export function SiteDock() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl print:hidden" data-site-dock>
      <div className="mx-auto max-w-6xl px-3 pt-3"><FeaturedPills /></div>
      <nav aria-label="Site sections" className="mx-auto grid max-w-6xl grid-cols-5 px-1 pb-1.5 pt-1.5">
        {dockTabs.map((item) => {
          const Icon = navIcons[item.to];
          const active = pathMatches(item.to, pathname);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-0.5 text-center no-underline transition-colors duration-200",
                active ? "bg-volt-dim text-volt" : "text-muted hover:text-fg",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2 : 1.5} aria-hidden="true" />
              <span className="max-w-full truncate text-[9px] font-medium leading-none tracking-wide min-[400px]:text-[10px]" aria-hidden="true">
                <span className="sm:hidden">{item.short ?? item.label}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
